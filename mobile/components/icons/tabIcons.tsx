import React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

interface TabIconProps {
  size?: number;
  color?: string;
}

/** Credit card mark (matches CardIcon). */
export function CardsTabIcon({ size = 24, color = "#222222" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Path
        d="M170 28L174 36L182 40L174 44L170 52L166 44L158 40L166 36L170 28Z"
        fill={color}
      />
      <Rect
        x="24"
        y="58"
        width="132"
        height="96"
        rx="14"
        stroke={color}
        strokeWidth="10"
        fill="none"
      />
      <Rect x="24" y="82" width="132" height="22" fill={color} />
      <Rect
        x="36"
        y="118"
        width="46"
        height="18"
        rx="5"
        stroke={color}
        strokeWidth="6"
        fill="none"
      />
    </Svg>
  );
}

export function DashboardTabIcon({ size = 24, color = "#222222" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
      <Rect
        x="13"
        y="3"
        width="8"
        height="5"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
      <Rect
        x="13"
        y="10"
        width="8"
        height="11"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
      <Rect
        x="3"
        y="13"
        width="8"
        height="8"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
    </Svg>
  );
}

export function TransactionsTabIcon({
  size = 24,
  color = "#222222",
}: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 8H17M7 8L9.5 5.5M7 8L9.5 10.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 16H7M17 16L14.5 13.5M17 16L14.5 18.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AccountTabIcon({ size = 24, color = "#222222" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.2" stroke={color} strokeWidth="1.6" />
      <Path
        d="M5.5 19.5C6.4 16.4 8.9 14.5 12 14.5C15.1 14.5 17.6 16.4 18.5 19.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChatTabIcon({ size = 24, color = "#222222" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6.5C4 5.67 4.67 5 5.5 5H18.5C19.33 5 20 5.67 20 6.5V14.5C20 15.33 19.33 16 18.5 16H8L4 19V6.5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <Path
        d="M8 9.5H16M8 12H13"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export type TabIconName = "dashboard" | "transactions" | "cards" | "chat" | "account";

export function TabBarIcon({
  name,
  size = 24,
  color = "#222222",
}: TabIconProps & { name: TabIconName }) {
  switch (name) {
    case "dashboard":
      return <DashboardTabIcon size={size} color={color} />;
    case "transactions":
      return <TransactionsTabIcon size={size} color={color} />;
    case "cards":
      return <CardsTabIcon size={size} color={color} />;
    case "chat":
      return <ChatTabIcon size={size} color={color} />;
    case "account":
      return <AccountTabIcon size={size} color={color} />;
    default:
      return null;
  }
}
