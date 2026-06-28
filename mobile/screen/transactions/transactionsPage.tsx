import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import ButtonSeventy from "@/components/button/buttonSeventy";
import { getTransactions, TransactionData } from "@/utils/api";

interface Transaction {
  id: string;
  merchant: string;
  date: string; // Formatted date for display
  dateKey?: string; // Date key for grouping (YYYY-MM-DD)
  category: string;
  amount: number;
  earned: number;
}

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}

// Category mapping: backend code -> display name
const categoryMap: Record<string, string> = {
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

// Format date for display (full date with month name)
function formatDate(dateString: string): string {
  try {
    // Handle YYYY-MM-DD format directly
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-");
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
      return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
    }
    // Handle ISO date string or other formats
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

// Extract date only (YYYY-MM-DD) from date string for grouping
// Uses local timezone to match user's local date
function extractDateOnly(dateString: string): string {
  try {
    // If it's already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Parse the date string and extract date parts using LOCAL timezone
    const date = new Date(dateString);
    // Use local methods to get the date in user's timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    // If parsing fails, try to extract just the date part from ISO string
    // But be careful - this might be UTC date, so we should parse it properly
    const datePart = dateString.split("T")[0];
    if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Parse it as a date to convert to local timezone
      const date = new Date(datePart + "T00:00:00");
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return dateString;
  }
}

// Group transactions by date
function groupTransactionsByDate(
  transactions: Transaction[],
): TransactionGroup[] {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    // Use dateKey for grouping (YYYY-MM-DD format)
    const dateKey = transaction.dateKey || transaction.date;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });

  // Convert to array and sort by date (newest first)
  return Object.keys(groups)
    .sort((a, b) => {
      // Compare date strings (YYYY-MM-DD format sorts correctly)
      return b.localeCompare(a);
    })
    .map((dateKey) => {
      // Format the date key for display in header
      const formattedDate = formatDate(dateKey);
      return {
        date: formattedDate,
        transactions: groups[dateKey],
      };
    });
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactionGroups, setTransactionGroups] = useState<
    TransactionGroup[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTransactions();
      if (response.success && response.data) {
        // Transform backend data to frontend format
        const transformedTransactions: Transaction[] = response.data.map(
          (tx: TransactionData) => {
            // Extract date key first (YYYY-MM-DD) for consistent grouping
            const dateKey = extractDateOnly(tx.created_at);
            // Format the same date key for display to ensure consistency
            const formattedDate = formatDate(dateKey);

            return {
              id: tx.id.toString(),
              merchant: tx.merchant,
              date: formattedDate, // Use formatted dateKey to ensure it matches the group header
              dateKey: dateKey, // Date key for grouping (YYYY-MM-DD)
              category: categoryMap[tx.category] || tx.category,
              amount: parseFloat(tx.amount),
              earned: parseFloat(tx.actual_reward || "0"),
            };
          },
        );

        // Group by date
        const grouped = groupTransactionsByDate(transformedTransactions);
        setTransactionGroups(grouped);
      } else {
        console.error("Failed to fetch transactions");
        setTransactionGroups([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactionGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transactions when page is focused (e.g., after adding a transaction)
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions]),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              router.push("/(tabs)/addTransactions");
            }}
          >
            <Ionicons name="add" size={24} color="#000000" />
          </Pressable>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5E17EB" />
          </View>
        ) : transactionGroups.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateContent}>
              <Text style={styles.emptyStateTitle}>
                You don&apos;t have a transactions yet.{"\n"}Add one now!
              </Text>
              <ButtonSeventy
                text="Add Transactions"
                onPress={() => router.push("/(tabs)/addTransactions")}
              />
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {transactionGroups.map((group, groupIndex) => (
              <View key={group.date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{group.date}</Text>
                <View style={styles.transactionsList}>
                  {group.transactions.map((transaction, index) => (
                    <Pressable
                      key={transaction.id}
                      style={styles.transactionCard}
                      onPress={() => {
                        router.push({
                          pathname: "/(tabs)/transactionsDetail",
                          params: { transactionId: transaction.id },
                        });
                      }}
                    >
                      <View style={styles.transactionLeft}>
                        <Text style={styles.merchantName}>
                          {transaction.merchant}
                        </Text>
                        <Text style={styles.transactionDetails}>
                          {transaction.date} • {transaction.category}
                        </Text>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text style={styles.transactionAmount}>
                          ${transaction.amount.toFixed(2)}
                        </Text>
                        <Text style={styles.earnedText}>
                          ${transaction.earned.toFixed(2)} Earned
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
                {groupIndex < transactionGroups.length - 1 && (
                  <View style={styles.groupSpacing} />
                )}
              </View>
            ))}
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
  dateGroup: {
    marginBottom: 10,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 9,
  },
  transactionsList: {
    gap: 9,
  },
  transactionCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 19,
    height: 59,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLeft: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 2,
  },
  transactionDetails: {
    fontSize: 8,
    fontWeight: "600",
    color: "#777777",
  },
  transactionRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 2,
  },
  earnedText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#777777",
  },
  groupSpacing: {
    height: 10,
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
  addButtonEmpty: {
    backgroundColor: "#5E17EB",
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "70%",
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
