import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TextInputFull from "../../components/textInput/textInputFull";
import ButtonHalf from "../../components/button/buttonHalf";
import DropDown from "../../components/textInput/dropDown";
import { createBudget } from "@/utils/api";

export default function AddBudgetPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    // Navigate back to budgetPage
    router.push("/(tabs)/budget");
  };

  const handleBudgetAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      setBudgetAmount(parts[0] + "." + parts.slice(1).join(""));
    } else {
      setBudgetAmount(numericValue);
    }
  };

  const handleAdd = async () => {
    if (!selectedMonth || !selectedYear) {
      const msg = "Please select month and year";
      if (Platform.OS === "web" && typeof window !== "undefined")
        window.alert(msg);
      else Alert.alert("Error", msg);
      return;
    }
    const amountNum = parseFloat(budgetAmount);
    if (!budgetAmount || Number.isNaN(amountNum) || amountNum <= 0) {
      const msg = "Please enter a valid budget amount";
      if (Platform.OS === "web" && typeof window !== "undefined")
        window.alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    const monthMap: Record<string, string> = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    const monthNum = monthMap[selectedMonth];
    const yearMonth = `${selectedYear}-${monthNum}`;

    setLoading(true);
    try {
      const res = await createBudget({
        amount: amountNum,
        year_month: yearMonth,
      });
      if (res.success) {
        // clear form
        setSelectedMonth("");
        setSelectedYear("");
        setBudgetAmount("");
        // go back to list; list will refresh on focus
        router.push("/(tabs)/budget");
      } else {
        const msg =
          "error" in res ? res.error.message : "Failed to create budget";
        if (Platform.OS === "web" && typeof window !== "undefined")
          window.alert(msg);
        else Alert.alert("Error", msg);
      }
    } catch (e) {
      console.error("[AddBudget] create failed:", e);
      const msg = "An error occurred while creating the budget";
      if (Platform.OS === "web" && typeof window !== "undefined")
        window.alert(msg);
      else Alert.alert("Error", msg);
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
            onPress={() => router.push("/(tabs)/budget")}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Add Budgets</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Form Group */}
        <View style={styles.formGroup}>
          {/* Subtitle */}
          <Text style={styles.subtitle}>Add a budget</Text>

          {/* Input Fields */}
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <DropDown
                placeholder="Select Month"
                items={[
                  { label: "Jan", value: "Jan" },
                  { label: "Feb", value: "Feb" },
                  { label: "Mar", value: "Mar" },
                  { label: "Apr", value: "Apr" },
                  { label: "May", value: "May" },
                  { label: "Jun", value: "Jun" },
                  { label: "Jul", value: "Jul" },
                  { label: "Aug", value: "Aug" },
                  { label: "Sep", value: "Sep" },
                  { label: "Oct", value: "Oct" },
                  { label: "Nov", value: "Nov" },
                  { label: "Dec", value: "Dec" },
                ]}
                selectedValue={selectedMonth}
                onValueChange={setSelectedMonth}
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <DropDown
                placeholder="Select Year"
                items={[
                  { label: "2025", value: "2025" },
                  { label: "2026", value: "2026" },
                  { label: "2027", value: "2027" },
                  { label: "2028", value: "2028" },
                  { label: "2029", value: "2029" },
                  { label: "2030", value: "2030" },
                ]}
                selectedValue={selectedYear}
                onValueChange={setSelectedYear}
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Budget Amount"
                value={budgetAmount}
                onChangeText={handleBudgetAmountChange}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

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
  buttonsContainer: {
    marginTop: 15,
    marginHorizontal: -15, // Cancel out ButtonHalf's marginHorizontal: 15 to align with inputs
  },
});
