import React from "react";

interface Title {
  children: React.ReactNode;
  className?: string;
  variant:
    | "default"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "primary"
    | "undefined";
  size: "sm" | "lg" | "xl" | "2xl";
}

const Title: React.FC<Title> = ({ children, className, variant, size }) => {
  return (
    <div
      className={`Title flex w-fit flex-row items-center gap-2 2xl:gap-3 capitalize ${className}`}
    >
      <span
        className={`${
          (variant === "default" && "Default bg-neutral-100") ||
          (variant === "primary" && "Primary bg-primary-main") ||
          (variant === "success" && "Success bg-success-main") ||
          (variant === "info" && "Info bg-info-main") ||
          (variant === "warning" && "Warning bg-warning-main") ||
          (variant === "error" && "Error bg-error-main") ||
          (variant === "undefined" && "bg-transparent hidden")
        } h-5 w-1.5 flex-shrink-0 rounded-xl 2xl:h-6 2xl:w-2`}
      />

      <span
        className={`${
          (size === "lg" && "text-md 2xl:text-body-xl") ||
          (size === "sm" && "text-md") ||
          (size === "2xl" && "text-xl")
        } font-semibold`}
      >
        {children}
      </span>
    </div>
  );
};

export default Title;
