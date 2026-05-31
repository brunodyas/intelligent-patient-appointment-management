"use client";

import { FunnelIcon, MagnifyingGlassIcon } from "@/assets/icons";
import { Button, Checkbox, Title } from "@/components/atomics";
import { Dropdown } from "@/components/molecules";
import { useState } from "react";

type Props = {
  title: string;
  handleAppointmentType?: (type: string) => void;
  types?: string[];
};

const FilterTech = ({ title, handleAppointmentType, types }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<string>(title || "");

  const handleType = (type: string) => {
    setType(type);
  };
  const handleFilteration = () => {
    setOpen(false);
    if (type && handleAppointmentType) {
      handleAppointmentType(type);
      setType(type);
    } else {
      setType(title);
    }
  };

  const buttonStyles = `flex items-center gap-2.5 px-4 py-[9px] bg-neutral-20 text-neutral-100 border border-transparent rounded-lg cursor-pointer hover:bg-neutral-30 focus:outline-none focus:ring-2 focus:ring-primary-border`;

  return (
    <section>
      <Title variant="primary" size="lg">
        {title.replace(/-/g, " ")}
      </Title>
      {/* <div className="flex gap-2 items-center justify-between my-5 max-smx:flex-col"> */}
        {/* <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
          <input
            className="w-full  border border-transparent bg-neutral-20 px-3.5 py-[9px] pl-11  outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus-within:ring-primary-surface focus:border-primary-main rounded-xl"
            placeholder="Search"
          />
        </div> */}
        <div className="flex flex-row gap-3 w-full my-5">
          <Dropdown
            buttonChildren={
              <div className={buttonStyles}>
                Filter
                <FunnelIcon className="h-4 w-4 stroke-neutral-100 stroke-[4px]" />
              </div>
            }
            setOpen={setOpen}
            open={open}
            className="p-0 mt-4"
          >
            <div className="flex flex-col gap-4 p-4">
              <Title variant="primary" size="lg">
                Type
              </Title>
              {types?.map((techType) => {
                const formattedType = techType.replace(/-/g, " ");
                return (
                  <div
                    key={techType}
                    className="flex justify-between cursor-pointer"
                    onClick={() => handleType(techType)}
                  >
                    <p className="text-sm capitalize">{formattedType}</p>
                    <Checkbox active={type === techType} setActive={() => { }} />
                  </div>
                );
              })}
            </div>
            <footer className="flex justify-end gap-3 border-t border-neutral-lightest p-4">
              <Button
                className="!h-10"
                onClick={() => setType("")}
                size="md"
                variant="primary-nude"
              >
                Clear All
              </Button>

              <Button
                className="!h-10"
                onClick={handleFilteration}
                size="md"
                variant="primary-bg"
              >
                Done
              </Button>
            </footer>
          </Dropdown>
        </div>
      {/* </div> */}
    </section>
  );
};

export default FilterTech;
