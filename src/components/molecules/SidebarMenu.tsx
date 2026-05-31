"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CaretDownIcon } from "@/assets/icons";
import Route from "../atomics/Route";

interface SidebarMenu {
  active?: boolean;
  href?: string;
  icon?: React.ReactNode;
  name: string;
  onClick?: any;
  variant: "default" | "sub-menu" | "expand";
  exact?: boolean;
}

const SidebarMenu: React.FC<SidebarMenu> = ({
  active,
  href,
  icon,
  name,
  onClick,
  variant,
  exact,
}) => {
  //------------------------------------------------------------------------------------------------------------//
  const currentActive = usePathname();

  //------------------------------------------------------------------------------------------------------------//
  /**
   *
  const localStorageData = localStorage.getItem(name)
const previousMenu = JSON.parse(localStorageData || 'false')
const sideMenuRef = ref(previousMenu)

const toggleSideMenu = () => {
  sideMenuRef.value = !sideMenuRef.value

  localStorage.setItem(name, sideMenuRef.value)
}
   */
  //------------------------------------------------------------------------------------------------------------//
  // const localStorageData = window.localStorage.getItem(name)
  // const previousMenu = JSON.parse(localStorageData || "false")
  // const [sideMenuRef, setSideMenuRef] = React.useState(previousMenu)

  // const toggleSideMenu = () => {
  //   setSideMenuRef(!sideMenuRef)

  //   window.localStorage.setItem(name, `${sideMenuRef}`)
  // }

  return (
    <>
      {variant === "default" && (
        <Route
          route={href}
          linkClassName={`relative flex w-full items-center justify-between gap-3 rounded-lg-10 ${
            exact
              ? href === currentActive
                ? "bg-neutral-20 text-primary-main"
                : "bg-white text-neutral-50"
              : currentActive?.includes(`${href}`)
              ? "bg-neutral-20 text-primary-main"
              : "bg-white text-neutral-50"
          }
          } p-3 transition-all duration-300 ease-out hover:bg-neutral-20`}
        >
          <div className="flex items-center gap-3">
            <span className="[&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-2 2xl:[&>svg]:h-6 2xl:[&>svg]:w-6">
              {icon}
            </span>

            <span className="text-xs font-medium 2xl:font-semibold">
              {name}
            </span>
          </div>
        </Route>
      )}

      {variant === "sub-menu" && (
        <button
          type="button"
          onClick={() => {
            onClick();
            // toggleSideMenu()
          }}
          className={`relative flex w-full items-center justify-between gap-3 rounded-lg-10 ${
            active ? "bg-white text-primary-main" : "bg-white text-neutral-50"
          } p-3 transition-all duration-300 ease-out hover:bg-neutral-20`}
        >
          <div className="flex items-center gap-3">
            <span className="[&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-2 2xl:[&>svg]:h-6 2xl:[&>svg]:w-6">
              {icon}
            </span>

            <span className="text-xs font-medium 2xl:font-semibold">
              {name}
            </span>
          </div>

          <CaretDownIcon
            className={`h-5 w-5 2xl:h-6 2xl:w-6 ${
              active ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      )}

      {variant === "expand" && (
        <Route
          route={href}
          linkClassName={`relative flex w-full items-center justify-between gap-3 rounded-lg-10 ${
            currentActive?.includes(`${href}`)
              ? "bg-neutral-20 text-primary-main"
              : "bg-white text-neutral-50"
          } p-3 transition-all duration-300 ease-out hover:bg-neutral-20`}
        >
          <span className="text-xs font-medium 2xl:font-semibold">
            {name}
          </span>
        </Route>
      )}
    </>
  );
};

export default SidebarMenu;
