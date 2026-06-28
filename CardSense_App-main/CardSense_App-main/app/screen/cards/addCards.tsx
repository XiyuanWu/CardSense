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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import Card from "@/components/cards/card";
import {
  getAvailableCards,
  addUserCard,
  CardData,
  checkAuth,
} from "@/utils/api";

interface AvailableCardData {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: string;
  ftf: string;
  rewards: string[];
}

export default function AddCardsPage() {
  const router = useRouter();
  const [availableCards, setAvailableCards] = useState<AvailableCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCardId, setAddingCardId] = useState<number | null>(null);

  const verifyAuthAndFetchCards = useCallback(async () => {
    // Check if user is authenticated first
    const authResponse = await checkAuth();

    if (!authResponse.success) {
      console.error("[AddCards] User not authenticated:", authResponse);
      setError(
        "Please log in to view cards. " + (authResponse as any).error?.message,
      );
      setIsLoading(false);
      return;
    }

    console.log("[AddCards] User authenticated, fetching cards...");
    fetchCards();
  }, []);

  // Fetch available cards on component mount
  useEffect(() => {
    // First verify authentication, then fetch cards
    verifyAuthAndFetchCards();
  }, [verifyAuthAndFetchCards]);

  const fetchCards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAvailableCards();

      console.log("[AddCards] Response:", response);

      if (response.success && response.data) {
        console.log("[AddCards] Mapping", response.data.length, "cards");
        // Map API response to component format
        const mappedCards: AvailableCardData[] = response.data.map(
          (card: CardData) => {
            // Format rewards from reward_rules
            const rewards: string[] = [];
            if (card.reward_rules && card.reward_rules.length > 0) {
              card.reward_rules.forEach((rule: any) => {
                if (rule.multiplier && rule.category) {
                  const categories = Array.isArray(rule.category)
                    ? rule.category.join(", ")
                    : rule.category;
                  rewards.push(`${rule.multiplier}x on ${categories}`);
                }
              });
            }

            // Format benefits
            if (card.benefits && card.benefits.length > 0) {
              card.benefits.forEach((benefit: any) => {
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
              id: card.id.toString(),
              bankName: card.issuer,
              cardName: card.name,
              annualFee: `$${card.annual_fee}`,
              ftf: card.ftf ? "Yes" : "No",
              rewards:
                rewards.length > 0
                  ? rewards
                  : ["No rewards information available"],
            };
          },
        );

        setAvailableCards(mappedCards);
      } else {
        const errorResponse = response as any;
        console.error("[AddCards] Error response:", errorResponse);
        const errorMessage =
          errorResponse.error?.message ||
          errorResponse.error?.code ||
          "Failed to load cards";
        setError(errorMessage);

        // If unauthorized, suggest checking authentication
        if (
          errorResponse.error?.code === "UNAUTHORIZED" ||
          errorMessage.includes("401")
        ) {
          setError("Please log in to view cards. " + errorMessage);
        }
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (cardId: string) => {
    const cardIdNum = parseInt(cardId, 10);
    if (isNaN(cardIdNum)) {
      Alert.alert("Error", "Invalid card ID");
      return;
    }

    setAddingCardId(cardIdNum);

    try {
      const response = await addUserCard(cardIdNum);

      if (response.success) {
        // Show alert message
        if (Platform.OS === "web") {
          // For web, use browser alert
          alert("Card added");
        } else {
          // For mobile, use Alert.alert
          Alert.alert("Card Added", "Card added");
        }

        // Navigate back to cards page after showing alert
        // Small delay for web to ensure alert is visible
        setTimeout(
          () => {
            router.push("/(tabs)/cards");
          },
          Platform.OS === "web" ? 200 : 100,
        );
      } else {
        // Handle API errors
        const errorResponse = response as any;
        let errorMessage = errorResponse.error?.message || "Failed to add card";

        // Check for details in different possible locations
        if (errorResponse.error?.details) {
          // Check for non_field_errors first (Django validation errors)
          if (
            errorResponse.error.details.non_field_errors &&
            Array.isArray(errorResponse.error.details.non_field_errors)
          ) {
            errorMessage = errorResponse.error.details.non_field_errors[0];
          } else if (Object.keys(errorResponse.error.details).length > 0) {
            // Extract first error from any field
            const firstKey = Object.keys(errorResponse.error.details)[0];
            const firstError = errorResponse.error.details[firstKey];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            } else if (typeof firstError === "string") {
              errorMessage = firstError;
            } else {
              errorMessage = Object.values(errorResponse.error.details)
                .flat()
                .join(", ");
            }
          }
        } else if (errorResponse.error?.detail) {
          errorMessage = errorResponse.error.detail;
        }

        console.error("[AddCards] Add card error:", errorResponse);
        Alert.alert("Error", errorMessage);
      }
    } catch (err) {
      console.error("Error adding card:", err);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setAddingCardId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/cards")}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Add Cards</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Cards</Text>
          <Text style={styles.sectionDescription}>
            Browse our database of credit cards to find the best fit for you!
          </Text>
        </View>

        {/* Cards List - Scrollable */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5E17EB" />
            <Text style={styles.loadingText}>Loading cards...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchCards}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : availableCards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cards available</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardsList}>
              {availableCards.map((card) => (
                <View key={card.id} style={styles.cardWrapper}>
                  <Card
                    bankName={card.bankName}
                    cardName={card.cardName}
                    annualFee={card.annualFee}
                    ftf={card.ftf}
                    rewards={card.rewards}
                    iconType="+"
                    onPress={() => {
                      if (addingCardId !== parseInt(card.id, 10)) {
                        handleAddCard(card.id);
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
    paddingBottom: 20, // No nav bar on this page
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardsList: {
    gap: 15,
  },
  cardWrapper: {
    width: "100%",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777777",
  },
});
