import React from 'react';

const CompleteIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="12" fill="none" />
      <path
        d="M16.5 8.5L10 15L7.5 12.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CompleteIcon;
