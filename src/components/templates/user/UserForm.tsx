"use client";
import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { FaUser } from "react-icons/fa";
import {
  Button,
  Input,
  MultipleSelectBox,
} from "@/components/atomics";
import Image from "next/image";
import { useAuth } from "@/context/auth";
import { UserData } from "@/interface/user";

interface SelectForm {
  label: string;
  value?: string;
  disable?: boolean;
}

interface UserFormProps {
  setFormData: (value: any) => void;
  errors: any;
  formData: any;
  userRole?: string;
  handleChangeFile: (files: File[]) => void;
  file: any;
  formType?: string;
}

const UserForm = ({
  formType = "default",
  setFormData,
  formData,
  errors,
  userRole = "Tech",
  handleChangeFile,
  file,
}: UserFormProps) => {
  const { user } = useAuth();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTimeChange = (time: string, name: string) => {
    setFormData((prevState: Record<string, any>) => ({
      ...prevState,
      [name]: time,
    }));
  };

  const handleClick = (label: keyof UserData, value: string) => {
    setFormData((prevState: any) => ({
      ...prevState,
      [label]: value,
    }));
  };

  const { getRootProps } = useDropzone({
    onDrop: (files) => {
      const imageFiles = files?.filter(file => file?.type?.startsWith('image/'));
      if(imageFiles?.length) {
        handleChangeFile(imageFiles);
      }
    },
  });

  const FILTER_OPTIONS = useMemo(() => {
    const optionSuperAdmin = ["Super Admin", "Admin", "Tech", "Customer Care", "Customer Care Manager"];
    const optionAdmin = ["Admin", "Tech"];
    const optionTech = ["Tech"];
    return {
      title: "Role",
      label: "role",
      button:
        userRole === "Super Admin" || userRole === "Customer Care Manager"
          ? optionSuperAdmin
          : userRole === "Admin"
            ? optionAdmin
            : optionTech
    }
  }, [userRole]);
    
  return (
    <>
      <div id="form_name">
        <Input
          className="text-base"
          id="name"
          variant="default"
          label="Name"
          isRequired
          placeholder=""
          value={formData.name}
          handleChange={handleChange}
        />
        {errors.name && errors.name && (
          <span className="text-red-500 text-xs">{errors.name}</span>
        )}
      </div>
      <div id="form_email">
        <Input
          id="email"
          variant="default"
          label="Email"
          isRequired
          placeholder=""
          value={formData.email}
          handleChange={handleChange}
        />
        {errors.email && errors.email && (
          <span className="text-red-500 text-xs">{errors.email}</span>
        )}
      </div>
      {formType !== "edit" && (
        <div id="form_password">
          <Input
            className="text-base"
            id="password"
            variant="default"
            type="password"
            label="Password"
            isRequired
            placeholder=""
            handleChange={handleChange}
          />
          {errors.password && errors.password && (
            <span className="text-red-500 text-xs">{errors.password}</span>
          )}
        </div>
      )}

      <label
        className={`text-sm font-semibold text-neutral-100 max-sm:text-xs`}
      >
        Image
      </label>
      <div
        {...getRootProps({ className: "dropzone" })}
        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-netral-30 bg-netral-15 py-8"
      >
        <div className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200">
          <div>
            {file ? (
              <Image
                src={file}
                height={1}
                width={1}
                alt="user"
                className={
                  "h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200 object-cover"
                }
                unoptimized
              />
            ) : (
              <div className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200">
                <FaUser size="50%" color="gray" />
              </div>
            )}
          </div>
        </div>
        <Button size="sm" variant="primary-bg" className="my-2">
          Choose File
        </Button>
        <h5 className="text-xs text-netral-50">
          {file ? file?.name : "or drop file to upload"}
        </h5>
      </div>
      <div id="form_user_phone">
        <Input
          id="user_phone"
          variant="phone"
          label="Phone"
          isRequired
          placeholder=""
          value={formData?.user_phone}
          handleChange={handleChange}
        />
        {errors.user_phone && errors.user_phone && (
          <span className="text-red-500 text-xs">{errors.user_phone}</span>
        )}
      </div>
      {userRole !== "Tech" &&
        [FILTER_OPTIONS].map((item, index) => (
          <div className="w-full flex-col " key={index} id="form_role">
            <label className="text-sm font-semibold text-neutral-100 max-sm:text-xs">
              {item.title}
              {item.label === "role" && <span className="text-error-main">*</span>}
            </label>
            <div className="flex gap-3 mt-2 overflow-x-auto h-max px-1 py-2">
              {item.button.map(
                (button, index) =>
                  button && (
                    <Button
                      key={index}
                      onClick={() =>
                        handleClick(item.label as keyof UserData, button)
                      }
                      size="md"
                      variant={
                        formData?.[item.label as keyof UserData] === button
                          ? "tab-selected"
                          : "tab-unselect"
                      }
                      className="!rounded-[999px]"
                    >
                      {button}
                    </Button>
                  )
              )}
            </div>
            {errors[item.label] && errors[item.label] && (
              <span className="text-red-500 text-xs">{errors[item.label]}</span>
            )}
          </div>
        ))}

      <div id="form_shift_start_time">
        <Input
          id="shift_start_time"
          type="time"
          variant="default"
          label="Shift Start Time"
          placeholder="Enter start time"
          isRequired={formData.role === "Tech"}
          value={formData?.shift_start_time}
          handleTimeChange={(time: string) =>
            handleTimeChange(time, "shift_start_time")
          }
        />
        {errors?.shift_start_time && (
          <span className="text-red-500 text-xs">
            {errors.shift_start_time}
          </span>
        )}
      </div>
      <div id="form_shift_end_time">
        <Input
          id="shift_end_time"
          type="time"
          variant="default"
          label="Shift End Time"
          placeholder="Enter end time"
          isRequired={formData.role === "Tech"}
          value={formData?.shift_end_time}
          handleTimeChange={(time: string) =>
            handleTimeChange(time, "shift_end_time")
          }
        />
        {errors.shift_end_time && (
          <span className="text-red-500 text-xs">{errors.shift_end_time}</span>
        )}
      </div>
      <div id="form_tech_vehicle">
        <Input
          id="tech_vehicle"
          variant="input"
          label="Vehicle"
          isRequired={formData.role === "Tech"}
          placeholder=""
          value={formData?.tech_vehicle}
          handleChange={handleChange}
        />
        {errors.tech_vehicle && errors.tech_vehicle && (
          <span className="text-red-500 text-xs">{errors.tech_vehicle}</span>
        )}
      </div>
      <div id="form_tech_license_plate">
        <Input
          id="tech_license_plate"
          variant="input"
          label="License plate"
          isRequired={formData.role === "Tech"}
          placeholder=""
          value={formData?.tech_license_plate}
          handleChange={handleChange}
        />
        {errors.tech_license_plate && errors.tech_license_plate && (
          <span className="text-red-500 text-xs">
            {errors.tech_license_plate}
          </span>
        )}
      </div>

      {formType === "superAdminPanel" && (
        <>
          <div id="form_franchise_name">
            <Input
              id="franchise_name"
              variant="default"
              isRequired
              label="Franchise name"
              value={formData?.franchise_name}
              placeholder="Enter Franchise Name"
              handleChange={handleChange}
            />
            {errors.franchise_name && errors.franchise_name && (
              <span className="text-red-500 text-xs">
                {errors.franchise_name}
              </span>
            )}
          </div>
          <div id="form_franchise_address">
            <Input
              type="address"
              id="franchise_address"
              variant="default"
              label="Franchise Address"
              placeholder="Enter Franchise Address"
              handleChange={handleChange}
              value={formData.franchise_address}
              isRequired={true}
              disabled={false}
            />
                 
            {errors.franchise_address && errors.franchise_address && (
              <span className="text-red-500 text-xs">
                {errors.franchise_address}
              </span>
            )}
          </div>
          <div id="form_website_url">
            <Input
              className="text-base"
              id="website_url"
              variant="default"
              label="Website Url"
              placeholder=""
              value={formData?.website_url}
              handleChange={handleChange}
            />
            {errors.website_url && errors.website_url && (
              <span className="text-red-500 text-xs">{errors.website_url}</span>
            )}
          </div>
          {(user?.role == "Super Admin" || user?.role === "Customer Care Manager") && (
            <div id="form_zip_codes_covered">
              <MultipleSelectBox
                label="Franchise Zip Codes"
                variant="default"
                handleChange={(e: any) =>
                  handleChange({
                    target: {
                      name: "zip_codes_covered",
                      value: e,
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              />
              {errors.zip_codes_covered && errors.zip_codes_covered && (
                <span className="text-red-500 text-xs">
                  {errors.zip_codes_covered}
                </span>
              )}
            </div>
          )}
          <div id="form_secondry_zip_codes_covere">
            <MultipleSelectBox
              label="Out-of-Territory Zip Codes"
              variant="default"
              handleChange={(e: any) =>
                handleChange({
                  target: {
                    name: "zip_codes_would_accept_outside_owned",
                    value: e,
                  },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            />
            {errors.zip_codes_would_accept_outside_owned &&
              errors.zip_codes_would_accept_outside_owned && (
                <span className="text-red-500 text-xs">
                  {errors.zip_codes_would_accept_outside_owned}
                </span>
              )}
          </div>
          {/* <div id="form_price_markup">
            <Input
              id="price_markup"
              variant="input"
              label="Price Mark Up"
              value={formData?.price_markup}
              placeholder=""
              handleChange={handleChange}
            />
            {errors.price_markup && errors.price_markup && (
              <span className="text-red-500 text-xs">
                {errors.price_markup}
              </span>
            )}
          </div> */}
          {/* <div>
            <div className="w-full flex-col">
              <label className="text-sm font-semibold text-neutral-100 max-sm:text-xs">
                Is Manufacturer?
              </label>
              <div className="flex gap-3 mt-2">
                <Button
                  onClick={() =>
                    handleClick("is_manufacturer" as keyof UserData, "Yes")
                  }
                  size="md"
                  variant={
                    formData?.is_manufacturer === "Yes"
                      ? "tab-selected"
                      : "tab-unselect"
                  }
                  className="!rounded-[999px]"
                >
                  Yes
                </Button>
                <Button
                  onClick={() =>
                    handleClick("is_manufacturer" as keyof UserData, "No")
                  }
                  size="md"
                  variant={
                    formData?.is_manufacturer === "No"
                      ? "tab-selected"
                      : "tab-unselect"
                  }
                  className="!rounded-[999px]"
                >
                  No
                </Button>
              </div>
            </div>
          </div> */}
        </>
      )}
    </>
  );
};

export default UserForm;
