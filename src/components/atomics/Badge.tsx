import React from "react"

interface Badge {
  children: React.ReactNode
  variant: "default" | "success" | "warning" | "info" | "error"
}

const Badge: React.FC<Badge> = ({ children, variant }) => {
  return (
    <div
      className={`BADGE inline-block ${
        (variant === "default" &&
          "BADGE-DEFAULT bg-neutral-30 text-neutral-80") ||
        (variant === "success" &&
          "BADGE-SUCCESS bg-success-surface text-success-main") ||
        (variant === "info" && "BADGE-INFO bg-info-surface text-info-main") ||
        (variant === "warning" &&
          "BADGE-WARNING bg-warning-surface text-warning-main") ||
        (variant === "error" && "BADGE-ERROR bg-error-surface text-error-main")
      } cursor-auto rounded-full px-3 py-2 text-xs font-medium leading-none tracking-[1%]`}
    >
      {children}
    </div>
  )
}

export default Badge
