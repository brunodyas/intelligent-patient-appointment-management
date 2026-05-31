import React from "react";

function MarkerIcon() {
  return (
    <svg width="20" height="48" data-name="marker">
      <ellipse
        cx="10"
        cy="27"
        fill="#c4c4c4"
        opacity="0.3"
        rx="9"
        ry="5"
      ></ellipse>
      <path
        fill="#bfbfbf"
        d="M10 32c5 0 9-2.2 9-5s-4-5-9-5-9 2.2-9 5 4 5 9 5z"
        data-name="shadow"
        opacity="0.3"
      ></path>
      <path
        fill="#C63D7F"
        stroke="#C63D7F"
        d="M19.25 10.4a13.066 13.066 0 01-1.46 5.223 41.528 41.528 0 01-3.247 5.549 71.377 71.377 0 01-4.542 5.945l-.217-.258a73.206 73.206 0 01-4.327-5.725 42.268 42.268 0 01-3.246-5.553A12.978 12.978 0 01.75 10.4 9.466 9.466 0 0110 .75a9.466 9.466 0 019.25 9.65z"
      ></path>
      <path
        fill="#fff"
        stroke="#C63D7F"
        d="M13.55 10A3.55 3.55 0 1110 6.45 3.548 3.548 0 0113.55 10z"
      ></path>
      <path fill="none" d="M0 0h20v48H0z"></path>
    </svg>
  );
}

export default MarkerIcon;
