import React from 'react';

interface CardIconProps {
  size?: number;
  className?: string;
}

const CardIcon: React.FC<CardIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Star/Sparkle */}
      <path
        d="M170 30L175 40L185 45L175 50L170 60L165 50L155 45L165 40L170 30Z"
        fill="currentColor"
      />
      
      {/* Card body */}
      <rect
        x="20"
        y="60"
        width="140"
        height="100"
        rx="15"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
      />
      
      {/* Card stripe/band */}
      <rect
        x="20"
        y="85"
        width="140"
        height="25"
        fill="currentColor"
      />
      
      {/* Card detail rectangle (bottom section) */}
      <rect
        x="30"
        y="125"
        width="50"
        height="20"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
};

export default CardIcon;

