import { useEffect, useState } from "react";
import Selectbox from "./Selectbox";
import Input from "./Input";
import Button from "./Button";
import { XIcon } from "@/assets/icons";

const ProductCollapseField = ({ inputField, handleValidate, isView = false }: any) => {
  const [inputValue, setInputValue] = useState<string | number>(
    inputField?.formatted_value ?? ""
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setInputValue(inputField?.formatted_value ?? "")
  }, [inputField]);

  const handleValueChange = (value: string | number) => {
    if (inputField?.is_dimension) {
      setInputValue(value);
    } else {
      if (!inputField?.maximum_length) {
        setInputValue(value);
      } else if (
        typeof value == "string" &&
        value?.length <= inputField?.maximum_length
      ) {
        setInputValue(value);
      }
    }
  };

  const validateNumberValue = (value: number) => {
    const min = inputField?.minimum_value;
    const max = inputField?.maximum_value;

    if (min !== 0.0 && max !== 0.0 && value >= min && value <= max) {
      setErrorMessage("");
      return handleValidate(inputField?.name, value);
    } else if (!value) {
      return setErrorMessage("");
    } else if (min !== 0.0 && max !== 0.0 && (value < min || value > max)) {
      return setErrorMessage(
        `Please enter a number between ${min} and ${max}.`
      );
    } else if (min !== 0.0 && value < min) {
      return setErrorMessage(
        `Please enter a number greater than or equal to ${min}.`
      );
    } else if (max !== 0.0 && value > max) {
      return setErrorMessage(
        `Please enter a number less than or equal to ${max}.`
      );
    } else {
      setErrorMessage("");
      return handleValidate(inputField?.name, value);
    }
  };

  const validateStringValue = (value: string) => {
    const minLen = inputField?.minimum_length;
    const maxLen = inputField?.maximum_length;

    if (
      minLen !== 0 &&
      maxLen !== 0 &&
      value.length >= minLen &&
      value.length <= maxLen
    ) {
      setErrorMessage("");
      return handleValidate(inputField?.name, value);
    } else if (!value) {
      return setErrorMessage("");
    } else if (
      minLen !== 0 &&
      maxLen !== 0 &&
      (value.length < minLen || value.length > maxLen)
    ) {
      return setErrorMessage(
        `Please enter a word between ${minLen} and ${maxLen} characters.`
      );
    } else if (minLen !== 0 && value.length < minLen) {
      return setErrorMessage(
        `Please enter a word with at least ${minLen} characters.`
      );
    } else if (maxLen !== 0 && value.length > maxLen) {
      return setErrorMessage(
        `Please enter a word with at most ${maxLen} characters.`
      );
    } else {
      setErrorMessage("");
      return handleValidate(inputField?.name, value);
    }
  };

  let listItems: any = [{ label: "Select Option", value: null, disabled: true }];

  inputField?.is_list &&
    inputField?.values?.length &&
    inputField?.values?.map((item: any) => {
      listItems.push({ label: item, value: item });
    });

  return (
    <>
      {inputField?.is_visible && (
        <div id={`group-${inputField?.name.replaceAll(' ', '_')}`}>
          <div>
            <label
              className={`text-sm font-semibold ${inputField.is_italic ? "italic" : ""} ${inputField.is_bold ? "font-bold" : ""
                }`}
            >
              {inputField?.name}
            </label>
          </div>
          <div>
            {inputField?.is_list ? (
              <Selectbox
                datas={listItems}
                selectedData={
                  inputField?.formatted_value
                    ? {
                      label: inputField?.formatted_value,
                      value: inputField?.formatted_value,
                    }
                    : {}
                }
                isDisabled={isView}
                selectedNow={true}
                handleChange={(selected: any) => {
                  handleValidate(inputField?.name, selected?.value);
                }}
              />
            ) : inputField?.is_dimension ? (
              <div className="!mt-[0.35rem]">
                {(inputField?.minimum_value > 0 &&
                  inputField?.maximum_value > 0) &&
                  <h1 className="text-right text-xs text-neutral-80 -mt-[17px]">
                    {inputField?.minimum_value > 0 &&
                      `Min: ${inputField?.minimum_value}`}{" "}
                    {inputField?.minimum_value > 0 &&
                      inputField?.maximum_value > 0 &&
                      ","}{" "}
                    {inputField?.maximum_value > 0 &&
                      `Max: ${inputField?.maximum_value}`}
                  </h1>}
                <div className="relative">
                  <Input
                    id={`${inputField?.name}`}
                    type="number"
                    variant="text"
                    placeholder={`Enter ${inputField?.name}`}
                    value={inputValue}
                    autoComplete="off"
                    onBlur={(e) => {
                      validateNumberValue(Number(e.target?.value));
                    }}
                    handleChange={(e) => {
                      handleValueChange(e.target?.value);
                    }}
                    isRequired
                    className="!rounded-lg !border-neutral-30 focus-within:!border-primary-main focus-within:!ring-primary-surface disabled:!bg-neutral-20 !border focus-within:outline-1 !shadow-1 focus-within:!ring-[2.5px] transition-all duration-300 ease-out"
                    inputStyle="!rounded-none !border-none !bg-transparent !ring-0 !shadow-none"
                    disabled={isView}
                  />
                </div>
                {errorMessage && (
                  <h1 className="text-sm text-red-500">{errorMessage}</h1>
                )}
              </div>
            ) : (
              <div className="!mt-[0.35rem]">
                {(inputField?.minimum_length > 0 &&
                  inputField?.maximum_length > 0) &&
                  <h1 className="text-right text-xs text-neutral-80 -mt-[17px]">
                    {inputField?.minimum_length > 0 &&
                      `Min: ${inputField?.minimum_length}`}{" "}
                    {inputField?.minimum_length > 0 &&
                      inputField?.maximum_length > 0 &&
                      ","}{" "}
                    {inputField?.maximum_length > 0 &&
                      `Max: ${inputField?.maximum_length}`}
                  </h1>
                }

                <div className="relative">
                  <Input
                    id={`${inputField?.name}`}
                    type="text"
                    variant="text"
                    autoComplete="off"
                    placeholder={`Enter ${inputField?.name}`}
                    value={inputValue}
                    onBlur={(e) => {
                      validateStringValue(e.target?.value);
                    }}
                    handleChange={(e) => {
                      handleValueChange(e.target?.value);
                    }}
                    className="!rounded-lg !border-neutral-30 focus-within:!border-primary-main focus-within:!ring-primary-surface disabled:!bg-neutral-20 !border focus-within:outline-1 !shadow-1 focus-within:!ring-[2.5px] transition-all duration-300 ease-out"
                    disabled={isView}
                    inputStyle="!rounded-none !border-none !bg-transparent !ring-0 !shadow-none !px-4"
                  />
                </div>
                {errorMessage && (
                  <h1 className="text-sm text-red-500">{errorMessage}</h1>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCollapseField;
