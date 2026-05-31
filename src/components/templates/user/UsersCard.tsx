import { useState } from "react";
import {
  Button as DropDownBtn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@relume_io/relume-ui";
import { FaUser } from "react-icons/fa";
import { User } from "@/interface/user";
import { routes } from "@/constants/routes";
import Route from "@/components/atomics/Route";
import { Pagination } from "@/components/atomics";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type Props = {
  role: string;
  users: User[];
  currentPage: number;
  totalPages: number;
  disableAddButton?: any;
  setopenModalEditUser: (value: boolean) => void;
  setOpenModalDelete: (value: boolean) => void;
  setSelectedUserId: (value: number) => void;
  setSelectedUser: (value: User) => void;
  setSelectedUserIndex: (value: number) => void;
  handlePageChange: any;
};

const UsersCard = ({
  role,
  users,
  currentPage,
  totalPages,
  setopenModalEditUser,
  disableAddButton,
  setOpenModalDelete,
  setSelectedUserId,
  setSelectedUserIndex,
  setSelectedUser,
  handlePageChange,
}: Props) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  return (
    <div key={role} className="mb-8">
      <h2 className="pb-3 text-md font-semibold text-text-black">
        {role}
      </h2>
      <div className="grid grid-cols-1 xsm:grid-cols-2 sm:grid-cols-3 smx:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6 gap-y-8 items-start justify-center smx:gap-x-4 md:gap-x-8 gap-x-2">
        {users.length === 0 ? (
          <p className="text-sm sm:text-md">No users found.</p>
        ) : (
          users.map((user, index) => (
            <div
              className="bg-[#3333330d] p-2 rounded-xl relative group/btn smx:hover:bg-[#EFEFEF] max-w-[230px] xsm:mx-0 mx-auto w-full xsm:w-auto"
              key={index}
            >
              <Route
                route={`${routes.users}/${user.id}`}
                linkClassName="flex flex-col items-stretch text-center"
              >
                <div className="mb-2.5 flex w-full items-center justify-center smx:mb-1.5">
                  {user?.photo ? (
                    <Image
                      src={user.photo}
                      alt={user.name}
                      width={10}
                      height={10}
                      className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200">
                      <FaUser size="50%" color="gray" />
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-xs text-primary-main !leading-4">
                    {user.name}
                  </h5>
                  <h6 className="text-sm font-semibold !leading-4">
                    {user.tech_vehicle}
                  </h6>
                  <p className="text-neutral-200 text-sm">
                    {user.tech_license_plate}
                  </p>
                </div>
              </Route>
              <div  className={twMerge(
                  "absolute group top-1 right-1",
                  disableAddButton && "hidden"
                )}>
                <div className="transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropDownBtn
                        disabled={disableAddButton}
                        onClick={() =>
                          setOpenDropdownIndex(
                            index === openDropdownIndex ? null : index
                          )
                        }
                        className="!px-2 !py-1 !rounded-lg !bg-[#ffffff1a] smx:hover:!bg-[#3333330d] !border-none group-hover/btn:opacity-100 opacity-0 focus-visible:!ring-transparent focus-visible:!ring-offset-transparent"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="size-6 w-5 h-5 text-neutral-200"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </DropDownBtn>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white shadow-alerts rounded-lg absolute p-1 w-[192px] mt-1 z-20 -left-[160px] border-none data-[side=bottom]:!slide-in-from-bottom-0">
                      <DropdownMenuItem
                        className="px-4 py-2 bg-transparent hover:bg-[#3333330d] rounded-md !text-sm text-text-black"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setopenModalEditUser(true);
                          setSelectedUserIndex(index);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="px-4 py-2 bg-transparent hover:bg-[#3333330d] rounded-md !text-sm text-text-black"
                        onClick={() => {
                          setOpenModalDelete(true);
                          setSelectedUserId(user.id);
                          setSelectedUser(user);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="smx:opacity-0 smx:group-hover:opacity-100">
                    <div className="bg-[#242424f2] text-white text-xs font-normal px-2.5 py-1.5 rounded-md absolute -top-8 -left-2 opacity-0 group-hover:opacity-100">
                      <span>Menu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => handlePageChange(role, page)}
        />
      </div>
    </div>
  );
};

export default UsersCard;