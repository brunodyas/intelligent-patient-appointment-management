"use client";

import { LoadingIcon } from "@/assets/icons";
import { Button } from "@/components/atomics";
import { Modal } from "@/components/molecules";
import { useAuth } from "@/context/auth";
import { useUser } from "@/hooks/user/useUser";
import { useEffect, useState } from "react";
import UserForm from "./UserForm";
import { EditProfile } from "@/services/user";
import { useJune } from "@/hooks/useJune";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";

type Props = {
  SetOpenEditProfile: (value: boolean) => void;
  openEditProfile: boolean;
  setOpenSuccess: (val: boolean) => void;
  refetch: ((isCheckLocale?: boolean | undefined) => void) | undefined;
};

const userInitialValue: any = {
  name: "",
  email: "",
  photo: "",
  phone: "",
  role: "",
  franchise: null,
  tech_license_plate: "",
  tech_vehicle: "",
};

const TAB_OPTION = ["Profile"];

const ProfileSettingModal = ({
  openEditProfile,
  SetOpenEditProfile,
  setOpenSuccess,
  refetch,
}: Props) => {
  const [selectedTab, setSelectedTab] = useState("Profile");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [userData, setuserData] = useState<any>(userInitialValue);

  const { file, blob, reset, handleChangeFile, setDefault } = useUser();

  const { user } = useAuth();
  const analytics = useJune();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!userData.name) newErrors.title = "Name is required";
    if (!userData.email) newErrors.content = "Email is required";
    if (!userData.role) newErrors.role = "Role is required";
    if (!userData.tech_vehicle) newErrors.tech_vehicle = "Vehicle is required";
    const phoneRegex = /^\d{10}$/;
    if (userData.user_phone && !phoneRegex.test(unformatPhoneNumber(userData.user_phone))) {
      newErrors.user_phone = "Phone number must be exactly 10 digits.";
    }
    if (!userData.tech_license_plate)
      newErrors.tech_license_plate = "License plate is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsLoading(true);
      const response = await EditProfile({
        ...userData,
        ...(blob && { photo: blob }),
      });
      analytics?.track("EditProfile");
      response && setIsLoading(false);
      reset();
      SetOpenEditProfile(false);
      refetch && refetch();
      setOpenSuccess(true);
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setuserData({
        ...user,
        user_phone: user.user_phone ? user.user_phone.substring(2) : "",
      });
      user.photo && setDefault(user.photo);
    }
  }, [user]);

  return (
    <Modal
      variant="primary"
      className=""
      title={"Settings"}
      open={openEditProfile}
      setOpen={SetOpenEditProfile}
    >
      <div className="flex border-2 mt-2 rounded-xl">
        <nav className="flex-shrink-0 w-48 p-4 bg-gray-50 border-r rounded-l-xl">
          <ul className="space-y-4">
            {TAB_OPTION.map((item, index) => (
              <li
                key={index}
                className={`cursor-pointer ${
                  selectedTab === item
                    ? "text-primary-main font-semibold"
                    : "text-gray-500"
                }`}
                onClick={() => setSelectedTab(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-grow p-3">
          {selectedTab === "Profile" && (
            <section className="space-y-6">
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
            </section>
          )}

          {selectedTab === "Teams" && (
            <section className="space-y-6 min-h-[460px]">Teams</section>
          )}
          {selectedTab === "Session" && (
            <section className="space-y-6 min-h-[460px]">Session</section>
          )}
          <footer className="flex justify-end mt-6">
            <Button
              size="md"
              variant="primary-bg"
              onClick={async (e) => {
                await handleSubmit();
              }}
              disabled={isLoading}
            >
              {isLoading ? <LoadingIcon /> : "Save"}
            </Button>
          </footer>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileSettingModal;
