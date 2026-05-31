import React from "react";

const LoadingIcon: React.FC<{ className?: string, fill?: string }> = ({ className, fill = "#fff" }) => {
  return (
    <svg
      className={`${className}`}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      width="20"
      height="20"
    >
      <path d="M43.935,25.145c0-10.318-8.364-18.682-18.682-18.682c-10.317,0-18.682,8.364-18.682,18.682h4.068 c0-8.072,6.541-14.614,14.614-14.614c8.073,0,14.614,6.541,14.614,14.614H43.935z">
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};

export default LoadingIcon;