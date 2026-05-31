import React, { useEffect, useState } from "react";
import { ArrowLeftIcon, XIcon } from "@heroicons/react/outline";
import { Button, Input } from "@/components/atomics";
import UserForm from "./UserForm";
import { useAuth } from "@/context/auth";
import { useUser } from "@/hooks/user/useUser";
import { EditUser, GetUserDetailsByID } from "@/services/user";
import { UserListDetails } from "@/interface/user";
import { useDropzone } from "react-dropzone";
import { LoadingIcon } from "@/assets/icons";
import { useJune } from "@/hooks/useJune";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";

interface UserEditModalProps {
  setopenModalEditUser: (value: boolean) => void;
  editUserId?: number;
  setOpenSuccess: (val: boolean) => void;
  refetch?: (user: any) => void;
  setOpenResponseError?: React.Dispatch<React.SetStateAction<boolean>>
  setResponseError?: React.Dispatch<React.SetStateAction<string[]>>
}

const userInitialValue: any = {
  name: "",
  email: "",
  photo: "",
  user_phone: "",
  role: "",
  franchise: null,
  tech_license_plate: "",
  tech_vehicle: "",
};

const UserEditModal = ({
  setopenModalEditUser,
  editUserId,
  setOpenSuccess,
  refetch,
  setOpenResponseError,
  setResponseError
}: UserEditModalProps) => {
  const [nestedModelContent, setNestedModelContent] = useState(false);
  const [userData, setuserData] = useState<UserListDetails>(userInitialValue);

  const { user, fetchUserDetails } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { file, blob, handleChangeFile, setDefault, reset } = useUser();
  const analytics = useJune();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetUserDetailsByID(editUserId?.toString() || "");
        analytics?.track("GetUserDetailsByID");
        if (response) {
          const { photo, ...restOfResponse } = response
          setuserData({
            ...restOfResponse,
            user_phone: response.user_phone
              ? response.user_phone.substring(2)
              : "",
          });
          photo && setDefault(photo);
        }
      } catch (e) {
        throw e;
      }
    };
    fetchData();
  }, [editUserId]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!userData.name) newErrors.name = "Name is required";
    if (!userData.user_phone) {
      newErrors.user_phone = "Phone number is required";
    }
    if (!userData.email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    if (!userData.role) newErrors.role = "Role is required";
    if (userData.role == "Tech") {
      if (!userData.shift_start_time) {
        newErrors.shift_start_time = "Shift start time is required";
      }
      if (!userData.shift_end_time) {
        newErrors.shift_end_time = "Shift end time is required";
      }

      if (!userData.tech_vehicle) newErrors.tech_vehicle = "Vehicle is required for technicians";

      if (!userData.tech_license_plate) {
        newErrors.tech_license_plate = "License plate is required";
      }
    }
    
    if (userData.tech_license_plate?.length > 20) {
      newErrors.tech_license_plate =
        "License plate must be 20 characters or fewer";
    }

    const phoneRegex = /^\d{10}$/;
    if (userData.user_phone && !phoneRegex.test(unformatPhoneNumber(userData.user_phone))) {
      newErrors.user_phone = "Phone number must be exactly 10 digits.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsLoading(true);

      const { tech_license_plate, tech_vehicle, user_phone, ...restOfFormData } = userData
      const isEmpty = tech_license_plate.trim() === "" ||  tech_vehicle.trim() === ""

      const updatedUser = await EditUser(
        {
          ...restOfFormData,
        ...(user_phone ? {user_phone: unformatPhoneNumber(user_phone)} : {}),
        ...(userData.role === "Tech" && !isEmpty ? {tech_license_plate, tech_vehicle} : {}),
          ...(blob && { photo: blob }),
        },
        editUserId || 0
      );
      analytics?.track("EditUser");
      refetch && refetch(updatedUser);
      setOpenSuccess(true);
      setopenModalEditUser(false);
      user &&
        String(userData.id) === String(user.id) &&
        fetchUserDetails &&
        fetchUserDetails();
    } catch (error: any) {
      let errorMessages = [];

      if (error?.response?.data) {        
        for (const field in error?.response?.data) {
          const messages = error?.response?.data[field];
          if (Array.isArray(messages)) {
            const fieldMessages = messages?.map(msg => `${field}: ${msg}`);
            errorMessages.push(...fieldMessages);
          } else if (typeof messages === 'string') {
            errorMessages.push(`${field}: ${messages}`);
          }
        }
      }

      if(!errorMessages.length) {
        errorMessages.push("An error occurred while updating the User.");
      }
      if (setOpenResponseError) {
        setOpenResponseError(true);
      }
      if (setResponseError) {
        setResponseError(errorMessages);
      }

      throw error;

    } finally {
      setIsLoading(false);
      reset();
    }
  };

  return (
    <>
      {!nestedModelContent ? (
        <div>
          <main className="flex flex-col items-center justify-center">
            <header
              className={`text-center flex smx:hidden justify-between items-center w-full px-5 py-1.5 sticky top-0 bg-background-primary z-4`}
            >
              <Button
                size="md"
                variant="disabled-nude"
                className="px-0 py-2.5 text-base !rounded-lg cursor-pointer text-primary-main"
                onClick={() => {
                  setopenModalEditUser(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="md"
                variant="disabled-nude"
                className="px-0 py-2.5 text-base !rounded-lg text-primary-main cursor-pointer !w-[82px] !h-9"
                disabled={isLoading}
                onClick={async (e) => {
                  await handleSubmit();
                }}
              >
                {isLoading ? <LoadingIcon /> : "Submit"}
              </Button>
            </header>
            <header className="text-center hidden smx:flex justify-between items-center w-full px-4 py-2 sticky top-0 bg-background-primary z-40">
              <div></div>
              <h3 className="text-md font-semibold text-text-black">
                Edit Profile
              </h3>
              <button
                aria-label="Close"
                onClick={() => {
                  setopenModalEditUser(false);
                }}
                className="hover:bg-[#33333326] w-10 h-10 flex justify-center items-center rounded-lg duration-500"
              >
                <XIcon className="h-7 w-7 text-neutral-200" />
              </button>
            </header>
            <div
              className={`border-none grid w-full grid-cols-1 gap-[25px] px-5 h-[calc(85vh-233px)] overflow-auto pt-4 pb-6`}
            >
              <UserForm
                setFormData={setuserData}
                errors={errors}
                formData={userData}
                formType="edit"
                userRole={user?.role || ""}
                handleChangeFile={handleChangeFile}
                file={file}
              />
            </div>
          </main>
          <footer className="flex justify-start gap-4 px-6 py-5 border-t border-border-light">
            <Button
              size="md"
              variant="primary-bg"
              className="px-4 text-sm !rounded-lg !w-[82px] !h-10"
              disabled={isLoading}
              onClick={async (e) => {
                await handleSubmit();
              }}
            >
              {isLoading ? <LoadingIcon /> : "Submit"}
            </Button>
            <Button
              size="md"
              variant="default-bg"
              className="px-4 !py-0 !h-10 text-sm !rounded-lg cursor-pointer hover:!bg-[#F5F5F5] !border-[#33333326] bg-transparent text-text-black"
              onClick={() => {
                setopenModalEditUser(false);
              }}
            >
              Cancel
            </Button>
          </footer>
        </div>
      ) : (
        <main className="flex flex-col items-center justify-center">
          <header className="text-center flex justify-between items-center w-full px-5 py-1 sticky top-0 bg-background-primary z-40">
            <button className="hover:bg-[#f5f5f5] w-10 h-10 flex justify-center items-center rounded-lg duration-500">
              <ArrowLeftIcon
                className="w-6 h-6 text-primary-main"
                onClick={() => setNestedModelContent(false)}
              />
            </button>
            <h3 className="text-md font-semibold text-text-black smx:flex hidden">
              Internal Franchisee
            </h3>
            <button
              aria-label="Close"
              onClick={() => setNestedModelContent(false)}
              className="hover:bg-[#33333326] w-10 h-10 flex justify-center items-center rounded-lg duration-500"
            >
              <XIcon className="h-7 w-7 text-neutral-200" />
            </button>
          </header>
          <div className="w-full gap-6 px-5 overflow-auto pt-4 pb-6">
            <Input
              className="text-base"
              id="name"
              type="number"
              variant="input"
              label="Price Markup (ex 1.5x, 2x, etc)"
              placeholder=""
            //   handleChange={handleChange}
            />
          </div>
        </main>
      )}
    </>
  );
};

export default UserEditModal;
