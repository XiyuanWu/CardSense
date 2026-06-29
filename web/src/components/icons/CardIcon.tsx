import React from "react";

interface CardIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * CardSense mark — credit card + sparkle (icon only, no wordmark).
 */
const CardIcon: React.FC<CardIconProps> = ({
  size = 32,
  color,
  className = "",
}) => {
  const ink = color ?? "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M170 28L174 36L182 40L174 44L170 52L166 44L158 40L166 36L170 28Z"
        fill={ink}
      />
      <rect
        x="24"
        y="58"
        width="132"
        height="96"
        rx="14"
        stroke={ink}
        strokeWidth="10"
      />
      <rect x="24" y="82" width="132" height="22" fill={ink} />
      <rect
        x="36"
        y="118"
        width="46"
        height="18"
        rx="5"
        stroke={ink}
        strokeWidth="6"
      />
    </svg>
  );
};

export default CardIcon;
