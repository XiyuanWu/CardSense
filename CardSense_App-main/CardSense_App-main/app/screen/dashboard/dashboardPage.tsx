import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import {
  getTransactions,
  TransactionData,
  getBudgets,
  BudgetListItem,
  getDashboardSummary,
} from "@/utils/api";

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

function formatMonthYear(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  const monthNames: Record<string, string> = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };
  return `${monthNames[m] || m} ${y}`;
}

interface Transaction {
  id: string;
  merchant: string;
  date: string;
  category: string;
  amount: number;
}

interface Budget {
  id: string;
  yearMonthKey: string; // YYYY-MM
  monthYear: string;
  budgetAmount: number;
  spentAmount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height,
  );
  const [maxTransactions, setMaxTransactions] = useState(3);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [rewardsEarned, setRewardsEarned] = useState(0);
  const [budgetAlerts, setBudgetAlerts] = useState(0);

  const activeBudgets = allBudgets.length;
  // budgetAlerts now comes from backend summary

  const fetchRecentTransactions = useCallback(async () => {
    try {
      const response = await getTransactions();
      if (response.success && response.data) {
        const transformed: Transaction[] = response.data
          // backend returns newest first already, but keep it explicit/safe
          .slice()
          .map((tx: TransactionData) => ({
            id: tx.id.toString(),
            merchant: tx.merchant,
            date: formatDate(tx.created_at),
            category: CATEGORY_MAP[tx.category] || tx.category,
            amount: parseFloat(tx.amount),
          }));
        setAllTransactions(transformed);
      } else {
        setAllTransactions([]);
      }
    } catch (e) {
      console.error("[Dashboard] Failed to fetch transactions:", e);
      setAllTransactions([]);
    }
  }, []);

  const fetchBudgetsStatus = useCallback(async () => {
    try {
      const res = await getBudgets();
      if (res.success && res.data) {
        const mapped: Budget[] = (res.data as BudgetListItem[]).map((b) => ({
          id: b.id.toString(),
          yearMonthKey: b.year_month,
          monthYear: formatMonthYear(b.year_month),
          budgetAmount: Number(b.amount),
          spentAmount: Number(b.spent),
        }));
        setAllBudgets(mapped);
      } else {
        setAllBudgets([]);
      }
    } catch (e) {
      console.error("[Dashboard] Failed to fetch budgets:", e);
      setAllBudgets([]);
    }
  }, []);

  const fetchDashboardNumbers = useCallback(async () => {
    try {
      const res = await getDashboardSummary();
      if (res.success && res.data) {
        setMonthlySpending(res.data.summary.total_spent_this_month || 0);
        setRewardsEarned(res.data.summary.total_rewards_this_month || 0);
        setBudgetAlerts(res.data.summary.budget_alerts || 0);
      }
    } catch (e) {
      console.error("[Dashboard] Failed to fetch dashboard summary:", e);
    }
  }, []);

  // Refresh when Dashboard tab/screen becomes active
  useFocusEffect(
    useCallback(() => {
      fetchRecentTransactions();
      fetchBudgetsStatus();
      fetchDashboardNumbers();
    }, [fetchRecentTransactions, fetchBudgetsStatus, fetchDashboardNumbers]),
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenHeight(window.height);
    });

    // Calculate max transactions based on available space
    // Account for safe area insets on mobile
    const navBarHeight = Platform.OS === "ios" ? 63 : 63;
    const safeAreaTop = insets.top;
    const safeAreaBottom = insets.bottom;
    const titleHeight = 40;
    const cardsHeight = 500; // Approximate height of cards above transactions
    const transactionHeaderHeight = 50;
    const padding = 40;
    const bottomNavPadding = 80;

    const availableHeight =
      screenHeight -
      safeAreaTop -
      safeAreaBottom -
      navBarHeight -
      titleHeight -
      cardsHeight -
      transactionHeaderHeight -
      padding -
      bottomNavPadding;
    const transactionHeight = 40;
    const calculatedMax = Math.floor(availableHeight / transactionHeight);
    setMaxTransactions(Math.max(2, Math.min(calculatedMax, 3))); // Between 2-3 transactions

    return () => subscription?.remove();
  }, [screenHeight, insets.top, insets.bottom]);

  const displayedTransactions = allTransactions.slice(0, maxTransactions);
  // Get the most recent budget (if any)
  const mostRecentBudget = allBudgets.length > 0 ? allBudgets[0] : null;
  const budgetPercentage = mostRecentBudget
    ? (mostRecentBudget.spentAmount / mostRecentBudget.budgetAmount) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>DashBoard</Text>

          {/* Cards Container */}
          <View style={styles.cardsContainer}>
            {/* This Month's Spending */}
            <View style={[styles.card, styles.cardLeft]}>
              <Text style={styles.cardLabel}>This Month&apos;s Spending</Text>
              <Text style={styles.cardValue}>
                ${monthlySpending.toFixed(2)}
              </Text>
            </View>

            {/* Rewards Earned */}
            <View style={[styles.card, styles.cardLeft]}>
              <Text style={styles.cardLabel}>Rewards Earned</Text>
              <Text style={styles.cardValue}>${rewardsEarned.toFixed(2)}</Text>
            </View>

            {/* Active Budgets & Budget Alerts Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.card, styles.cardShort, styles.cardHalf]}>
                <Text style={styles.cardLabel}>Active Budgets</Text>
                <Text style={styles.cardValue}>{activeBudgets}</Text>
              </View>
              <View style={styles.rowSpacing} />
              <View style={[styles.card, styles.cardShort, styles.cardHalf]}>
                <Text style={styles.cardLabel}>Budget Alerts</Text>
                <Text style={styles.cardValue}>{budgetAlerts}</Text>
              </View>
            </View>

            {/* Budgets Status */}
            <View style={[styles.card, styles.transactionsCard]}>
              <Text style={styles.cardLabel}>Budgets Status</Text>
              {mostRecentBudget === null ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    You don&apos;t have any budget right now. Go and add first
                    one!
                  </Text>
                </View>
              ) : (
                <View style={styles.budgetsList}>
                  <View style={styles.budgetItem}>
                    <View style={styles.budgetLeft}>
                      <Text style={styles.budgetMonthYear}>
                        {mostRecentBudget.monthYear}
                      </Text>
                      <Text style={styles.budgetDetails}>
                        ${mostRecentBudget.spentAmount.toFixed(2)} / $
                        {mostRecentBudget.budgetAmount.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.budgetPercentage}>
                      {budgetPercentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              )}
              <Pressable
                style={styles.linkContainer}
                onPress={() => router.push("/(tabs)/budget")}
              >
                <Text style={styles.linkText}>View all budgets</Text>
                <Ionicons name="chevron-forward" size={14} color="#5E17EB" />
              </Pressable>
            </View>

            {/* Recent Transactions */}
            <View style={[styles.card, styles.transactionsCard]}>
              <Text style={styles.cardLabel}>Recent Transactions</Text>
              {displayedTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    You don&apos;t have any transaction right now. Go and add
                    first one!
                  </Text>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {displayedTransactions.map((transaction, index) => (
                    <View key={transaction.id}>
                      <View style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                          <Text style={styles.transactionMerchant}>
                            {transaction.merchant}
                          </Text>
                          <Text style={styles.transactionDetails}>
                            {transaction.date} • {transaction.category}
                          </Text>
                        </View>
                        <Text style={styles.transactionAmount}>
                          ${transaction.amount.toFixed(2)}
                        </Text>
                      </View>
                      {index < displayedTransactions.length - 1 && (
                        <View style={styles.transactionDivider} />
                      )}
                    </View>
                  ))}
                </View>
              )}
              <Pressable
                style={styles.linkContainer}
                onPress={() => router.push("/(tabs)/transactions")}
              >
                <Text style={styles.linkText}>View all transactions</Text>
                <Ionicons name="chevron-forward" size={14} color="#5E17EB" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Space for nav bar
  },
  content: {
    paddingHorizontal: 35,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    marginBottom: 17,
  },
  cardsContainer: {
    gap: 17,
  },
  card: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 17,
    alignItems: "center",
  },
  cardLeft: {
    alignItems: "flex-start",
  },
  cardShort: {
    height: 88,
    alignItems: "flex-start",
  },
  cardTall: {
    minHeight: 115,
    alignItems: "flex-start",
  },
  cardHalf: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },
  rowContainer: {
    flexDirection: "row",
  },
  rowSpacing: {
    width: 17,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    alignSelf: "flex-end",
  },
  linkText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#5E17EB",
    marginRight: 4,
  },
  budgetsList: {
    width: "100%",
    flex: 1,
  },
  budgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  budgetLeft: {
    flex: 1,
  },
  budgetMonthYear: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  budgetDetails: {
    fontSize: 8,
    fontWeight: "600",
    color: "#777777",
  },
  budgetPercentage: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
  },
  transactionsCard: {
    minHeight: 80,
    alignItems: "flex-start",
  },
  transactionsList: {
    width: "100%",
    flex: 1,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  transactionDetails: {
    fontSize: 8,
    fontWeight: "600",
    color: "#777777",
  },
  transactionAmount: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
  },
  transactionDivider: {
    height: 1,
    backgroundColor: "#E6EAEF",
    marginVertical: 4,
  },
  emptyState: {
    width: "100%",
    paddingBottom: 15,
  },
  emptyStateText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
    textAlign: "left",
  },
});
