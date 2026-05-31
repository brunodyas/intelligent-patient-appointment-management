import { Button } from "@headlessui/react";
import React from "react";
import { IoCallOutline } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import Image from "next/image";

type Props = {
  assigned_Driver: {
    email: string;
    id: number;
    name: string;
    photo: string | null;
    tech_license_plate: string;
    tech_vehicle: string;
  };
  setOpenEditJob: (isOpen: boolean) => void;
};

const ViewTechInfo = ({ assigned_Driver, setOpenEditJob }: Props) => {
  return (
    <div>
      <header>
        <div className="text-center text-md font-semibold p-3">
          {assigned_Driver?.name}
        </div>
        <div className="bg-primary-main text-neutral-white flex items-center space-x-4 mb-6 p-5">
          {assigned_Driver.photo ? (
            <div className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200">
              <Image
                src={assigned_Driver.photo}
                width={10}
                height={10}
                alt="Driver"
                className="h-full w-full rounded-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200">
              <FaUser size="50%" color="gray" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">Tech</p>
            <h1 className="text-lg font-bold">{assigned_Driver?.name}</h1>
            <p className="text-sm text-primary-surface">
              {assigned_Driver.email}
            </p>
            <div className="flex  gap-3 m-2">
              <Button className="flex text-sm text-primary-main items-center justify-center bg-[#fbf1f6] h-10 rounded-lg font-semibold hover:bg-neutral-white/80 transition duration-100 p-3">
                <IoCallOutline className="flex-shrink-0 mr-2" />
                Call
              </Button>

              <Button
                className="flex text-sm text-neutral-white items-center justify-center border h-10 rounded-lg font-semibold hover:bg-primary-hover transition duration-100 p-3"
                onClick={() => {
                  setOpenEditJob(true);
                }}
              >
                <FiEdit2 className="flex-shrink-0 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-6 mx-4 px-5 py-3 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Deliveries</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center border rounded-lg py-2">
            <span className="text-3xl font-bold">11</span>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center border rounded-lg py-2">
            <span className="text-3xl font-bold">0</span>
            <p className="text-sm text-gray-600">Assigned</p>
          </div>
        </div>

        <div className="m-4">
          <div className="text-lg font-semibold">Vehicle Information</div>
          <div className="flex justify-between py-2 border-b">
            <p className="text-[#333333b3]">Vehicle</p>
            <p>{assigned_Driver.tech_vehicle}</p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-[#333333b3]">License Plate</p>
            <p>{assigned_Driver.tech_license_plate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTechInfo;
