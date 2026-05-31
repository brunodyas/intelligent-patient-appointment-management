"use client";

import { Modal } from "@/components/molecules";

import { useState } from "react";
import BugTracker from "./BugTracker";
import RequestForm from "./RequestForm";

type Props = {
  setOpenSupportModal: (value: boolean) => void;
  setOpenSuccessSupport: (value: boolean) => void;
  setSupportModalTitle: (value: string) => void;
  openSupportModal: boolean;
};

type NavItem = {
  name: string;
  title: string;
  components?: any;
};

const SupportModal = ({
  openSupportModal,
  setOpenSupportModal,
  setOpenSuccessSupport,
  setSupportModalTitle,
}: Props) => {
  const [tab, setTab] = useState(0);

  const handleOnchangeTab = (title: string, index: number) => {
    setTab(index);
    setSupportModalTitle(title);
  };

  const navItems: NavItem[] = [
    {
      name: "Bug tracker",
      title: "Bug Report",
      components: (
        <BugTracker
          setOpenSuccess={setOpenSuccessSupport}
          setOpenSupportModal={setOpenSupportModal}
        />
      ),
    },
    {
      name: "Request",
      title: "Request",
      components: (
        <RequestForm
          setOpenSuccess={setOpenSuccessSupport}
          setOpenSupportModal={setOpenSupportModal}
        />
      ),
    },
  ];

  return (
    <Modal
      variant="primary"
      className=""
      title={"Support"}
      open={openSupportModal}
      setOpen={setOpenSupportModal}
    >
      <div className="rounded-lg bg-gray-200 w-full flex lg:hidden flex-row gap-[2px] mt-5">
        {navItems.map((navItem, index) => (
          <div
            key={navItem.name}
            onClick={() => handleOnchangeTab(navItem.title, index)}
            className={`flex px-3 py-2 text-sm leading-[18px] font-semibold border border-transparent rounded-md hover:bg-white hover:rounded-md hover:border-gray-300 cursor-pointer ${tab === index && "bg-white rounded-md border !border-gray-300"
              }`}
          >
            {navItem.name}
          </div>
        ))}
      </div>
      <div className="relative flex flex-col items-stretch lg:flex-row lg:items-start max-md:z-30 mt-5 min-h-[64vh]">
        <div className="lg:w-[17rem] pr-6 h-full hidden lg:block">
          {navItems.map((navItem, index) => (
            <div
              key={navItem.name}
              onClick={() => handleOnchangeTab(navItem.title, index)}
              className={`flex items-center gap-x-2 p-2 text-center hover:bg-neutral-101 hover:rounded-lg mb-1 cursor-pointer ${tab === index && "bg-neutral-101 rounded-md"
                }`}
            >
              {navItem.name}
            </div>
          ))}
        </div>
        <div className="lg:px-7 max-sm:px-1 lg:w-[calc(100vw_-_17rem)] max-lg:[100%] lg:border-l">
          {navItems[tab].components}
        </div>
      </div>
    </Modal>
  );
};

export default SupportModal;
