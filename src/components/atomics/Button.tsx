import React from "react";
import { useRouter } from "next/navigation";

interface Button {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  size?: "sm" | "md" | "lg";
  variant:
  | "primary-bg"
  | "primary-outline"
  | "primary-nude"
  | "warning-bg"
  | "warning-outline"
  | "warning-nude"
  | "error-bg"
  | "error-outline"
  | "error-nude"
  | "default-bg"
  | "default-outline"
  | "default-nude"
  | "disabled-bg"
  | "disabled-outline"
  | "disabled-nude"
  | "tab-selected"
  | "tab-unselect"
  | "outline";

  onClick?: React.MouseEventHandler;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<Button> = ({
  children,
  className,
  disabled = false,
  href,
  onClick,
  size = "lg",
  variant = "primary-bg",
  type = "button",
}) => {
  const router = useRouter();

  const gotoLink = () => {
    router.push(`${href}`);
  };

  return (
    <button
      type={type}
      onClick={(href && gotoLink) || onClick}
      className={`Button ${(variant === "primary-bg" &&
        "Primary-Bg border-transparent bg-primary-main text-white hover:bg-primary-hover focus:ring-primary-border") ||
        (variant === "error-bg" &&
          "Error-Bg border-transparent bg-error-main text-white hover:bg-error-hover focus:ring-error-border") ||
        (variant === "warning-bg" &&
          "Warning-Bg border-transparent bg-warning-main text-white hover:bg-warning-hover focus:ring-warning-border") ||
        (variant === "default-bg" &&
          "Default-Bg border-transparent bg-neutral-20 text-neutral-100 hover:bg-neutral-30 focus:border-neutral-30 focus:ring-neutral-40") ||
        (variant === "primary-outline" &&
          "Primary-Outline border-primary-main bg-transparent text-primary-main hover:bg-primary-surface focus:ring-primary-border/25") ||
        (variant === "warning-outline" &&
          "Warning-Outline border-warning-main bg-transparent text-warning-main hover:bg-warning-surface focus:ring-warning-border/25") ||
        (variant === "error-outline" &&
          "Erorr-Outline border-error-main bg-transparent text-error-main hover:bg-error-surface focus:ring-error-border/25") ||
        (variant === "default-outline" &&
          "border-neutral-30 focus:border-primary-border border-primary-border text-primary-main focus:ring-primary-surface disabled:bg-neutral-20") ||
        (variant === "primary-nude" &&
          "Primary-Nude border-transparent bg-transparent text-primary-main hover:bg-primary-surface focus:ring-primary-border/25") ||
        (variant === "warning-nude" &&
          "Warning-Nude border-transparent bg-transparent text-warning-main hover:bg-warning-surface focus:ring-warning-border/25") ||
        (variant === "error-nude" &&
          "Error-Nude border-transparent bg-transparent text-error-main hover:bg-error-surface focus:ring-error-border/25") ||
        (variant === "default-nude" &&
          "Default-Nude border-transparent bg-transparent text-neutral-70 hover:bg-neutral-30 focus:ring-neutral-50/25") ||
        (variant === "disabled-bg" &&
          "Disabled-Bg cursor-auto bg-neutral-20 text-neutral-40") ||
        (variant === "disabled-outline" &&
          "Disabled-Outline cursor-auto border-neutral-30 bg-transparent text-neutral-40") ||
        (variant === "disabled-nude" &&
          "Disabled-Nude cursor-auto border-transparent bg-transparent text-neutral-40") ||
        (variant === "tab-selected" &&
          "Tab-Selected border-primary-main bg-neutral-101 text-primary-main ") ||
        (variant === "tab-unselect" &&
          "Tab-Selected border-border-chineseWhite bg-transparent text-neutral-102 ") ||
        (variant === "outline" &&
          "border border-neutral-40 disabled:bg-neutral-20 hover:bg-primary-highlight hover:border-transparent hover:text-primary-main")
        }
         ${(size === "lg" &&
          "Size-Large gap-3 rounded-lg px-4 py-5 text-sm") ||
        (size === "md" &&
          "Size-Medium gap-2 rounded-lg px-3 py-[13px] text-sm") ||
        (size === "sm" && "Size-Small gap-2 rounded-lg px-2 py-[11px] text-xs")
        } relative flex h-fit items-center justify-center whitespace-nowrap border font-semibold leading-none outline-none ring-2 ring-transparent transition-all duration-300 ease-out [&>svg]:flex-shrink-0 ${className}
      ${disabled && "opacity-50"}
      `}
      disabled={disabled ? true : false}
    >
      {children}
    </button>
  );
};

export default Button;
