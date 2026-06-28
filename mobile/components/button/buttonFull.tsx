import { Pressable, Text, StyleSheet, PressableProps } from "react-native";

interface ButtonFullProps extends Omit<PressableProps, "style"> {
  text: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  border?: string;
  disabled?: boolean;
}

export default function ButtonFull({
  text,
  onPress,
  color = "#5E17EB",
  textColor = "#FFFFFF",
  border,
  disabled = false,
  ...pressableProps
}: ButtonFullProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color },
        border && { borderWidth: 1, borderColor: border },
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...pressableProps}
    >
      <Text
        style={[
          styles.buttonText,
          { color: textColor },
          disabled && styles.textDisabled,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 15,
    paddingVertical: 14,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
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
