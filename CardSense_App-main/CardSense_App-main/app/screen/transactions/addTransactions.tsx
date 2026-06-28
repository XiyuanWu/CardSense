import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TextInputFull from "../../components/textInput/textInputFull";
import ButtonHalf from "../../components/button/buttonHalf";
import DropDown from "../../components/textInput/dropDown";
import {
  getUserCards,
  createTransaction,
  getCardRecommendation,
} from "@/utils/api";

export default function AddTransactionsPage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [cardUsed, setCardUsed] = useState("");
  const [notes, setNotes] = useState("");
  const [bestCard, setBestCard] = useState("");
  const [userCards, setUserCards] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  // Category mapping: frontend display -> backend value
  const categories = [
    { label: "Dining", value: "DINING" },
    { label: "Groceries", value: "GROCERIES" },
    { label: "Gas", value: "GAS" },
    { label: "Online Shopping", value: "ONLINE_SHOPPING" },
    { label: "Entertainment", value: "ENTERTAINMENT" },
    { label: "General Travel", value: "GENERAL_TRAVEL" },
    { label: "Airline Travel", value: "AIRLINE_TRAVEL" },
    { label: "Hotel Travel", value: "HOTEL_TRAVEL" },
    { label: "Transit", value: "TRANSIT" },
    { label: "Pharmacy", value: "PHARMACY" },
    { label: "Rent", value: "RENT" },
    { label: "Other", value: "OTHER" },
  ];

  // Fetch user cards on mount
  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        const response = await getUserCards();
        if (response.success && response.data) {
          const cards = response.data
            .filter((card) => card.is_active)
            .map((card) => ({
              label: card.card_name || `Card ${card.card_id}`,
              value: card.card_id.toString(),
            }));
          setUserCards(cards);
        } else {
          if (!response.success) {
            console.error(
              "Failed to fetch user cards:",
              "error" in response ? response.error : "Unknown error",
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user cards:", error);
      }
    };

    fetchUserCards();
  }, []);

  // Update best card recommendation when category changes
  useEffect(() => {
    if (category) {
      setLoadingRecommendation(true);
      const fetchBestCard = async () => {
        try {
          const response = await getCardRecommendation({
            category: category,
            amount: parseFloat(amount) || 0,
          });
          if (response.success && response.data) {
            const recommendation = response.data.recommendation;
            if (recommendation.best_card) {
              setBestCard(recommendation.best_card.card_name);
            } else {
              setBestCard("No recommendation available");
            }
          } else {
            if (!response.success) {
              console.error(
                "Failed to get card recommendation:",
                "error" in response ? response.error : "Unknown error",
              );
            }
            setBestCard("Unable to get recommendation");
          }
        } catch (error) {
          console.error("Error fetching card recommendation:", error);
          setBestCard("Error loading recommendation");
        } finally {
          setLoadingRecommendation(false);
        }
      };
      fetchBestCard();
    } else {
      setBestCard("");
    }
  }, [category, amount]);

  const handleCancel = () => {
    router.push("/(tabs)/transactions");
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      setAmount(parts[0] + "." + parts.slice(1).join(""));
    } else {
      setAmount(numericValue);
    }
  };

  const handleAdd = async () => {
    // Validate required fields
    if (!merchantName.trim()) {
      Alert.alert("Error", "Please enter a merchant name");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    setLoading(true);
    try {
      const response = await createTransaction({
        merchant: merchantName.trim(),
        amount: parseFloat(amount),
        category: category,
        card_actually_used: cardUsed ? parseInt(cardUsed) : null,
        notes: notes.trim() || null,
      });

      if (response.success) {
        // Clear all form fields
        setMerchantName("");
        setAmount("");
        setCategory("");
        setCardUsed("");
        setNotes("");
        setBestCard("");

        // Navigate back to transactions page - it will auto-refresh due to useFocusEffect
        router.push("/(tabs)/transactions");
      } else {
        const errorMessage =
          "error" in response
            ? response.error.message
            : "Failed to add transaction";
        Alert.alert("Error", errorMessage);
      }
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      Alert.alert("Error", "An error occurred while adding the transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/transactions")}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Add Transactions</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Form Group */}
        <View style={styles.formGroup}>
          {/* Subtitle */}
          <Text style={styles.subtitle}>Add a Transactions</Text>

          {/* Input Fields */}
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Merchant Name"
                value={merchantName}
                onChangeText={setMerchantName}
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Amount($)"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <DropDown
                placeholder="Select Category"
                items={categories}
                selectedValue={category}
                onValueChange={setCategory}
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <DropDown
                placeholder="Select Card (Optional)"
                items={userCards}
                selectedValue={cardUsed}
                onValueChange={setCardUsed}
              />
            </View>
            <View style={styles.inputSpacing} />
            {/* Notes field with higher height */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.notesInput}
                placeholder="Notes(Optional)"
                placeholderTextColor="#777777"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Best Card Recommendation */}
          {category && (
            <View style={styles.bestCardSection}>
              <Text style={styles.bestCardText}>
                Base on your selection, the best card for this category is:
              </Text>
              <View style={styles.bestCardBox}>
                <Text style={styles.bestCardName}>
                  {loadingRecommendation
                    ? "Loading..."
                    : bestCard || "No recommendation"}
                </Text>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <ButtonHalf
              button1={{
                color: "#FFFFFF",
                text: "Cancel",
                border: "#E6EAEF",
                textColor: "#222222",
                onPress: handleCancel,
              }}
              button2={{
                color: "#5E17EB",
                text: loading ? "Adding..." : "Add",
                textColor: "#FFFFFF",
                onPress: handleAdd,
                disabled: loading,
              }}
            />
          </View>
        </View>
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
  formGroup: {
    marginTop: 20, // Space from header
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginLeft: 2, // Align with inputs (37px - 35px padding)
    marginBottom: 15, // Space from subtitle to first input
  },
  inputsContainer: {
    marginBottom: 20, // Space between inputs and buttons
  },
  inputWrapper: {
    marginHorizontal: -15, // Cancel out TextInputFull's marginHorizontal: 15
  },
  inputSpacing: {
    height: 10,
  },
  notesInput: {
    marginHorizontal: 15,
    height: 82, // Higher height for notes
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  bestCardSection: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  bestCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  bestCardBox: {
    width: "100%",
    height: 38,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bestCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  buttonsContainer: {
    marginTop: 15,
    marginHorizontal: -15, // Cancel out ButtonHalf's marginHorizontal: 15 to align with inputs
  },
});
