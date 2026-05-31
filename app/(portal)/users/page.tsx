"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/auth";
import { AddUser } from "@/services/user";
import { XIcon } from "@heroicons/react/outline";
import { useUser } from "@/hooks/user/useUser";
import UserForm from "@/components/templates/user/UserForm";
import UserlistPage from "@/components/templates/user/UserlistPage";
import UserEditModal from "@/components/templates/user/UserEditModal";
import { Alerts, Button } from "@/components/atomics";
import { LoadingIcon } from "@/assets/icons";
import { useJune } from "@/hooks/useJune";
import useUserRoles from "@/hooks/useUserRoles";
import { UserData } from "@/interface/user";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";

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

const Users = () => {
  const { isCustomerCare } = useUserRoles();

  const [openAddUserModal, setopenAddUserModal] = useState(false);
  const [openModelEditUser, setopenModalEditUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [openResponseError, setOpenResponseError] = useState(false);
  const [responseErrors, setResponseError] = useState<string[]>([]);
  const [openDeleteSuccess,setOpenDeleteSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openEditSuccess, setOpenEditSuccess] = useState(false)
  const [reFetch, setRefetch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { user } = useAuth();
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
        newErrors.tech_vehicle = "Vehicle is required for technicians";
        if (!firstErrorFieldId) firstErrorFieldId = "form_tech_vehicle";
      }
      if (!formData.tech_license_plate) {
        newErrors.tech_license_plate = "License plate is required for technicians";
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
    
    if (firstErrorFieldId) {
      const element: HTMLElement | null =
        document.getElementById(firstErrorFieldId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const { file, blob, reset, handleChangeFile } = useUser();

  const handleRefetch = (user?: any) => {
    user && setSelectedUser(user);
    setRefetch((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsLoading(true);
      const { tech_license_plate, tech_vehicle, user_phone, ...restOfFormData } = formData
      const isEmpty = tech_license_plate.trim() === "" ||  tech_vehicle.trim() === ""

      const response = await AddUser({
        franchise_id: user?.franchise.id,
        ...restOfFormData,
        ...(user_phone ? {user_phone: unformatPhoneNumber(user_phone)} : {}),
        ...(formData.role === "Tech" && !isEmpty ? {tech_license_plate, tech_vehicle} : {}),
        ...(blob && { photo: blob }),
      });
      analytics?.track("AddUser");
      response && setIsLoading(false);
      setopenAddUserModal(false);
      handleRefetch();
      setOpenSuccess(true);
      reset();
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
    }
  };

  const userListConfig = {
    tableName: "User",
    addAction: () => {
      setErrors({});
      setFormData(DEFAULT_DATA);
      setopenAddUserModal(true);
    },
    disableAddButton: isCustomerCare,
    modals: [
      {
        title: "Add User",
        className: "max-w-4xl",
        open: openAddUserModal,
        setOpen: setopenAddUserModal,
        type: "sheet",
        modalChild: openAddUserModal && (
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
                  formType="selectFranchise"
                  setFormData={setFormData}
                  errors={errors}
                  formData={formData}
                  userRole={user?.role || ""}
                  handleChangeFile={handleChangeFile}
                  file={file}
                />
              </div>
            </main>

            <footer className="flex justify-start gap-4 px-6 py-5 border-t border-border-light">
              <Button
                size="md"
                variant="default-bg"
                className="px-4 py-2.5 smx:!text-sm !text-md w-full smx:w-fit order-1 flex smx:order-2 !rounded-lg cursor-pointer hover:!bg-[#F5F5F5] !border-[#33333326] bg-transparent text-text-black"
                onClick={() => {
                  setopenAddUserModal(false);
                }}
              >
                Cancel
              </Button>

              <Button
                size="md"
                disabled={isLoading}
                variant="primary-bg"
                className="px-4 py-2.5 smx:w-fit smx:!text-sm !text-md !rounded-lg order-2 flex smx:order-1 !w-[82px] !h-[43px]"
                onClick={async (e) => {
                  await handleSubmit();
                }}
              >
                {isLoading ? <LoadingIcon /> : "Submit"}
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
        modalChild: openModelEditUser && (
          <UserEditModal
            setopenModalEditUser={setopenModalEditUser}
            editUserId={selectedUserId || 0}
            setOpenSuccess={setOpenEditSuccess}
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
        title="User added successfully!"
        desc="The user has been added. You can now manage this user or add additional information as needed."
      />,
      <Alerts  
        key="alert-editUser-added"
        variant="success"
        open={openEditSuccess}
        setOpen={setOpenEditSuccess}
        title="User updated successfully!"
        desc="The user has been updated. You can further manage this user or update additional information as needed."
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
    <UserlistPage
      config={userListConfig}
      setopenModalEditUser={setopenModalEditUser}
      setSelectedUserId={setSelectedUserId}
      selectedUserId={selectedUserId}
      reFetch={reFetch}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      setOpenDeleteSuccess={setOpenDeleteSuccess}
    />
  );
};

export default Users;
