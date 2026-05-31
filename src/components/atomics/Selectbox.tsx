"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CaretDownIcon } from "@/assets/icons";
import { BiSolidShow, BiSolidHide } from "react-icons/bi";

interface Selectbox {
  className?: string;
  datas: any;
  label?: string;
  selectedNow?: boolean;
  variant?: "default" | "status" | "no-border";
  selectedData?: any;
  handleChange?: (value: any) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  onScroll?: (value: any) => void;
}

const Selectbox: React.FC<Selectbox> = ({
  datas,
  label,
  selectedNow = false,
  variant = "default",
  className,
  selectedData = [],
  isRequired = false,
  isDisabled = false,
  handleChange,
  onScroll
}) => {
  const [selected, setSelected] = useState(
    selectedData?.name || selectedData?.label ? selectedData : datas[0]
  );
  const [selectedNowState, setSelectedNowState] = useState(selectedNow);
  const [isRotate, setIsRotate] = useState(true);
  const currentSelected = useMemo(
    () => (selected?.name || selected?.label).replace("_", " "),
    [selected]
  );

  useEffect(() => {
    setSelected(selectedData?.name || selectedData?.label ? selectedData : datas[0])
  }, [datas])

  const handleSelect = (option: any) => {
    setSelected(option);
    setIsRotate(!isRotate)
    handleChange && handleChange(option);
  };

  const getShowIcon = () => <BiSolidShow color="#c63d7f" size={16} />;
  const getHideIcon = () => <BiSolidHide color="#c8c8c8" size={16} />;

  const renderIcon = (hide: boolean | undefined) => {
    if (hide === false) {
      return getShowIcon();
    } else if (hide === true) {
      return getHideIcon();
    }
    return null;
  };

  return (
    <Listbox value={selected} onChange={handleSelect} disabled={isDisabled} >
      <div className="relative w-full space-y-1.5">
        {label && (
          <h5 className={`text-sm font-semibold text-neutral-100 ${isDisabled ? 'opacity-[50%]' : ''}`}>
            {label} {isRequired && <span className="text-error-main">*</span>}
          </h5>
        )}

        <ListboxButton
          className={`relative w-full rounded-lg border bg-white !mt-[0.35rem] px-2 ${isDisabled ? 'opacity-[65%]' : ''} ${variant === "default" ? "px-4 py-3" : "p-2 pr-4"
            } ring-2 ring-transparent placeholder:text-neutral-50 focus:border-primary-main focus:outline-none focus:ring-primary-surface/50 ${className}`}
          onClick={() => setIsRotate(!isRotate)}
        >
          {selectedNowState && (
            <button
              onClick={() => setSelectedNowState(false)}
              className={`absolute inset-0 z-10 h-full w-full ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
            >
              &nbsp;
            </button>
          )}

          {variant === "default" && (
            <>
              <span
                className={`block truncate text-left text-sm text-neutral-80 capitalize ${isDisabled ? 'opacity-[65%]' : ''}`}
              >
                {currentSelected}
              </span>
            </>
          )}

          {variant === "status" && (
            <>
              <div className="flex w-fit flex-row items-center gap-2 rounded-full px-2 py-1.5">
                <span
                  className={`h-5 w-5 rounded-full ${selected?.color || ""}`}
                />

                <span
                  className={`block truncate text-left text-xs text-neutral-80 capitalize ${isDisabled ? 'opacity-[50%]' : ''}`}
                >
                  {currentSelected}
                </span>
              </div>
            </>
          )}

          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <CaretDownIcon
              className={`h-5 w-5 text-neutral-50 transform transition-transform ${isRotate ? "rotate-0" : "rotate-180"
                }`}
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <ListboxOptions onScroll={onScroll} className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-30 p-0 text-sm shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none bg-white">
          {datas?.map((data: any, dataIdx: any) => {
            const name = (data.name || data.label).replace("_", " ");
            return (
              <ListboxOption
                key={dataIdx}
                disabled={data.disabled}
                className={({ active }) =>
                  `relative select-none px-4 py-2 bg-white ${active && !data.disabled ? "bg-[#fff1f7]" : `text-neutral-0`
                  } ${data.disabled
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-[#fff1f7]"
                  }`
                }
                value={data}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`flex items-center justify-between truncate capitalize ${(selected && !data.disabled) || data?.hide == false
                        ? "font-bold"
                        : "font-normal"
                        } `}
                    >
                      {name}
                      {renderIcon(data?.hide)}
                    </span>
                  </>
                )}
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </div>
    </Listbox>
  );
};
export default Selectbox;
