import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface DropdownItem {
  label: string;
  value: string;
}

interface DropDownProps {
  placeholder: string;
  items: DropdownItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export default function DropDown({
  placeholder,
  items,
  selectedValue,
  onValueChange,
}: DropDownProps) {
  return (
    <View style={styles.dropdownContainer}>
      <View style={styles.pickerWrapper}>
        <View style={styles.pickerInner}>
          <Picker
            selectedValue={selectedValue}
            style={[
              styles.picker,
              selectedValue === "" && styles.pickerPlaceholder,
            ]}
            onValueChange={onValueChange}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label={placeholder} value="" color="#777777" />
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
                color="#222222"
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownContainer: {
    marginHorizontal: 15,
  },
  pickerWrapper: {
    backgroundColor: "#F5F7FA",
    borderRadius: 20,
    height: 50,
  },
  pickerInner: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    paddingRight: 20,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "transparent",
    color: "#222222",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    outlineWidth: 0,
    borderWidth: 0,
    boxShadow: "none",
  },
  pickerPlaceholder: {
    color: "#777777",
  },
  pickerItem: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    height: 50,
  },
});
