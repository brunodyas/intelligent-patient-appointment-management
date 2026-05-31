"use client";

import { CaretDownIcon } from "@/assets/icons";
import { Listbox, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useMemo, useState } from "react";

interface Datas {
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}
interface Props {
  className?: string;
  datas: Datas[];
  defaultSelected?: string;
  label?: string;
  selectedNow?: boolean;
  variant?: "default" | "status" | "no-border";
  name: string;
  onChange: (name: string, value: string) => void;
}

const FormSelect: React.FC<Props> = ({
  datas,
  label,
  selectedNow = false,
  defaultSelected,
  variant = "default",
  className,
  name,
  onChange,
}) => {

  const [selected, setSelected] = useState(datas[0]);
  const [selectedNowState, setSelectedNowState] = useState(selectedNow);
  useMemo(() => {
    const isSelected = datas.find((data) => data.value === defaultSelected);
    setSelected(isSelected ?? datas[0]);
  }, [defaultSelected, datas]);

  return (
    <Listbox
      value={selected}
      onChange={(e) => {
        setSelected(e);
        onChange(name, e?.value);
      }}
    >
      <div className="SELECT relative w-full relative flex w-full flex-col items-start gap-1.5">
        {label && (
          <h5 className="text-sm font-semibold text-neutral-100">
            {label}
          </h5>
        )}

        <Listbox.Button
          className={`Select relative w-full cursor-pointer rounded-lg border bg-white ${variant === "default" ? "px-4 py-3" : "p-2 pr-4"
            } ring-2 ring-transparent placeholder:text-neutral-50 focus:border-primary-main focus:outline-none focus:ring-primary-surface/50 ${className}`}
        >
          {selectedNowState && (
            <button
              onClick={() => setSelectedNowState(false)}
              className="absolute inset-0 z-10 h-full w-full"
            >
              &nbsp;
            </button>
          )}

          {variant === "default" && (
            <>
              <span
                className={`block truncate text-left text-sm text-neutral-80`}
              >
                {selectedNowState ? datas[1].label : selected.label}
              </span>
            </>
          )}

          {variant === "status" && (
            <>
              <div className="flex w-fit flex-row items-center gap-2 rounded-full bg-neutral-20 px-2 py-1.5">
                <span
                  className={`h-5 w-5 rounded-full ${selected.color || "bg-neutral-80"
                    }`}
                />

                <span
                  className={`block truncate text-left text-xs text-neutral-80`}
                >
                  {selected.label}
                </span>
              </div>
            </>
          )}

          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <CaretDownIcon
              className="h-5 w-5 text-neutral-50"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute top-20 z-[999] mt-1 w-full rounded-md border border-neutral-30 bg-white py-1 text-sm shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className=" overflow-auto max-h-60">
            {datas.map((data: Datas, dataIdx: any) => (
              <Listbox.Option
                key={dataIdx}
                disabled={data.disabled}
                className={({ active }) =>
                  `relative select-none px-4 py-2 ${active && !data.disabled
                    ? "bg-primary-surface/50"
                    : `text-neutral-60`
                  } ${data.disabled ? "cursor-default" : "cursor-pointer"}`
                }
                value={data}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${selected && !data.disabled ? "font-medium" : "font-normal"
                        } `}
                    >
                      {data.label}
                    </span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </div>
        </Listbox.Options>
      </div>
    </Listbox>
  );
};
export default FormSelect;
