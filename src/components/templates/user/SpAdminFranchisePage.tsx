"use client";
import React, { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { Button, Title } from "@/components/atomics";
import { MagnifyingGlassIcon, PlusIcon } from "@/assets/icons";
import { Modal, Sheet } from "@/components/molecules";
import { User } from "@/interface/user";
import { DeleteUserByID } from "@/services/user";
import { size } from "@/constants/constants";
import UsersCard from "./UsersCard";
import { listUsers } from "@/services/user";
import { useParams } from "next/navigation";
import { useJune } from "@/hooks/useJune";
import { twMerge } from "tailwind-merge";
import { USER_ROLES } from "@/constants/enums/roles";

interface UserListConfig {
  tableName: string;
  modals?: {
    title: string;
    className: string;
    open: boolean;
    type: string;
    setOpen: (isOpen: boolean) => void;
    modalChild: ReactNode;
  }[];
  alerts?: ReactNode[];
  addAction: () => void;
  disableAddButton?: boolean;
}

interface UserListProps {
  config: UserListConfig;
  setopenModalEditUser: (value: boolean) => void;
  reFetch: boolean;
  selectUserId: number | null;
  setSelectUserId: (value: number) => void;
  setOpenDeleteSuccess:(value: boolean) => void;
}

const SpAdminFranchisePage: React.FC<UserListProps> = ({
  selectUserId,
  setSelectUserId,
  reFetch,
  config,
  setopenModalEditUser,
  setOpenDeleteSuccess
}) => {
  const { franchiseId } = useParams<{ franchiseId: string }>() ?? {franchiseId: ''};

  const [admins, setAdmins] = useState<User[]>([]);
  const [techs, setTechs] = useState<User[]>([]);
  const [customerCares, setCustomerCares] = useState<User[]>([]);
  const [customerCaresManager, setCustomerCaresManager] = useState<User[]>([]);
  const [superAdmins, setSuperAdmins] = useState<User[]>([]);

  const [adminPage, setAdminPage] = useState(1);
  const [techPage, setTechPage] = useState(1);
  const [customerCarePage, setCustomerCarePage] = useState(1);
  const [customerCareManagerPage, setcustomerCareManagerPage] = useState(1);
  const [superAdminPage, setSuperAdminPage] = useState(1);

  const [superAdminTotalPages, setSuperAdminTotalPages] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [techTotalPages, setTechTotalPages] = useState(1);
  const [customerCaresTotalPages, setCustomerCaresTotalPages] = useState(1);
  const [customerCaresTotalManagerPages, setCustomerCaresManagerTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const timeoutRef = useRef<any>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const analytics = useJune();

  const { addAction, modals, alerts, disableAddButton } = config;

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchUsersByRole(USER_ROLES.ADMIN, adminPage, setAdmins, setAdminTotalPages, search);
    }
  }, [adminPage, reFetch])

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchUsersByRole(USER_ROLES.TECH, techPage, setTechs, setTechTotalPages, search);
    }
  }, [techPage, reFetch])

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchUsersByRole(
        USER_ROLES.CUSTOMER_CARE,
        customerCarePage,
        setCustomerCares,
        setCustomerCaresTotalPages,
        search
      );
    }
  }, [customerCarePage, reFetch])

  useEffect(() => {
    if (typeof window !== "undefined") {
        fetchUsersByRole(
          USER_ROLES.SUPER_ADMIN,
          superAdminPage,
          setSuperAdmins,
          setSuperAdminTotalPages,
          search
        );
    }
  }, [superAdminPage, reFetch]);

  useEffect(() => {
    if (typeof window !== "undefined") {
        fetchUsersByRole(
          USER_ROLES.CUSTOMER_CARE_MANAGER,
          customerCareManagerPage,
          setCustomerCaresManager,
          setCustomerCaresManagerTotalPages,
          search
        );
    }
  }, [customerCareManagerPage, reFetch]);

  

  const fetchUsersByRole = (
    role: string,
    page: number,
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    setTotalPages: React.Dispatch<React.SetStateAction<number>>,
    searchValue?: string
  ) => {
    listUsers(role, page, franchiseId, searchValue)
      .then((response) => {
        const results = response.results || [];
        setUsers(results);
        setTotalPages(Math.ceil(response.count / size));
      })
      .catch((error) => {
        console.error(`Error fetching ${role} users:`, error);
      });
    analytics?.track("listUsers");
  };

  const handlePageChange = (role: string, page: number) => {
    if (role === USER_ROLES.SUPER_ADMIN) {
      setSuperAdminPage(page);
    } else if (role === USER_ROLES.ADMIN) {
      setAdminPage(page);
    } else if (role === USER_ROLES.TECH) {
      setTechPage(page);
    } else if (role === USER_ROLES.CUSTOMER_CARE) {
      setCustomerCarePage(page);
    } else if (role === USER_ROLES.CUSTOMER_CARE_MANAGER) {
      setcustomerCareManagerPage(page);
    }
  };

  const handleDeleteUser = async () => {
    if (selectUserId) {
      try {
        // Call the API to delete the user
        await DeleteUserByID(selectUserId.toString());
        analytics?.track("DeleteUserByID");
        setOpenDeleteModal(false);
        setOpenDeleteSuccess(true);
        // Refresh user list after deletion
        fetchUsersByRole(USER_ROLES.SUPER_ADMIN, superAdminPage, setSuperAdmins, setSuperAdminTotalPages, search);
        fetchUsersByRole(USER_ROLES.ADMIN, adminPage, setAdmins, setAdminTotalPages, search);
        fetchUsersByRole(USER_ROLES.TECH, techPage, setTechs, setTechTotalPages, search);
        fetchUsersByRole(
          USER_ROLES.CUSTOMER_CARE,
          customerCarePage,
          setCustomerCares,
          setCustomerCaresTotalPages,
          search
        );
        fetchUsersByRole(
          USER_ROLES.CUSTOMER_CARE_MANAGER,
          customerCareManagerPage,
          setCustomerCaresManager,
          setCustomerCaresManagerTotalPages,
          search
        );
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchUsersByRole(USER_ROLES.SUPER_ADMIN, superAdminPage, setSuperAdmins, setSuperAdminTotalPages, searchValue);
      fetchUsersByRole(USER_ROLES.ADMIN, adminPage, setAdmins, setAdminTotalPages, searchValue);
      fetchUsersByRole(USER_ROLES.TECH, techPage, setTechs, setTechTotalPages, searchValue);
      fetchUsersByRole(
        USER_ROLES.CUSTOMER_CARE,
        customerCarePage,
        setCustomerCares,
        setCustomerCaresTotalPages,
        searchValue
      );
      fetchUsersByRole(
        USER_ROLES.CUSTOMER_CARE_MANAGER,
        customerCareManagerPage,
        setCustomerCaresManager,
        setCustomerCaresManagerTotalPages,
        searchValue
      );

    }, 2000);
    setSearch(searchValue)
  }, [])

  return (
    <div className="relative px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8 py-6">
      <h1 className="text-xl sm:text-body-xl font-semibold"></h1>
      <section className="relative rounded-lg-10 bg-white">
        <nav className="space-y-4 smx:mb-7 mb-3">
          <div className="flex justify-between items-center">
            <Title
              size="2xl"
              variant={"undefined"}
              className="gap-0 !text-2xl text-text-black"
            >
              Users
            </Title>

            <div className="flex items-center gap-2 !mt-0">
              <div className="relative w-72 2xl:w-96 smx:flex hidden">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
                <input
                  className="w-full !text-sm rounded-lg border-2 border-transparent bg-background-lightest px-3.5 py-[5px] pl-11 outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus:border-primary-main disabled:bg-neutral-20 hover:border-2 hover:border-[#33333326]"
                  placeholder="Search" value={search || ""} onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button
                disabled={disableAddButton}
                size="md"
                variant="primary-bg"
                onClick={addAction}
                className={twMerge(
                  "!py-1.5 !px-[13px] text-md smx:!text-sm !rounded-full smx:!rounded-lg !gap-1.5 hover:!bg-[#BC3A79]",
                  disableAddButton && "hidden"
                )}
              >
                <PlusIcon className="h-4 w-4 smx:h-5 smx:w-5 stroke-[10px]" />
                Add User
              </Button>
            </div>
          </div>
          <div className="relative w-full smx:hidden flex smx:!mt-0 !mt-3">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
            <input
              className="w-full !text-sm rounded-lg border-2 border-transparent bg-background-lightest px-3.5 py-[5px] pl-11 outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus:border-primary-main disabled:bg-neutral-20 hover:border-2 hover:border-[#33333326]"
              placeholder="Search"
            />
          </div>
        </nav>

        <section className="py-4">
          <UsersCard
            role={USER_ROLES.SUPER_ADMIN}
            users={superAdmins}
            currentPage={superAdminPage}
            totalPages={superAdminTotalPages}
            setopenModalEditUser={setopenModalEditUser}
            disableAddButton={disableAddButton}
            setOpenModalDelete={setOpenDeleteModal}
            setSelectedUserId={setSelectUserId}
            setSelectedUser={() => { }}
            setSelectedUserIndex={() => { }}
            handlePageChange={handlePageChange}
          />
          <UsersCard
            role={USER_ROLES.ADMIN}
            users={admins}
            currentPage={adminPage}
            totalPages={adminTotalPages}
            setopenModalEditUser={setopenModalEditUser}
            disableAddButton={disableAddButton}
            setOpenModalDelete={setOpenDeleteModal}
            setSelectedUserId={setSelectUserId}
            setSelectedUser={() => { }}
            setSelectedUserIndex={() => { }}
            handlePageChange={handlePageChange}
          />

          <UsersCard
            role={USER_ROLES.TECH}
            users={techs}
            currentPage={techPage}
            totalPages={techTotalPages}
            setopenModalEditUser={setopenModalEditUser}
            disableAddButton={disableAddButton}
            setOpenModalDelete={setOpenDeleteModal}
            setSelectedUserId={setSelectUserId}
            setSelectedUser={() => { }}
            setSelectedUserIndex={() => { }}
            handlePageChange={handlePageChange}
          />

          <UsersCard
            role={USER_ROLES.CUSTOMER_CARE}
            users={customerCares}
            currentPage={customerCarePage}
            totalPages={customerCaresTotalPages}
            setopenModalEditUser={setopenModalEditUser}
            disableAddButton={disableAddButton}
            setOpenModalDelete={setOpenDeleteModal}
            setSelectedUserId={setSelectUserId}
            setSelectedUser={() => { }}
            setSelectedUserIndex={() => { }}
            handlePageChange={handlePageChange}
          />
          <UsersCard
            role={USER_ROLES.CUSTOMER_CARE_MANAGER}
            users={customerCaresManager}
            currentPage={customerCareManagerPage}
            totalPages={customerCaresTotalManagerPages}
            setopenModalEditUser={setopenModalEditUser}
            disableAddButton={disableAddButton}
            setOpenModalDelete={setOpenDeleteModal}
            setSelectedUserId={setSelectUserId}
            setSelectedUser={() => { }}
            setSelectedUserIndex={() => { }}
            handlePageChange={handlePageChange}
          />
        </section>

        {modals &&
          modals.length &&
          modals.map((modal, key) =>
            modal.type === "sheet" ? (
              <Sheet
                key={key}
                className={`${modal.className} !p-0 rounded-t-xl smx:!rounded-xl !overflow-hidden top-auto !w-full !max-w-full smx:!w-[420px] min-[1540px]:!w-[610px] min-[1540px]:!max-w-[610px] smx:!max-w-[420px] !h-[calc(100vh-179px)] smx:!h-[calc(100%-16px)] smx:!my-auto smx:!mr-2 max-smx:data-[state=closed]:!slide-out-to-bottom max-smx:data-[state=open]:!slide-in-from-bottom`}
                open={modal.open}
                setOpen={modal.setOpen}
              >
                {modal.modalChild}
              </Sheet>
            ) : (
              <Modal
                key={key}
                variant="primary"
                className={`${modal.className} w-full smx:max-w-[640px] !p-0 smx:!w-[640px] !max-h-screen !h-screen smx:!h-fit smx:!max-h-[85vh] !translate-y-0 !top-0 smx:!-translate-y-[50%] smx:!top-[50%] !rounded-none smx:!rounded-lg-10`}
                title=""
                open={modal.open}
                setOpen={modal.setOpen}
              >
                {modal.modalChild}
              </Modal>
            )
          )}

        {alerts && alerts.length ? alerts : <></>}
      </section>
      <Modal
        title="Delete User"
        className="max-w-lg"
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        variant="primary"
      >
        <main className="mb-10 mt-4">
          <p className="text-sm text-neutral-80">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
        </main>
        <footer className="flex w-full justify-end gap-3">
          <Button
            size="md"
            variant="default-nude"
            onClick={() => setOpenDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button size="md" variant="error-bg" onClick={handleDeleteUser}>
            Delete
          </Button>
        </footer>
      </Modal>
    </div>
  );
};

SpAdminFranchisePage.displayName = "Team1";

export default SpAdminFranchisePage;
