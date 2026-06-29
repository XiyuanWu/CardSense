import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface CardIconProps {
  size?: number;
  color?: string;
}

/** CardSense mark — matches web CardIcon / cardsense-icon.png */
export default function CardIcon({
  size = 32,
  color = "#5E17EB",
}: CardIconProps) {
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
