import { TextInput, StyleSheet, TextInputProps } from "react-native";

interface TextInputFullProps extends TextInputProps {
  placeholder: string;
}

export default function TextInputFull({
  placeholder,
  ...props
}: TextInputFullProps) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#777777"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginHorizontal: 15,
    height: 50,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
});
