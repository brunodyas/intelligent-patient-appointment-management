"use client";

import React, { Fragment, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, XIcon } from "@/assets/icons";
import { MultipleSelectBoxProps, Option } from "@/interface/manufacturers";

const MultipleSelectBox: React.FC<MultipleSelectBoxProps> = ({
  selectedData = [],
  datas = [],
  label,
  variant = "default",
  className,
  isRequired = false,
  handleChange,
}) => {
  const [selected, setSelected] = useState<Option[]>(
    selectedData[0]?.name ? selectedData : []
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const filteredOptions = useMemo(() => {
    const filter = datas?.filter((data) =>
      data.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    if (filter?.length === 0) {
      filter.push({ name: "Press enter to add " + inputValue });
    }
    return filter;
  }, [inputValue, datas]);

  const handleSelect = (option: Option) => {
    setSelected((prevSelected) => {
      if (!prevSelected.some((item) => item.name === option.name)) {
        const newSelected = [...prevSelected, option];
        handleChange && handleChange(newSelected);
        return newSelected;
      }
      return prevSelected;
    });
    setInputValue("");
  };
  const handleDeselect = (option: Option) => {
    setSelected(selected.filter((item) => item.name !== option.name));
    const temp = selected.filter((item) => item.name !== option.name);
    handleChange && handleChange(temp);
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setIsOpen(true);
  };
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key.toLowerCase() === "enter" && inputValue.trim() !== "") {
      const customOption = { name: inputValue.trim() };
      handleSelect(customOption);
      setIsOpen(false);
    }
  };
  const handleInputBlur = () => {
    setIsOpen(false);
  };

  return (
    <div className={`relative  w-full space-y-1.5 ${className}`}>
      {label && (
        <h5 className="text-sm font-semibold text-neutral-100">
          {label}
          {isRequired && <span className="text-error-main">*</span>}
        </h5>
      )}
      <div
        className={`relative w-full cursor-pointer  bg-white  ${variant === "no-border" ? "border-none" : ""
          }`}
      >
        <div className="flex flex-wrap gap-2 ">
          {selected.map((option, key) => (
            <div
              key={key}
              className="flex items-center gap-1 rounded-full bg-neutral-20 px-2 py-1.5 mb-2"
            >
              <span className="text-xs text-neutral-80">
                {option.name}
              </span>
              <button
                type="button"
                onClick={() => handleDeselect(option)}
                className="text-neutral-60 hover:text-neutral-100"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
          className="relative z-0 w-full rounded-lg border p-3 text-sm font-normal text-neutral-80 shadow-1 outline-none ring-[2.5px] ring-transparent transition-all duration-300 ease-out placeholder:text-neutral-50 2xl:p-3.5 border-neutral-30 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 disabled:overflow-x-scroll"
          placeholder="Select option below or Enter your custom option"
        />
        <Listbox
          as="div"
          value={selected}
          onChange={handleSelect as unknown as any}
          className="relative"

        >
          <Transition
            as={Fragment}
            show={isOpen}
            enter="transition duration-300 ease-out"
            enterFrom="transform scale-y-95 opacity-0"
            enterTo="transform scale-y-100 opacity-100"
            leave="transition duration-300 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Listbox.Options className="absolute z-[999] mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-30 py-1 text-sm shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none">
              {filteredOptions?.map((data, dataIdx) => {
                const isCustom = data?.name.includes("Press enter to add");
                return (
                  <Listbox.Option
                    key={dataIdx}
                    className={({ active }) =>
                      `relative select-none px-4 py-2  text-neutral-60 bg-white ${active
                        ? "bg-[#fff1f7] text-neutral-80"
                        : "text-neutral-60"
                      }${isCustom ? "" : "cursor-pointer hover:bg-[#fff1f7]"}`
                    }
                    disabled={isCustom}
                    value={data}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"
                            }`}
                        >
                          {data?.name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                )
              }
              )}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
    </div>
  );
};

export default MultipleSelectBox;
