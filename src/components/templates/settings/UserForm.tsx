"use client";
import { Button, Input, Selectbox } from "@/components/atomics";

import { listFranchises } from "@/services/user";
import { FaUser } from "react-icons/fa";

import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import QuestionIcon from "@/assets/icons/QuestionIcon";
import UploadIcon from "@/assets/icons/UploadIcon";
import JPGIcon from "@/assets/icons/JPGIcon";
import CursorIcon from "@/assets/icons/CursorIcon";
import EmailIcon from "@/assets/icons/EmailIcon";
import Image from "next/image";
import { useJune } from "@/hooks/useJune";
import { useAuth } from "@/context/auth";
import useUserRoles from "@/hooks/useUserRoles";

interface UserData {
  name: string;
  email: string;
  password?: string;
  photo: string;
  user_phone: string;
  role: string;
  franchise_id: string;
  tech_license_plate: string;
  tech_vehicle: string;
}

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
  const [dataFranchises, setDataFranchises] = useState<any>();
  const { user } = useAuth();
  const analytics = useJune();
  

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
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

  const { isSuperAdmin, isCustomerCare, isAdmin, isTech, isCustomerCareManager } = useUserRoles();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isSuperAdmin || isCustomerCare || isCustomerCareManager) {
          const response = await listFranchises(1);
          analytics?.track("listFranchises");
          setDataFranchises(response.results);
        }
      } catch (e) {
        throw e;
      }
    };
    fetchData();
  }, [userRole]);

  const franchises = useMemo(() => {
    let franchises: SelectForm[] = [
      { label: "Select Franchise", disable: true },
    ];
    dataFranchises &&
      dataFranchises.map((item: any) => {
        franchises.push({ label: item.franchise_name, value: item.id });
      });
    return franchises;
  }, [dataFranchises]);


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
  
  const defaultFranchise = useMemo(() => {
    if (formData) {
      return franchises.find(
        (franchise) => franchise.label === formData?.franchise?.franchise_name
      );
    } else return null;
  }, [formData, franchises]);

  const handleTimeChange = (time: string, name: string) => {
    setFormData((prevState: Record<string, any>) => ({
      ...prevState,
      [name]: time,
    }));
  };

  return (
    <>
      <div
        id="form_name"
        className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
      >
        <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
          Name <span className="text-primary-main">*</span>
        </p>
        <div className="md:md:max-w-[512px] w-full">
          <Input
            className="text-base"
            id="name"
            variant="default"
            label=""
            isRequired
            placeholder=""
            value={formData.name}
            handleChange={handleChange}
          />
          {errors.name && errors.name && (
            <span className="text-red-500 text-xs">{errors.name}</span>
          )}
        </div>
      </div>
      <div
        id="form_email"
        className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
      >
        <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
          Email <span className="text-primary-main">*</span>
        </p>
        <div className="md:max-w-[512px] w-full">
          <div className="relative w-full">
            <Input
              id="email"
              variant="default-icon"
              label=""
              isRequired
              placeholder=""
              value={formData.email}
              handleChange={handleChange}
            />
            <EmailIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
          </div>
          {errors.email && errors.email && (
            <span className="text-red-500 text-xs">{errors.email}</span>
          )}
        </div>
      </div>

      {formType !== "edit" && (
        <div
          id="form_password"
          className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
        >
          <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
            Password <span className="text-primary-main">*</span>
          </p>
          <div className="md:max-w-[512px] w-full">
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
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200">
        <div className="text-gray-700 text-sm max-w-[280px] w-full">
          <div className="flex items-center gap-0.5 font-semibold">
            Your photo <span className="text-primary-main">*</span>
            <span className="text-primary-main">
              <QuestionIcon />
            </span>
          </div>
          <p className="text-gray-600">
            This will be displayed on your profile.
          </p>
        </div>
        <div className="md:max-w-[512px] w-full flex flex-col sm:flex-row gap-5 items-start mt-5 md:mt-0">
          <div className="h-[64px] w-[64px] rounded-full flex items-center justify-center bg-gray-200">
            <div>
              {file ? (
                <Image
                  src={file}
                  alt="user"
                  className="h-[64px] w-[64px] rounded-full object-cover flex items-center justify-center bg-gray-200"
                  width="10"
                  height="10"
                  unoptimized
                />
              ) : (
                <div className="h-[64px] w-[64px] rounded-full flex items-center justify-center bg-gray-200">
                  <FaUser size="50%" color="gray" />
                </div>
              )}
            </div>
          </div>
          <div
            {...getRootProps({ className: "dropzone" })}
            className="w-full sm:w-[calc(100%-84px)] border-[2px] border-primary-main rounded-xl px-6 py-4 cursor-pointer relative"
          >
            <div className="w-full flex justify-center">
              <UploadIcon />
            </div>
            <div className="text-gray-600 text-sm text-center mt-3">
              <p className="mb-1">
                <span className="text-primary-main font-semibold">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-[12px]">
                SVG, PNG, JPG or GIF (max. 800x400px)
              </p>
            </div>
            <div className="absolute -bottom-10 -right-4 hidden xl:block">
              <JPGIcon />
              <span className="absolute right-7 top-10">
                <CursorIcon />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        id="form_user_phone"
        className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
      >
        <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
          Phone
        </p>
        <div className="md:max-w-[512px] w-full">
          <Input
            id="user_phone"
            variant="phone"
            label=""
            placeholder=""
            value={formData?.user_phone}
            handleChange={handleChange}
            isRequired
          />
          {errors.user_phone && errors.user_phone && (
            <span className="text-red-500 text-xs">{errors.user_phone}</span>
          )}
        </div>
      </div>
      {(user?.role === "Super Admin" || user?.role === "Admin" || user?.role === "Customer Care" || user?.role === "Customer Care Manager") &&
        <>
          {[FILTER_OPTIONS].map((item, index) => (
            ((formData.role && formData.role !== "Tech") || index === 0) && (
              <div
                key={index}
                id="form_user_role"
                className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
              >
                <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
                  {item.title}
                </p>
                <div className="md:max-w-[512px] max-md:overflow-x-auto max-md:p-2 w-full">
                  <div className="flex gap-3 mt-2">
                    {item.button.map((button, buttonIndex) => (
                      button && (
                        <Button
                          key={buttonIndex}
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
                    ))}
                  </div>
                </div>
              </div>
            )
          ))}
        </>
      }
      <div
        id="form_shift_start_time"
        className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
      >
        <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
          Shift Start Time
        </p>
        <div className="md:max-w-[512px] w-full">
          <Input
            id="shift_start_time"
            type="time"
            variant="default"
            label=""
            placeholder="Enter start time"
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
      </div>
      <div
        id="form_shift_end_time"
        className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
      >
        <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
          Shift End Time
        </p>
        <div className="md:max-w-[512px] w-full">
          <Input
            id="shift_end_time"
            type="time"
            variant="default"
            label=""
            placeholder="Enter end time"
            value={formData?.shift_end_time}
            handleTimeChange={(time: string) =>
              handleTimeChange(time, "shift_end_time")
            }
          />

          {errors.shift_end_time && (
            <span className="text-red-500 text-xs">
              {errors.shift_end_time}
            </span>
          )}
        </div>
      </div>
      <div
        id="form_tech_vehicle"
        className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
      >
        <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
          Vehicle
        </p>
        <div className="md:max-w-[512px] w-full">
          <Input
            id="tech_vehicle"
            variant="default"
            label=""
            isRequired
            placeholder=""
            value={formData?.tech_vehicle}
            handleChange={handleChange}
          />
          {errors.tech_vehicle && errors.tech_vehicle && (
            <span className="text-red-500 text-xs">{errors.tech_vehicle}</span>
          )}
        </div>
      </div>
      <div
        id="form_tech_license_plate"
        className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
      >
        <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
          License plate
        </p>
        <div className="md:max-w-[512px] w-full">
          <Input
            id="tech_license_plate"
            variant="default"
            label=""
            isRequired
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
      </div>

      {formType === "superAdminPanel" && (
        <>
          <div
            id="form_franchise_name"
            className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
          >
            <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
              Franchise name
            </p>
            <div className="md:max-w-[512px] w-full">
              <Input
                id="franchise_name"
                variant="default"
                isRequired
                label=""
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
          </div>
          {/* <div
            id="form_price_markup"
            className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
          >
            <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
              Price Mark Up
            </p>
            <div className="md:max-w-[512px] w-full">
              <Input
                id="price_markup"
                variant="default"
                label=""
                value={formData?.price_markup}
                placeholder=""
                handleChange={handleChange}
              />
              {errors.price_markup && errors.price_markup && (
                <span className="text-red-500 text-xs">
                  {errors.price_markup}
                </span>
              )}
            </div>
          </div> */}
          <div>
            {/* <div className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200">
              <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
                Is Manufacturer?
              </p>
              <div className="md:max-w-[512px] w-full">
                <div className="flex gap-3">
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
          </div>
        </>
      )}

      {formType === "selectFranchise" && (userRole === "Super Admin" || userRole === "Customer Care Manager") && (
        <div
          id="form_franchise_id"
          className="flex flex-col md:flex-row gap-1.5 md:gap-5 pb-5 mb-6 border-b border-gray-200"
        >
          <p className="text-gray-700 text-sm font-semibold max-w-[280px] w-full">
            Franchise
          </p>
          <div className="md:max-w-[512px] w-full">
            <Selectbox
              label="Franchise"
              datas={franchises}
              selectedNow={true}
              selectedData={defaultFranchise}
              handleChange={(selected: any) => {
                handleClick("franchise_id", selected.value);
              }}
            />
            {errors.franchise_id && (
              <span className="text-red-500 text-xs">
                {errors.franchise_id}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserForm;