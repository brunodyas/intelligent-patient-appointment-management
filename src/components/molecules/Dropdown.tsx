"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowRight2Icon, HomeIcon } from "@/assets/icons";
import { twMerge } from "tailwind-merge";

interface Dropdown {
  children: React.ReactNode;
  buttonChildren: React.ReactNode;
  open: any;
  setOpen: any;
  className?: string;
}
const Dropdown: React.FC<Dropdown> = ({
  buttonChildren,
  children,
  open,
  setOpen,
  className,
}) => {
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="outline-none">
        {buttonChildren}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={twMerge(
            "min-w-[270px] rounded-lg-10 border border-neutral-15 bg-white p-3 shadow-dropdown will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade",
            className
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default Dropdown;
