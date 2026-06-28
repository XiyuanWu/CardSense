import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CardProps {
  bankName: string;
  cardName: string;
  annualFee: string;
  ftf: string;
  rewards: string[];
  iconType: "+" | "-";
  onPress?: () => void;
}

export default function Card({
  bankName,
  cardName,
  annualFee,
  ftf,
  rewards,
  iconType,
  onPress,
}: CardProps) {
  return (
    <View style={styles.card}>
      {/* Icon Button - Top Right */}
      {onPress && (
        <Pressable style={styles.iconButton} onPress={onPress}>
          {iconType === "+" ? (
            <Ionicons name="add" size={20} color="#000000" />
          ) : (
            <Text style={styles.minusIcon}>-</Text>
          )}
        </Pressable>
      )}

      {/* Bank Name */}
      <Text style={styles.bankName}>{bankName}</Text>

      {/* Card Name */}
      <Text style={styles.cardName}>{cardName}</Text>

      {/* Annual Fee */}
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Annual Fee</Text>
        <Text style={styles.feeValue}>{annualFee}</Text>
      </View>

      {/* FTF */}
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>FTF</Text>
        <Text style={styles.feeValue}>{ftf}</Text>
      </View>

      {/* Rewards Header */}
      <Text style={styles.rewardsHeader}>Rewards</Text>

      {/* Rewards List */}
      <View style={styles.rewardsList}>
        {rewards.map((reward, index) => (
          <Text key={index} style={styles.rewardItem}>
            {reward}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 11,
    minHeight: 146,
    justifyContent: "flex-start",
    position: "relative",
  },
  iconButton: {
    position: "absolute",
    top: 11,
    right: 11,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  minusIcon: {
    fontSize: 20,
    fontWeight: "400",
    color: "#000000",
    lineHeight: 20,
  },
  bankName: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
    marginTop: 0,
    marginBottom: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 14,
    textAlign: "left",
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 1,
  },
  feeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
  },
  feeValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
  },
  rewardsHeader: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
    marginTop: 2,
    marginBottom: 5,
    paddingHorizontal: 1,
  },
  rewardsList: {
    marginBottom: 0,
    paddingHorizontal: 1,
  },
  rewardItem: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#777777",
    marginBottom: 2,
    lineHeight: 11,
  },
});
