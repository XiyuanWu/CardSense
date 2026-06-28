import { View, TextInput, StyleSheet, TextInputProps } from "react-native";

interface TextInputHalfProps {
  placeholder1: string;
  placeholder2: string;
  value1?: string;
  value2?: string;
  onChangeText1?: (text: string) => void;
  onChangeText2?: (text: string) => void;
  input1Props?: TextInputProps;
  input2Props?: TextInputProps;
}

export default function TextInputHalf({
  placeholder1,
  placeholder2,
  value1,
  value2,
  onChangeText1,
  onChangeText2,
  input1Props,
  input2Props,
}: TextInputHalfProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder1}
          placeholderTextColor="#777777"
          value={value1}
          onChangeText={onChangeText1}
          {...input1Props}
        />
      </View>
      <View style={styles.spacing} />
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder2}
          placeholderTextColor="#777777"
          value={value2}
          onChangeText={onChangeText2}
          {...input2Props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 18,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
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
  spacing: {
    width: 18,
  },
});
