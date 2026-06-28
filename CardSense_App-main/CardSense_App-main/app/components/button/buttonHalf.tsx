import { View, Pressable, Text, StyleSheet } from "react-native";

interface ButtonConfig {
  text: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  border?: string;
  disabled?: boolean;
}

interface ButtonHalfProps {
  button1: ButtonConfig;
  button2: ButtonConfig;
}

export default function ButtonHalf({ button1, button2 }: ButtonHalfProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: button1.color || "#FFFFFF" },
          button1.border && { borderWidth: 1, borderColor: button1.border },
          button1.disabled && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={button1.onPress}
        disabled={button1.disabled}
      >
        <Text
          style={[
            styles.buttonText,
            { color: button1.textColor || "#222222" },
            button1.disabled && styles.textDisabled,
          ]}
        >
          {button1.text}
        </Text>
      </Pressable>

      <View style={styles.spacing} />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: button2.color || "#5E17EB" },
          button2.border && { borderWidth: 1, borderColor: button2.border },
          button2.disabled && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={button2.onPress}
        disabled={button2.disabled}
      >
        <Text
          style={[
            styles.buttonText,
            { color: button2.textColor || "#FFFFFF" },
            button2.disabled && styles.textDisabled,
          ]}
        >
          {button2.text}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 15,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  spacing: {
    width: 17,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  textDisabled: {
    opacity: 0.6,
  },
});
