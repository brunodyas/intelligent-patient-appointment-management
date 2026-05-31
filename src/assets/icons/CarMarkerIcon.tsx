import React from "react";
import { FaCar } from "react-icons/fa";

interface CarMarkerProps {
  color: string;
}

const CarMarker: React.FC<CarMarkerProps> = ({ color }) => {
  const markerColor = color || "#C63D7F"
  return (
    <FaCar
      size={20}
      color={markerColor}
      style={{
        width: "20px",
        height: "48px"
      }}
    />
  );
};

export default CarMarker;
