import React from "react";
import { Text, StyleSheet, type TextStyle } from "react-native";

function stripMarkdownForDisplay(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

interface ChatMessageTextProps {
  text: string;
  style?: TextStyle;
  boldStyle?: TextStyle;
}

/**
 * Lightweight markdown for mobile: **bold** segments render heavier weight.
 */
export function ChatMessageText({
  text,
  style,
  boldStyle,
}: ChatMessageTextProps) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) {
    return <Text style={style}>{stripMarkdownForDisplay(text)}</Text>;
  }

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={[style, boldStyle, styles.bold]}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return (
          <Text key={index} style={style}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: "700",
  },
});
