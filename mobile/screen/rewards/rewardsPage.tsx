import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import ButtonSeventy from "@/components/button/buttonSeventy";
import {
  getCardRewards,
  type CardRewardItem,
} from "@/utils/api/cards";
import { getTransactions, type TransactionData } from "@/utils/api/transactions";

const CATEGORY_MAP: Record<string, string> = {
  DINING: "Dining",
  GROCERIES: "Groceries",
  GAS: "Gas",
  ONLINE_SHOPPING: "Online Shopping",
  ENTERTAINMENT: "Entertainment",
  GENERAL_TRAVEL: "General Travel",
  AIRLINE_TRAVEL: "Airline Travel",
  HOTEL_TRAVEL: "Hotel Travel",
  TRANSIT: "Transit",
  PHARMACY: "Pharmacy",
  RENT: "Rent",
  OTHER: "Other",
  SELECTED_CATEGORIES: "Selected Categories",
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch {
    return dateString;
  }
}

export default function RewardsPage() {
  const router = useRouter();
  const [cardRewards, setCardRewards] = useState<CardRewardItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rewardsRes, txRes] = await Promise.all([
        getCardRewards(),
        getTransactions(),
      ]);

      if (rewardsRes.success && rewardsRes.data) {
        setCardRewards(rewardsRes.data);
      } else {
        setCardRewards([]);
      }

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      } else {
        setTransactions([]);
      }

      if (!rewardsRes.success && !txRes.success) {
        setError("Failed to load rewards data");
      }
    } catch {
      setError("Failed to load rewards data");
      setCardRewards([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const totalRewards = cardRewards.reduce(
    (sum, card) => sum + (card.rewards_earned || 0),
    0,
  );

  const recentWithRewards = transactions.slice(0, 10);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Rewards Breakdown</Text>
          <View style={styles.iconButton} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#5E17EB" />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.totalBanner}>
              <View style={styles.totalTextBlock}>
                <Text style={styles.totalLabel}>Total Rewards This Month</Text>
                <Text style={styles.totalValue}>${totalRewards.toFixed(2)}</Text>
                <Text style={styles.totalMeta}>
                  Based on {transactions.length} transaction
                  {transactions.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.totalIcon}>
                <Ionicons name="cash-outline" size={28} color="#16A34A" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Rewards by Card</Text>

            {cardRewards.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="trending-up" size={28} color="#5E17EB" />
                <Text style={styles.emptyTitle}>No rewards yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add transactions to start earning rewards!
                </Text>
                <ButtonSeventy
                  text="Add Transaction"
                  onPress={() => router.push("/(tabs)/addTransactions")}
                />
              </View>
            ) : (
              <View style={styles.cardList}>
                {cardRewards.map((card) => (
                  <View key={card.card_id} style={styles.rewardCard}>
                    <View style={styles.rewardCardTop}>
                      <View style={styles.rewardCardInfo}>
                        <Text style={styles.rewardCardName}>{card.card_name}</Text>
                        <Text style={styles.rewardCardIssuer}>
                          {card.card_issuer}
                        </Text>
                      </View>
                      <Ionicons
                        name="card-outline"
                        size={22}
                        color="#16A34A"
                      />
                    </View>
                    <Text style={styles.rewardCardLabel}>Earned This Month</Text>
                    <Text style={styles.rewardCardAmount}>
                      ${card.rewards_earned.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {recentWithRewards.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Recent Transactions with Rewards
                </Text>
                <View style={styles.txList}>
                  {recentWithRewards.map((tx, index) => {
                    const reward = parseFloat(tx.actual_reward || "0");
                    const cardName =
                      tx.card_actually_used_details?.name ||
                      tx.recommended_card_details?.name ||
                      "N/A";
                    return (
                      <View key={tx.id}>
                        <View style={styles.txRow}>
                          <View style={styles.txLeft}>
                            <Text style={styles.txMerchant}>{tx.merchant}</Text>
                            <Text style={styles.txMeta}>
                              {formatDate(tx.created_at)} · {cardName}
                            </Text>
                            <Text style={styles.txCategory}>
                              {CATEGORY_MAP[tx.category] || tx.category}
                            </Text>
                          </View>
                          <View style={styles.txRight}>
                            <Text style={styles.txAmount}>
                              ${parseFloat(tx.amount).toFixed(2)}
                            </Text>
                            <Text style={styles.txReward}>
                              +${reward.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                        {index < recentWithRewards.length - 1 && (
                          <View style={styles.divider} />
                        )}
                      </View>
                    );
                  })}
                </View>
                {transactions.length > 10 && (
                  <Pressable
                    style={styles.viewAllLink}
                    onPress={() => router.push("/(tabs)/transactions")}
                  >
                    <Text style={styles.viewAllText}>View All Transactions →</Text>
                  </Pressable>
                )}
              </>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>How Rewards Are Calculated</Text>
              <Text style={styles.infoText}>
                Rewards are based on each card&apos;s multiplier for the
                transaction category. Use the best card per category to maximize
                earnings.
              </Text>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 16,
  },
  errorText: {
    color: "#DC2527",
    fontSize: 14,
    marginBottom: 4,
  },
  totalBanner: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 4,
  },
  totalMeta: {
    fontSize: 12,
    color: "#4B5563",
  },
  totalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  cardList: {
    gap: 12,
  },
  rewardCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 17,
  },
  rewardCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  rewardCardInfo: {
    flex: 1,
    paddingRight: 8,
  },
  rewardCardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 4,
  },
  rewardCardIssuer: {
    fontSize: 12,
    fontWeight: "600",
    color: "#777777",
    textTransform: "uppercase",
  },
  rewardCardLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  rewardCardAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#16A34A",
  },
  txList: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 12,
  },
  txLeft: {
    flex: 1,
    minWidth: 0,
  },
  txMerchant: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  txMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  txCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5E17EB",
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  txReward: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16A34A",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6EAEF",
  },
  viewAllLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5E17EB",
  },
  infoBox: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },
});
