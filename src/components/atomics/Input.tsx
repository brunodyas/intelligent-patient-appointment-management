import React, { useRef, useState } from "react";
import PlacesAutocomplete from "react-places-autocomplete";
import { PhotographIcon } from "@heroicons/react/outline";
import { XCircleIcon } from "@heroicons/react/solid";
import { DatePicker } from "./DatePicker/DatePicker";
import TimePicker from "./TimePicker";
import Button from "./Button";
import { CurrencyDollarIcon, LoadingIcon, PercentIcon } from "@/assets/icons";
import "react-datepicker/dist/react-datepicker.css";
import { SiMicrosoftexcel } from "react-icons/si";
import { BsFiletypeDocx } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa";
import { TiDocumentText } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { DateFormat } from "@/interface/activities";
import Image from "next/image";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";

interface InputProps {
  autoComplete?: string;
  disabled?: boolean;
  defaultValue?: any;
  id: string;
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextAreaChange?: (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlurTextArea?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  handleDateChange?: (date: DateFormat) => void;
  handleTimeChange?: (time: string) => void;
  setEditFile?: (file: string) => void;
  message?: string;
  label?: string;
  logoSrc?: string;
  placeholder: string;
  fileTypes?: string[];
  selectedFileType?: string;
  selectedFileName?: string;
  type?:
  | "text"
  | "textarea"
  | "password"
  | "date"
  | "email"
  | "number"
  | "file"
  | "time"
  | "address";
  value?: string | Date | number | null;
  variant?:
  | "default"
  | "default-icon"
  | "default-error"
  | "phone"
  | "phone-error"
  | "logo"
  | "logo-error"
  | "discount"
  | "currency"
  | "name"
  | "email"
  | "password"
  | "number"
  | "date"
  | "input"
  | "input-error"
  | "comments"
  | "text";
  isRequired?: boolean;
  className?: string;
  editFile?: string;
  userPhoto?: string;
  inputStyle?: string;
  handleFileChange?: (file: File | null) => void;
  handleSubmit?: () => Promise<void>;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const Input: React.FC<InputProps> = ({
  autoComplete = "off",
  disabled = false,
  defaultValue,
  id,
  label,
  logoSrc,
  message,
  placeholder,
  type,
  value,
  variant = "default",
  isRequired = false,
  fileTypes,
  selectedFileType,
  selectedFileName,
  editFile,
  userPhoto,
  handleChange,
  handleTextAreaChange,
  handleDateChange,
  handleTimeChange,
  onBlur,
  onBlurTextArea,
  className,
  handleFileChange,
  handleKeyDown,
  setEditFile,
  handleSubmit,
  inputStyle
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState(
    selectedFileName ? selectedFileName : ""
  );
  const [fileType, setFileType] = useState<string | null>(
    selectedFileType ? selectedFileType : null
  );

  const [inputValue, setInputValue] = useState<string>(defaultValue || "");
  const handlePlaceSelected = (place: { formatted_address: string }) => {
    try {
      if (place && place.formatted_address) {
        const formattedAddress = place.formatted_address;
        setInputValue(formattedAddress); // Update the input value with the selected place's address
        handleChange &&
          handleChange({
            target: {
              name: id,
              value: formattedAddress,
            },
          } as React.ChangeEvent<HTMLInputElement>); // Notify parent component of the selected place
      }
    } catch (error) {
      console.error("Error selecting place:", error);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);

      const fileExt = file.name.split(".")[file.name.split(".").length - 1];

      if (
        fileTypes &&
        (fileTypes?.find((item: any) => item?.slice(1) === fileExt)?.length ??
          0) > 0
      ) {
        setFileType(fileExt.toUpperCase());
        handleFileChange && handleFileChange(file);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        handleFileChange && handleFileChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = (event: any) => {
    event.stopPropagation();
    setSelectedImage(null);
    setFileType("");
    setFileName("");
    setEditFile && setEditFile("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (handleFileChange) {
      handleFileChange(null);
    }
  };

  const renderFileIcon = (fileType: string | null) => {
    switch (fileType) {
      case "PDF":
        return <FaFilePdf className="w-4 h-4 text-[#b30b00]" />;
      case "DOCX":
      case "DOC":
        return <BsFiletypeDocx className="w-4 h-4 text-[#004a93]" />;
      case "CSV":
      case "XLSX":
      case "XLS":
        return <SiMicrosoftexcel className="w-4 h-4 text-[#207245]" />;
      default:
        return <TiDocumentText className="w-6 h-6 text-[#7a7a7a]" />;
    }
  };

  return (
    <div className={`INPUT relative flex w-full flex-col items-start gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-semibold text-neutral-100 max-sm:text-xs ${(variant === "default" && "text-neutral-80") ||
            (variant?.includes("error") && "text-error-main")
            }`}
        >
          {label ?? "Please Add Label"}
          {isRequired && <span className="text-error-main">*</span>}
        </label>
      )}

      <div className="relative w-full">
        {variant?.includes("phone") && (
          <div className="absolute left-3 top-1/2 z-[1] flex w-fit -translate-y-1/2 items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-md bg-neutral-20 px-2 py-1 text-neutral-80">
              <span className="text-sm font-bold">+1</span>
            </div>
            <span className="text-sm font-normal text-neutral-40">
              |
            </span>
          </div>
        )}

        {variant?.includes("discount") && (
          <div className="absolute left-3 top-1/2 z-10 flex w-fit -translate-y-1/2 items-center gap-1.5">
            <button className="flex items-center gap-1 rounded-md bg-neutral-20 px-2 py-1 text-neutral-80">
              <PercentIcon className="h-5 w-5 stroke-2" />
            </button>
            <span className="text-sm font-normal text-neutral-30">
              |
            </span>
          </div>
        )}

        {variant?.includes("currency") && (
          <div className="absolute left-3 top-1/2 z-10 flex w-fit -translate-y-1/2 items-center gap-1.5">
            <button className="flex items-center gap-1 rounded-md bg-neutral-20 px-2 py-1 text-neutral-80">
              <CurrencyDollarIcon className="h-5 w-5 stroke-2" />
            </button>
            <span className="text-sm font-normal text-neutral-30">
              |
            </span>
          </div>
        )}

        {variant?.includes("logo") && (
          <div className="absolute left-3 top-1/2 z-10 flex w-fit -translate-y-1/2 items-center gap-1.5">
            <img
              className="h-6 w-auto object-cover"
              src={logoSrc ?? "/input-bank-logo.png"}
              alt="Maybank Logo"
            />
          </div>
        )}

        {variant?.includes("comments") && (
          <div className="absolute left-2 top-3 z-10 flex w-fit items-center gap-1.5">
            <div className="size-9 max-sm:size-8 object-cover rounded-full flex items-center justify-center bg-gray-200">
              {userPhoto ? (
                <Image
                  src={userPhoto}
                  width={10}
                  height={10}
                  alt="User"
                  className="w-full h-full object-cover rounded-md gap-1"
                  unoptimized
                />
              ) : (
                <FaUser size="50%" color="#fff" />
              )}
            </div>
          </div>
        )}

        {type === "date" ? (
          <DatePicker
            id={id}
            selected={value}
            handleDateChange={handleDateChange}
            isShowDate={true}
            placement="bottom end"
            className={`relative z-0 w-full rounded-lg border p-3 text-sm font-normal text-neutral-80 shadow-1 outline-none ring-[2.5px] ring-transparent transition-all duration-300 ease-out placeholder:text-neutral-50 2xl:p-3.5 ${(variant === "default" &&
              "border-neutral-30 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20") ||
              (variant === "default-error" &&
                "border-error-border/50 focus:border-error-main focus:ring-error-surface") ||
              (variant === "phone" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-[102px]") ||
              (variant === "phone-error" &&
                "border-error-border/50 pl-16 focus:border-error-border focus:ring-error-surface 2xl:pl-[102px]") ||
              (variant === "currency" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16") ||
              (variant === "discount" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16") ||
              (variant === "logo" &&
                "border-neutral-30 pl-28 focus:border-primary-main disabled:bg-neutral-20 2xl:pl-28") ||
              (variant === "logo-error" &&
                "border-error-border/50 pl-28 focus:border-error-border focus:ring-error-surface 2xl:pl-28")
              }`}
            placeholderText={placeholder ?? "Please add your placeholder"}
            disabled={disabled}
          />
        ) : type === "file" ? (
          <>
            <div
              className={`relative z-0 w-full rounded-lg border py-[0.57rem] px-[0.75rem] text-sm font-normal text-neutral-80 shadow-1 outline-none ring-[2.5px] ring-transparent transition-all duration-300 ease-out placeholder:text-neutral-50 2xl:p-3.5
                ${disabled && "pointer-events-none bg-[#f4f5f6]"}
                ${(variant === "default" &&
                  "border-neutral-30 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20") ||
                (variant === "default-error" &&
                  "border-error-border/50 focus:border-error-main focus:ring-error-surface") ||
                (variant === "phone" &&
                  "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-[102px]") ||
                (variant === "phone-error" &&
                  "border-error-border/50 pl-16 focus:border-error-border focus:ring-error-surface 2xl:pl-[102px]") ||
                (variant === "currency" &&
                  "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16") ||
                (variant === "discount" &&
                  "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16") ||
                (variant === "logo" &&
                  "border-neutral-30 pl-28 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-28") ||
                (variant === "logo-error" &&
                  "border-error-border/50 pl-28 focus:border-error-border focus:ring-error-surface 2xl:pl-28") ||
                (variant === "input" &&
                  "border border-transparent focus:border-primary-main disabled:bg-neutral-20 hover:border-2 hover:border-[#33333326] bg-background-lightest") ||
                (variant === "input-error" &&
                  "border-error-border/50 pl-28 focus:border-error-border focus:ring-error-surface 2xl:pl-28")
                }`}
              onClick={handleFileClick}
            >
              <div
                className={`${selectedImage || fileType || editFile ? "hidden" : "flex"
                  } h-full items-center text-[#3333338c] gap-2.5 mt-[1px]`}
              >
                {fileTypes ? (
                  <TiDocumentText className="w-6 h-6" />
                ) : (
                  <PhotographIcon className="w-6 h-6" />
                )}
                <span className="">
                  {fileTypes ? "Choose a file…" : "Choose an image…"}
                </span>
              </div>
              {selectedImage || fileType || editFile ? (
                <div className=" flex items-center justify-between w-full">
                  <div className="flex items-center justify-start gap-2.5 max-w-[80%]">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-8 h-8 rounded-[5px] object-cover"
                        onClick={handleImageClick}
                        style={{ cursor: "pointer" }}
                      />
                    ) : fileType || editFile ? (
                      <div className="h-7 content-center cursor-pointer">
                        {renderFileIcon(fileType)}
                      </div>
                    ) : null}
                    <div className="text-sm text-text-black truncate w-[100%]">
                      {fileName || editFile}
                    </div>
                  </div>
                  <Button
                    className="bg-transparent !p-0 hover:bg-transparent focus:ring-transparent"
                    variant={"primary-bg"}
                    onClick={handleRemoveImage}
                  >
                    <XCircleIcon className="!text-neutral-200 w-5 h-5" />
                  </Button>
                </div>
              ) : null}
              <input
                id={`${id}-file`}
                name={id}
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
                disabled={disabled}
                accept={fileTypes && fileTypes?.join(",")}
              />
            </div>
          </>
        ) : type === "textarea" ? (
          <textarea
            id={id}
            name={id}
            className={`relative z-0 w-full rounded-lg border p-3 text-body-base font-normal text-neutral-80 shadow-1 outline-none ring-[2.5px] ring-transparent transition-all duration-300 ease-out placeholder:text-neutral-50 2xl:p-3.5 ${className} ${variant?.includes("comments") && 'pl-14 min-h-[68px]'} ${(variant === "default" &&
              "border-neutral-30 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 disabled:overflow-x-scroll") ||
              (variant === "default-error" &&
                "border-error-border/50 focus:border-error-main focus:ring-error-surface") ||
              (variant === "phone" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-[102px]") ||
              (variant === "phone-error" &&
                "border-error-border/50 pl-16 focus:border-error-border focus:ring-error-surface 2xl:pl-[102px]") ||
              (variant === "currency" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16") ||
              (variant === "discount" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16") ||
              (variant === "logo" &&
                "border-neutral-30 pl-28 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-28") ||
              (variant === "logo-error" &&
                "border-error-border/50 pl-28 focus:border-error-border focus:ring-error-surface 2xl:pl-28") ||
              (variant === "text" &&
                "border-neutral-30  focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 ")
              }`}
            placeholder={placeholder ?? "Please add your placeholder"}
            value={value as string}
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={handleTextAreaChange}
            onBlur={onBlurTextArea}
          />
        ) : type === "time" ? (
          <TimePicker
            id={id}
            variant={variant}
            placeholder={placeholder}
            value={value}
            onChange={(time: string) =>
              handleTimeChange && handleTimeChange(time as string)
            }
          />
        ) : type === "address" ? (
          <form autoComplete="off">
            <PlacesAutocomplete
              value={inputValue}
              onChange={setInputValue}
              onSelect={(address: string) =>
                handlePlaceSelected({ formatted_address: address })
              }
              googleCallbackName="initGoogleMaps"
            >
              {({
                getInputProps,
                suggestions,
                getSuggestionItemProps,
                loading,
              }: any) => (
                <div className="relative">
                  <input
                    {...getInputProps({
                      placeholder: placeholder ?? "Enter an address",
                      className: `relative z-0 w-full rounded-lg border p-3 text-sm font-normal text-neutral-80 shadow-1 outline-none ring-[2.5px] ring-transparent transition-all duration-300 ease-out placeholder:text-neutral-50 ${variant === "default"
                        ? "border-neutral-30 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20"
                        : variant === "default-error"
                          ? "border-error-border/50 focus:border-error-main focus:ring-error-surface"
                          : ""
                        }`,
                    })}
                    disabled={disabled}
                  />
                  {(loading || suggestions.length > 0) && (
                    <div className="absolute top-full mt-1 w-full rounded-lg shadow-lg bg-white z-50 border border-neutral-300">
                      {suggestions.map((suggestion: any, index: number) => {
                        const className = suggestion.active
                          ? "cursor-pointer p-2 bg-primary-highlight text-neutral-800 rounded-md"
                          : "cursor-pointer p-2 bg-white text-neutral-800 hover:bg-neutral-100 rounded-md";

                        const { key, ...restProps } = getSuggestionItemProps(
                          suggestion,
                          {
                            className,
                            style: {
                              transition:
                                "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
                            },
                          }
                        );

                        return (
                          <div key={suggestion.placeId || index} {...restProps}>
                            <span>{suggestion.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </PlacesAutocomplete>
          </form>
        ) : (
          <input
            id={id}
            name={id}
            type={type}
            onKeyDown={handleKeyDown}
            autoComplete={autoComplete}
            className={`${inputStyle} relative z-0 w-full rounded-lg border p-3 text-sm font-normal text-neutral-80 shadow-1 outline-none ring-[2.5px] ring-transparent transition-all duration-300 ease-out placeholder:text-neutral-50 2xl:p-3.5 ${(variant === "default" &&
              "border-neutral-30 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 disabled:overflow-x-scroll") ||
              (variant === "default-icon" &&
                "border-neutral-30 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 disabled:overflow-x-scroll !pl-11") ||
              (variant === "default-error" &&
                "border-error-border/50 focus:border-error-main focus:ring-error-surface") ||
              (variant === "phone" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-[102px]") ||
              (variant === "comments" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-[102px]") ||
              (variant === "phone-error" &&
                "border-error-border/50 pl-16 focus:border-error-border focus:ring-error-surface 2xl:pl-[102px]") ||
              (variant === "currency" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16") ||
              (variant === "discount" &&
                "border-neutral-30 pl-16 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-16") ||
              (variant === "logo" &&
                "border-neutral-30 pl-28 focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 2xl:pl-28") ||
              (variant === "logo-error" &&
                "border-error-border/50 pl-28 focus:border-error-border focus:ring-error-surface 2xl:pl-28") ||
              (variant === "text" &&
                "border-neutral-30  focus:border-primary-main focus:ring-primary-surface disabled:bg-neutral-20 ")
              }`}
            placeholder={placeholder ?? "Please add your placeholder"}
            value={value && variant === "phone" ? formatPhoneNumber(value as string) : value as string }
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={handleChange}
            onBlur={onBlur}
            required={isRequired}
          />
        )}
      </div>

      {variant && message && (
        <p
          className={`text-sm tracking-[1%] ${variant.includes("error") ? "text-error-main" : "text-neutral-50"
            }`}
        >
          {message ?? "This is an error message."}
        </p>
      )}

      {variant?.includes("comments") && (
        <button
          className="absolute right-3 bottom-5 bg-primary-main text-white px-4 py-1.5 rounded-lg disabled:bg-[#E8B7CE] h-10 w-[83px]"
          disabled={!value || disabled}
          onClick={handleSubmit}
        >
          {disabled ? <LoadingIcon className="mx-auto" /> : "Submit"}
        </button>
      )}
    </div>
  );
};

export default Input;