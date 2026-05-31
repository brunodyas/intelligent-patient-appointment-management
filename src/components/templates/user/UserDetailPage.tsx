"use client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button as DropDownBtn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@relume_io/relume-ui";
import { PencilAltIcon, PhoneIcon } from "@heroicons/react/outline";
import { Button } from "@/components/atomics";
import { Modal } from "@/components/molecules";
import { routes } from "@/constants/routes";
import { FaUser } from "react-icons/fa";
import Route from "@/components/atomics/Route";
import { UserListDetails } from "@/interface/user";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { formaPreviousTime } from "@/utils/formatDate";
import { formatPhoneNumber } from "@/utils/formatPhoneForCall";

interface UserDetailConfig {
  modals?: {
    className: string;
    open: boolean;
    setOpen: (isOpen: boolean) => void;
    modalChild: ReactNode;
  }[];
  alerts?: ReactNode[];
  addAction: () => void;
  disableAddButton?: boolean;
}

interface UserDetailProps {
  data: UserListDetails;
  config: UserDetailConfig;
}

const UserDetailPage: React.FC<UserDetailProps> = ({ data, config }) => {
  const { addAction, modals, alerts, disableAddButton } = config;
  const router = useRouter();

  // const displayName = data?.franchise?.is_manufacturer
  //   ? "Manufacturer"
  //   : "Franchise";

    const displayName = "Franchise";

  return (
    <>
      <div className="bg-primary-main pt-6 pb-12 px-8">
        <div className="flex items-center gap-2 mb-3 mt-4 smx:flex ">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Route
                  route={routes.users}
                  linkClassName="text-brand-lightest text-sm font-normal"
                >
                  {data?.role}
                </Route>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-neutral-white" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  className="text-neutral-white font-semibold text-sm cursor-auto"
                >
                  {data?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-start smx:items-center gap-4 mt-4">
          <div>
            {data?.photo ? (
              <div
                className={
                  "h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200"
                }
              >
                <Image
                  src={data.photo}
                  alt="user"
                  className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200 object-cover"
                  width="250"
                  height="50"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200">
                <FaUser size="50%" color="gray" />
              </div>
            )}
          </div>
          <div className="flex-col flex smx:flex-row smx:items-center justify-between w-full gap-3">
            <div>
              <p className="uppercase text-xs text-neutral-white mb-1">
                {data?.role}
              </p>
              <h3 className="text-2xl text-neutral-white font-semibold mb-1 smx:mb-1.5">
                {data?.name}
              </h3>
              <p className="text-base smx:text-sm text-brand-lightest break-all">
                {data?.email}
              </p>
            </div>
            <div className="items-center gap-1.5 flex">
              <a href="tel:+1234567890" className="no-underline">
                <Button
                  variant={"default-bg"}
                  className="!gap-1.5 smx:!py-[8.5px] !rounded-lg !px-3 !py-[5px] smx:!pe-4 smx:!ps-3 !bg-white hover:!bg-[#F2F2F2]"
                >
                  <PhoneIcon className="text-primary-main w-4 h-4 smx:w-5 smx:h-5" />
                  <span className="text-primary-main smx:text-sm text-base font-medium">
                    Call
                  </span>
                </Button>
              </a>
              <div className="relative group">
                <Button
                  disabled={disableAddButton}
                  onClick={addAction}
                  variant="default-outline"
                  className={twMerge(
                    "smx:flex !gap-1.5 !py-[9px] !rounded-lg !pe-4 !ps-3 !bg-[#ffffff1a] hover:!bg-[#ffffff3b] focus:!ring-transparent",
                    disableAddButton && "!hidden"
                  )}
                >
                  <PencilAltIcon className="text-neutral-white w-5 h-5" />
                  <span className="text-neutral-white">Edit</span>
                </Button>
                <div className="bg-[#242424f2] text-white text-xs smx:hidden font-normal px-2.5 py-1.5 rounded-md absolute -top-8 -left-2 group-hover:opacity-100 opacity-0">
                  <span>Menu</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DropDownBtn
                      disabled={disableAddButton}
                      className="!rounded-lg !bg-[#ffffff1a] hover:!bg-[#ffffff3b] !p-[7px] smx:hidden flex border border-[#ffffff33]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="size-6 w-5 h-5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                        />
                      </svg>
                    </DropDownBtn>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white shadow-alerts rounded-lg absolute p-1 w-[192px] mt-1 z-30 -left-[160px] border-none">
                    <DropdownMenuItem
                      className="px-4 py-[7px] bg-transparent hover:bg-[#3333330d] rounded-lg !text-sm text-text-black"
                      onClick={addAction}
                    >
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-border-light mt-6 rounded-xl pt-6 pb-12 px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8 mx-4 sm:mx-5 smx:mx-6 md:mx-7 lg:mx-8">
        <div>
          <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
            User Info
          </h2>
          <div className="border-b border-border-light py-2.5 flex justify-between items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm">Email</h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.email}
            </p>
          </div>
          <div className="border-b border-border-light py-2.5 flex justify-between items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm">Phone</h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.user_phone && formatPhoneNumber(data.user_phone, true)}
            </p>
          </div>
          <div className="border-b border-border-light py-2.5 flex justify-between items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm">
              Shift Start Time
            </h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.shift_start_time && formaPreviousTime(data.shift_start_time)}
            </p>
          </div>
          <div className="py-2.5 flex justify-between  items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm">
              Shift End Time
            </h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.shift_end_time && formaPreviousTime(data.shift_end_time)}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
            {displayName} Information
          </h2>
          <div className="border-b border-border-light py-2.5 flex justify-between items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm">
              {displayName} name
            </h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.franchise?.franchise_name}
            </p>
          </div>
          {/* {data?.franchise?.is_manufacturer && (
            <div className="border-b border-border-light py-2.5 flex justify-between items-center">
              <h3 className="text-neutral-200 text-base smx:text-sm">
                Is a Manufacturer
              </h3>
              <p className="text-text-black text-base smx:text-sm">
                {data?.franchise?.is_manufacturer ? "true" : "false"}
              </p>
            </div>
          )} */}
          <div className="border-b border-border-light py-2.5 flex justify-between items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm">
              {displayName} Active
            </h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.franchise?.franchise_active ? "true" : "false"}
            </p>
          </div>
          <div className="border-b border-border-light py-2.5 flex justify-between">
            <h3 className="text-neutral-200 text-base smx:text-sm min-w-[130px] min-[460px]:min-w-[200px]">
              {displayName} Address
            </h3>
            <p className="text-text-black text-base smx:text-sm break-all">
              {data?.franchise?.franchise_address}
            </p>
          </div>
          <div className="border-b border-border-light py-2.5 flex justify-between">
            <h3 className="text-neutral-200 text-base smx:text-sm min-w-[130px] min-[460px]:min-w-[200px] mt-2">
              {displayName} Zip Codes
            </h3>
            <div className="flex gap-2 flex-wrap">
              {data?.franchise?.zip_codes_covered && 
                (typeof data?.franchise?.zip_codes_covered === "string" 
                  ? JSON.parse(data.franchise.zip_codes_covered)
                  : data?.franchise?.zip_codes_covered
                ).map((stage: any) => (
                <div
                  className={`text-nowrap rounded-full text-sm border py-2 px-4 transition duration-150`}
                  key={stage}
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
          <div className="border-b border-border-light py-2.5 flex justify-between">
            <h3 className="text-neutral-200 text-base smx:text-sm min-w-[130px] min-[460px]:min-w-[200px] mt-2">
              {displayName} Outside Zip Codes
            </h3>
            <div className="flex gap-2 flex-wrap">
              {data?.franchise?.zip_codes_would_accept_outside_owned && 
                (typeof data?.franchise?.zip_codes_would_accept_outside_owned === "string" 
                  ? JSON.parse(data.franchise.zip_codes_would_accept_outside_owned)
                  : data?.franchise?.zip_codes_would_accept_outside_owned
                ).map((stage: any) => (
                  <div
                    className={`text-nowrap rounded-full text-sm border py-2 px-4 transition duration-150`}
                    key={stage}
                  >
                    {stage}
                  </div>
              ))}
            </div>
          </div>
          {/* <div className="border-b border-border-light py-2.5 flex justify-between">
            <h3 className="text-neutral-200 text-base smx:text-sm">
              Price Markup
            </h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.franchise?.price_markup}
            </p>
          </div> */}
          <div className="py-2.5 flex justify-between items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm min-w-[130px] min-[460px]:min-w-[200px]">
              Website Url
            </h3>
            <p className="text-text-black text-base smx:text-sm break-all">
              <a href={data?.franchise?.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-main underline"  >
                {data?.franchise?.website_url ? data?.franchise?.website_url : "-"}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-border-light mt-6 rounded-xl pt-6 pb-12 px-4 sm:px-5 smx:px-6 md:px-7 lg:px-8 mx-4 sm:mx-5 smx:mx-6 md:mx-7 lg:mx-8">
        <div className="mt-4">
          <h2 className="text-text-black font-medium text-2xl mb-4">
            Deliveries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-2">
            <div className="py-3 px-4 border border-border-light rounded-xl w-full">
              <p className="text-sm text-neutral-200 font-medium">Active</p>
              <span className="mt-1 font-medium text-text-black text-2xl">
                {data?.tech_num_active_deliveries}
              </span>
            </div>
            <div className="py-3 px-4 border border-border-light rounded-xl w-full">
              <p className="text-sm text-neutral-200 font-medium">Assigned</p>
              <span className="mt-1 font-medium text-text-black text-2xl">
                {data?.tech_num_completed_deliveries}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-text-black font-medium text-xl md:text-2xl mb-3 mt-0 md:mt-4">
            Vehicle Information
          </h2>
          <div className="border-b border-border-light py-2.5 flex justify-between items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm">Vehicle</h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.tech_vehicle}
            </p>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <h3 className="text-neutral-200 text-base smx:text-sm">
              License plate
            </h3>
            <p className="text-text-black text-base smx:text-sm">
              {data?.tech_license_plate}
            </p>
          </div>
        </div>
      </div>
      {modals &&
        modals.length &&
        modals.map(
          (modal, key) =>
            modal.modalChild && (
              <Modal
                key={key}
                variant="primary"
                className={`${modal.className} w-full smx:max-w-[640px] !p-0 smx:!w-[640px] !max-h-screen !h-screen smx:!h-fit smx:!max-h-[85vh] !translate-y-0 !top-0 smx:!-translate-y-[50%] smx:!top-[50%] !rounded-none smx:!rounded-lg-10 border-2 border-primary-border`}
                title=""
                open={modal.open}
                setOpen={modal.setOpen}
              >
                {modal.modalChild}
              </Modal>
            )
        )}
      {alerts && alerts.length ? alerts : <></>}
    </>
  );
};

export default UserDetailPage;