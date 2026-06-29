import React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

interface TabIconProps {
  size?: number;
  color?: string;
}

/** Credit card mark (matches web CardIcon). */
export function CardsTabIcon({ size = 24, color = "#222222" }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 4.5L18.8 6.3L20.6 7.1L18.8 7.9L18 9.7L17.2 7.9L15.4 7.1L17.2 6.3L18 4.5Z"
        fill={color}
      />
      <Rect
        x="3"
        y="7"
        width="16"
        height="11"
        rx="2.5"
        stroke={color}
        strokeWidth="1.6"
      />
      <Rect x="3" y="10" width="16" height="3" fill={color} />
      <Rect
        x="5"
        y="14.5"
        width="5"
        height="2"
        rx="0.8"
        stroke={color}
        strokeWidth="1"
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

export type TabIconName = "dashboard" | "transactions" | "cards" | "account";

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
    case "account":
      return <AccountTabIcon size={size} color={color} />;
    default:
      return null;
  }
}
