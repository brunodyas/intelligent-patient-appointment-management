"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { XIcon } from "@heroicons/react/outline";
import UserForm from "@/components/templates/user/UserForm";
import UserEditModal from "@/components/templates/user/UserEditModal";
import { Alerts, Button } from "@/components/atomics";
import { useUser } from "@/hooks/user/useUser";
import { AddUser } from "@/services/user";
import SpAdminFranchisePage from "../../templates/user/SpAdminFranchisePage";
import { useAuth } from "@/context/auth";
import { useJune } from "@/hooks/useJune";
import useUserRoles from "@/hooks/useUserRoles";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";

interface UserData {
  name: string;
  email: string;
  password?: string;
  photo: string;
  user_phone: string;
  role: string;
  tech_license_plate: string;
  tech_vehicle: string;
  shift_end_time: string;
  shift_start_time: string;
}

const DEFAULT_DATA: UserData = {
  name: "",
  email: "",
  password: "",
  photo: "",
  user_phone: "",
  role: "",
  tech_license_plate: "",
  tech_vehicle: "",
  shift_end_time: "",
  shift_start_time: "",
};

const Franchise = () => {
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [openSuccess, setOpenSuccess] = useState(false);
  const [selectUserId, setSelectUserId] = useState<number | null>(null);
  const [openAddUserModal, setopenAddUserModal] = useState(false);
  const [openModelEditUser, setopenModalEditUser] = useState(false);
  const [openResponseError, setOpenResponseError] = useState(false);
  const [openDeleteSuccess,setOpenDeleteSuccess] = useState(false);
  const [responseErrors, setResponseError] = useState<string[]>([]);
  const [reFetch, setRefetch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { isCustomerCare } = useUserRoles();

  const { file, blob, reset, handleChangeFile, setFile } = useUser();
  const { franchiseId } = useParams<{ franchiseId: string }>() ?? {franchiseId: ''};

  const analytics = useJune();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    let firstErrorFieldId: string | null = null;

    if (!formData.name) {
      newErrors.name = "Name is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_name";
    }
    if (!formData.user_phone) {
      newErrors.user_phone = "Phone number is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_user_phone";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
        if (!firstErrorFieldId) firstErrorFieldId = "form_email";
      }
    }
    if (formData.role == "Tech") {
      if (!formData.shift_start_time) {
        newErrors.shift_start_time = "Shift start time is required";
        if (!firstErrorFieldId) firstErrorFieldId = "form_shift_start_time";
      }
      if (!formData.shift_end_time) {
        newErrors.shift_end_time = "Shift end time is required";
        if (!firstErrorFieldId) firstErrorFieldId = "form_shift_end_time";
      }
      if (!formData.tech_vehicle) {
        newErrors.tech_vehicle = "Vehicle is required";
        if (!firstErrorFieldId) firstErrorFieldId = "form_tech_vehicle";
      }
      if (!formData.tech_license_plate) {
        newErrors.tech_license_plate = "License plate is required";
        if (!firstErrorFieldId) firstErrorFieldId = "form_tech_license_plate";
      }
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_password";
    } else {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password =
          "Password must be at least 8 characters, contain at least one capital letter, one symbol, and one number";
        if (!firstErrorFieldId) firstErrorFieldId = "form_password";
      }
    }
    const phoneRegex = /^\d{10}$/;
    if (formData.user_phone && !phoneRegex.test(unformatPhoneNumber(formData.user_phone))) {
      newErrors.user_phone = "Phone number must be exactly 10 digits.";
      if (!firstErrorFieldId) firstErrorFieldId = "form_user_phone";
    }
    if (!formData.role) {
      newErrors.role = "Role is required";
      if (!firstErrorFieldId) firstErrorFieldId = "form_role";
    }

    if (formData.tech_license_plate && formData.tech_license_plate.length > 20) {
      newErrors.tech_license_plate =
        "License plate must be 20 characters or fewer";
      if (!firstErrorFieldId) firstErrorFieldId = "form_tech_license_plate";
    }
    if (firstErrorFieldId) {
      const element: any = document.getElementById(firstErrorFieldId);
      element?.scrollIntoView({ behavior: "smooth" });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRefetch = () => {
    setRefetch((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsLoading(false);
      await AddUser({
        ...formData,
        ...(blob && { photo: blob }),
        franchise_id: franchiseId,
      });
      analytics?.track("AddUser");
      setOpenSuccess(true);
      handleRefetch();
    } catch (error: any) {
      let errorMessages = [];

      for (const field in error.response.data) {
        errorMessages.push(...error.response.data[field]);

      }
      setResponseError(errorMessages);
      setOpenResponseError(true)

      throw error;
    } finally {
      setIsLoading(false);
      setopenAddUserModal(false);
      setFormData(DEFAULT_DATA);
      reset();
    }
  };

  const userListConfig = {
    tableName: "User",
    disableAddButton: isCustomerCare,
    addAction: () => {
      setErrors({});
      setFormData(DEFAULT_DATA);
      setopenAddUserModal(true);
    },
    modals: [
      {
        title: "Add User",
        className: "max-w-4xl",
        open: openAddUserModal,
        setOpen: setopenAddUserModal,
        type: "sheet",
        modalChild: (
          <form className="flex flex-col justify-between h-full relative rounded-lg border">
            <main className="flex flex-col items-center h-[calc(100%-77px)] rounded-lg">
              <div className="w-10 h-[3px] bg-[#e0e0e0] smx:hidden flex top-2 left-1/2 -translate-x-1/2 absolute"></div>
              <header
                className={`space-y-2 flex items-center justify-between w-full p-4 smx:p-2 rounded-lg border border-transparent`}
              >
                <div className="w-7 h-7 smx:w-10 smx:h-10"></div>
                <h3 className="text-md font-semibold text-text-black !mt-0">
                  New User
                </h3>
                <button
                  aria-label="Close"
                  type="reset"
                  className="smx:hover:bg-[#33333326] smx:bg-transparent bg-background-lightest w-7 h-7 smx:w-10 smx:h-10 !mt-0 flex justify-center items-center rounded-full smx:rounded-lg duration-500"
                  onClick={() => {
                    setopenAddUserModal(false);
                  }}
                >
                  <XIcon className="smx:h-6 smx:w-6 h-5 w-5 text-neutral-200" />
                </button>
              </header>
              <div className="flex w-full flex-col gap-[25px] px-5 pt-4 overflow-auto h-[calc(100%-60px)] smx:h-[calc(100%-56px)] pb-[43px]">
                <UserForm
                  formType="superAdminFranchise"
                  setFormData={setFormData}
                  errors={errors}
                  formData={formData}
                  handleChangeFile={handleChangeFile}
                  file={file}
                  userRole={user?.role || ""}
                />
              </div>
            </main>

            <footer className="flex justify-start gap-4 px-6 py-5 border-t border-border-light">
              <Button
                size="md"
                variant="default-bg"
                className="px-4 py-[9px] smx:!text-sm !text-md w-full smx:w-fit order-1 flex smx:order-2 !rounded-lg cursor-pointer hover:!bg-[#F5F5F5] !border-[#33333326] bg-transparent text-text-black"
                onClick={() => {
                  setopenAddUserModal(false);
                }}
              >
                Cancel
              </Button>

              <Button
                size="md"
                variant="primary-bg"
                className="px-4 py-[9px] w-full smx:w-fit smx:!text-sm !text-md !rounded-lg order-2 flex smx:order-1"
                disabled={isLoading}
                onClick={async (e) => {
                  handleSubmit();
                }}
              >
                Submit
              </Button>
            </footer>
          </form>
        ),
      },
      {
        title: "Edit User",
        className: "max-w-4xl",
        open: openModelEditUser,
        setOpen: setopenModalEditUser,
        type: "modal",
        modalChild: (
          <UserEditModal
            setopenModalEditUser={setopenModalEditUser}
            editUserId={selectUserId || 0}
            setOpenSuccess={setOpenSuccess}
            refetch={handleRefetch}
            setOpenResponseError={setOpenResponseError}
            setResponseError={setResponseError}
          />
        ),
      },
    ],
    alerts: [
      <Alerts
        key="alert-addUser-added"
        variant="success"
        open={openSuccess}
        setOpen={setOpenSuccess}
        title="User Updated successfully!"
        desc="The user has been updated. You can now manage this user or update additional information as needed."
      />,
      <Alerts
      key="alert-deleteUser-deleted"
      variant="success"
      open={openDeleteSuccess}
      setOpen={setOpenDeleteSuccess}
      title="User has been deleted"
      desc="The user has been successfully deleted"
    />,
      <Alerts
        key="alert-response-error"
        variant="error"
        open={openResponseError}
        setOpen={setOpenResponseError}
        title="Error"
        desc={responseErrors}
      />,
    ],
  };

  return (
    <SpAdminFranchisePage
      selectUserId={selectUserId}
      setSelectUserId={setSelectUserId}
      reFetch={reFetch}
      config={userListConfig}
      setopenModalEditUser={setopenModalEditUser}
      setOpenDeleteSuccess={setOpenDeleteSuccess}
    />
  );
};

export default Franchise;
