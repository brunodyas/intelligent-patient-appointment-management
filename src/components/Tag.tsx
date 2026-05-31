"use client";

type Props = {
  handleButtonClick?: (value: string) => void;
  label: string;
  color: string;
  isSelect?: boolean;
};

const Tag = ({ label, color, isSelect, handleButtonClick }: Props) => {
  return (
    <button
      onClick={() => handleButtonClick && handleButtonClick(label)}
      className={`rounded-lg px-3 py-0.5 text-sm border-2 border-[${color}]
        ${(label === "Just for fun" && "bg-[#F4CCCC]") ||
        (label === "Announcements" && "bg-[#DAE8FC]") ||
        (label === "Tips" && "bg-[#EAD1DC]") ||
        (label === "Events" && "bg-[#D9EAD3]") ||
        (label === "Question" && "bg-[#FFF2CC]") ||
        (label === "Feature Suggestion" && "bg-[#E6E0EC]") ||
        (label === "Biz dev" && "bg-[#CFE2F3]") ||
        (label === "Product" && "bg-[#FCE5CD]") ||
        (label === "General" && "bg-[#D9D2E9]") ||
        (label === "Motorization" && "bg-[#F9CB9C]")
        }
        ${isSelect && "border-primary-main border-2"}`}
    >
      #{label}
    </button>
  );
};

export default Tag;
