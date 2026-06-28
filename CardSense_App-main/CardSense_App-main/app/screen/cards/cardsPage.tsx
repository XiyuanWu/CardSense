import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import ButtonSeventy from "@/components/button/buttonSeventy";
import Card from "@/components/cards/card";
import {
  getUserCards,
  deleteUserCard,
  getAvailableCards,
  UserCardData,
  CardData,
} from "@/utils/api";

interface UserCard {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: string;
  ftf: string;
  rewards: string[];
}

export default function CardsPage() {
  const router = useRouter();
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  // Fetch user cards when page is focused (refreshes after adding card)
  useFocusEffect(
    useCallback(() => {
      fetchUserCards();
    }, []),
  );

  const fetchUserCards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserCards();

      if (response.success && response.data) {
        // We need to get full card details for each user card
        // First, get all available cards to match with user cards
        const cardsResponse = await getAvailableCards();
        const allCards: CardData[] =
          cardsResponse.success && cardsResponse.data ? cardsResponse.data : [];

        // Map user cards with full card details
        const mappedCards: UserCard[] = response.data
          .filter((userCard: UserCardData) => userCard.is_active) // Only show active cards
          .map((userCard: UserCardData) => {
            // Find the full card details
            const cardDetails = allCards.find(
              (c: CardData) =>
                c.id === userCard.card_id || c.id === userCard.card,
            );

            if (cardDetails) {
              // Format rewards from reward_rules
              const rewards: string[] = [];
              if (
                cardDetails.reward_rules &&
                cardDetails.reward_rules.length > 0
              ) {
                cardDetails.reward_rules.forEach((rule: any) => {
                  if (rule.multiplier && rule.category) {
                    const categories = Array.isArray(rule.category)
                      ? rule.category.join(", ")
                      : rule.category;
                    rewards.push(`${rule.multiplier}x on ${categories}`);
                  }
                });
              }

              // Format benefits
              if (cardDetails.benefits && cardDetails.benefits.length > 0) {
                cardDetails.benefits.forEach((benefit: any) => {
                  if (benefit.benefits && Array.isArray(benefit.benefits)) {
                    benefit.benefits.forEach((b: string) => {
                      if (b && !rewards.includes(b)) {
                        rewards.push(b);
                      }
                    });
                  }
                });
              }

              return {
                id: userCard.id.toString(),
                bankName: cardDetails.issuer,
                cardName: cardDetails.name,
                annualFee: `$${cardDetails.annual_fee}`,
                ftf: cardDetails.ftf ? "Yes" : "No",
                rewards:
                  rewards.length > 0
                    ? rewards
                    : ["No rewards information available"],
              };
            } else {
              // Fallback if card details not found - use card_name from userCard
              return {
                id: userCard.id.toString(),
                bankName:
                  userCard.card_name.split("(")[1]?.replace(")", "") ||
                  "Unknown",
                cardName:
                  userCard.card_name.split("(")[0]?.trim() || "Unknown Card",
                annualFee: "N/A",
                ftf: "N/A",
                rewards: ["Card details not available"],
              };
            }
          });

        setUserCards(mappedCards);
      } else {
        const errorResponse = response as any;
        setError(errorResponse.error?.message || "Failed to load cards");
      }
    } catch (err) {
      console.error("Error fetching user cards:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("[CardsPage] handleDelete called with id:", id);
    const userCardId = parseInt(id, 10);
    if (isNaN(userCardId)) {
      console.error("[CardsPage] Invalid card ID:", id);
      Alert.alert("Error", "Invalid card ID");
      return;
    }

    console.log(
      "[CardsPage] Showing confirmation dialog for card ID:",
      userCardId,
    );

    // For web, use browser confirm dialog; for mobile, use Alert.alert
    if (Platform.OS === "web") {
      const confirmed = confirm(
        "Are you sure you want to remove this card from your wallet?",
      );
      if (!confirmed) {
        console.log("[CardsPage] Delete cancelled");
        return;
      }

      console.log("[CardsPage] Delete confirmed, proceeding with deletion");
      setDeletingCardId(id);

      try {
        console.log(
          "[CardsPage] Attempting to delete card with ID:",
          userCardId,
        );
        const response = await deleteUserCard(userCardId);
        console.log("[CardsPage] Delete response:", response);

        if (response.success) {
          console.log(
            "[CardsPage] Delete successful, showing message and refreshing",
          );
          alert("Card deleted");

          // Refresh the cards list (card will disappear)
          await fetchUserCards();
          console.log("[CardsPage] Cards list refreshed after deletion");
        } else {
          const errorResponse = response as any;
          const errorMessage =
            errorResponse.error?.message || "Failed to delete card";
          console.error("[CardsPage] Delete failed:", errorResponse);
          alert(`Error: ${errorMessage}`);
        }
      } catch (err) {
        console.error("[CardsPage] Error deleting card:", err);
        alert("An unexpected error occurred. Please try again.");
      } finally {
        setDeletingCardId(null);
      }
    } else {
      // For mobile, use Alert.alert
      Alert.alert(
        "Delete Card",
        "Are you sure you want to remove this card from your wallet?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              console.log("[CardsPage] Delete cancelled");
            },
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              console.log(
                "[CardsPage] Delete confirmed, proceeding with deletion",
              );
              setDeletingCardId(id);

              try {
                console.log(
                  "[CardsPage] Attempting to delete card with ID:",
                  userCardId,
                );
                const response = await deleteUserCard(userCardId);
                console.log("[CardsPage] Delete response:", response);

                if (response.success) {
                  console.log(
                    "[CardsPage] Delete successful, showing message and refreshing",
                  );
                  Alert.alert("Card Deleted", "Card deleted");

                  // Refresh the cards list (card will disappear)
                  await fetchUserCards();
                  console.log(
                    "[CardsPage] Cards list refreshed after deletion",
                  );
                } else {
                  const errorResponse = response as any;
                  const errorMessage =
                    errorResponse.error?.message || "Failed to delete card";
                  console.error("[CardsPage] Delete failed:", errorResponse);
                  Alert.alert("Error", errorMessage);
                }
              } catch (err) {
                console.error("[CardsPage] Error deleting card:", err);
                Alert.alert(
                  "Error",
                  "An unexpected error occurred. Please try again.",
                );
              } finally {
                setDeletingCardId(null);
              }
            },
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cards</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              router.push("/(tabs)/addCards");
            }}
          >
            <Ionicons name="add" size={24} color="#000000" />
          </Pressable>
        </View>

        {/* Cards List or Empty State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5E17EB" />
            <Text style={styles.loadingText}>Loading cards...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchUserCards}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : userCards.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateContent}>
              <Text style={styles.emptyStateTitle}>
                You don&apos;t have a card yet.{"\n"}Add one now!
              </Text>
              <ButtonSeventy
                text="Add Cards"
                onPress={() => {
                  router.push("/(tabs)/addCards");
                }}
              />
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Cards</Text>
              <Text style={styles.sectionDescription}>
                Here is a list all your current cards.
              </Text>
            </View>

            {/* Cards List */}
            <View style={styles.cardsList}>
              {userCards.map((card) => (
                <View key={card.id} style={styles.cardWrapper}>
                  <Card
                    bankName={card.bankName}
                    cardName={card.cardName}
                    annualFee={card.annualFee}
                    ftf={card.ftf}
                    rewards={card.rewards}
                    iconType="-"
                    onPress={() => {
                      console.log(
                        "[CardsPage] Card delete button pressed for card ID:",
                        card.id,
                      );
                      console.log(
                        "[CardsPage] Current deletingCardId:",
                        deletingCardId,
                      );
                      if (deletingCardId !== card.id) {
                        handleDelete(card.id);
                      } else {
                        console.log(
                          "[CardsPage] Delete already in progress for this card",
                        );
                      }
                    }}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 80, // Space for nav bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    marginLeft: 30,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 21,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
  },
  cardsList: {
    gap: 15,
  },
  cardWrapper: {
    width: "100%",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateContent: {
    alignItems: "center",
    gap: 16,
    width: 350,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    lineHeight: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#777777",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#5E17EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
