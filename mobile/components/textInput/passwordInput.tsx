import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps extends TextInputProps {
  placeholder: string;
}

export default function PasswordInput({
  placeholder,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#777777"
        secureTextEntry={!visible}
        {...props}
      />
      <Pressable
        style={styles.toggle}
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
      >
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#777777"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 15,
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 50,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  toggle: {
    position: "absolute",
    right: 14,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
