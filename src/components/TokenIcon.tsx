import { SVGProps } from 'react';

// Import SVGs as React components
const RootIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="32" height="32" rx="16" fill="#1A1B1F"/>
    <path d="M10 22V10h12l-6 6-6 6z" fill="white"/>
  </svg>
);

const XRPIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="16" cy="16" r="16" fill="#23292F"/>
    <path d="M22.363 10h2.602l-5.414 5.361a4.675 4.675 0 01-6.6 0L7.537 10h2.602l4.113 4.071a2.806 2.806 0 003.998 0L22.363 10zM9.605 22h-2.6l5.414-5.361a4.675 4.675 0 016.6 0L24.431 22h-2.602l-4.113-4.071a2.806 2.806 0 00-3.998 0L9.605 22z" fill="white"/>
  </svg>
);

const AstoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="16" cy="16" r="16" fill="url(#asto-gradient)"/>
    <path d="M10 22V10h12l-6 6-6 6z" fill="white"/>
    <defs>
      <linearGradient id="asto-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF6B6B"/>
        <stop offset="50%" stopColor="#4A90E2"/>
        <stop offset="100%" stopColor="#6C63FF"/>
      </linearGradient>
    </defs>
  </svg>
);

interface TokenIconProps {
  token: 'ROOT' | 'XRP' | 'USDT' | 'ASTO';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12'
};

const tokenIcons = {
  ROOT: RootIcon,
  XRP: XRPIcon,
  USDT: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="16" fill="#26A17B"/>
      <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="white"/>
    </svg>
  ),
  ASTO: AstoIcon
};

export const TokenIcon = ({ token, size = 'md', className = '' }: TokenIconProps) => {
  const Icon = tokenIcons[token];
  
  return (
    <div className={`inline-flex ${sizeClasses[size]} ${className}`}>
      <Icon className="w-full h-full" />
    </div>
  );
}; 