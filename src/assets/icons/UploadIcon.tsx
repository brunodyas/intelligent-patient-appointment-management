import React from "react";

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_dii_19_13910)">
        <rect x="2" y="1" width="40" height="40" rx="8" fill="white" />
        <rect
          x="2.5"
          y="1.5"
          width="39"
          height="39"
          rx="7.5"
          stroke="#E4E7EC"
        />
        <path
          d="M18.6667 24.3333L22 21M22 21L25.3334 24.3333M22 21V28.5M28.6667 24.9524C29.6846 24.1117 30.3334 22.8399 30.3334 21.4167C30.3334 18.8854 28.2813 16.8333 25.75 16.8333C25.5679 16.8333 25.3976 16.7383 25.3051 16.5814C24.2184 14.7374 22.212 13.5 19.9167 13.5C16.4649 13.5 13.6667 16.2982 13.6667 19.75C13.6667 21.4718 14.3629 23.0309 15.4891 24.1613"
          stroke="#475467"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_dii_19_13910"
          x="0"
          y="0"
          width="44"
          height="44"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.05 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_19_13910"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_19_13910"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.05 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_19_13910"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="1"
            operator="erode"
            in="SourceAlpha"
            result="effect3_innerShadow_19_13910"
          />
          <feOffset />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.18 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_19_13910"
            result="effect3_innerShadow_19_13910"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default UploadIcon;
