import React from 'react';

interface IconProps {
  className?: string;
}

export const RootIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#6366F1" />
    <path d="M7 13L12 8L17 13L12 18L7 13Z" fill="white" />
  </svg>
);

export const TrnIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#10B981" />
    <path d="M12 6L16 12L12 18L8 12L12 6Z" fill="white" />
  </svg>
);

export const UsdtIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#22C55E" />
    <path d="M12 6V18M8 10H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
); 