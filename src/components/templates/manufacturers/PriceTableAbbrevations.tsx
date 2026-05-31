import React, { Fragment } from "react";
import { FiArrowDownCircle, FiArrowRightCircle } from "react-icons/fi";
import { Button } from "@/components/atomics";

export const abbrevations = [
  { icon: <FiArrowDownCircle className="text-[#c63d7f]" />, label: "height" },
  { icon: <FiArrowRightCircle className="text-[#c63d7f]" />, label: "width" },
  { text: "$ ", label: "price unit" },
  { text: "in: ", label: "inches" },
];

const PriceTableAbbrevations = () => (
  <Fragment>
    {abbrevations?.map((item, index) => (
      <div key={index} className="flex items-center gap-4">
        {item.icon ? (
          item.icon
        ) : (
          <p className="text-[#c63d7f]">{item.text}</p>
        )}
        <Button
          size="md"
          variant="tab-selected"
          className="!rounded-lg !border-none !px-4"
        >
          {item.label}
        </Button>
      </div>
    ))}
  </Fragment>
);


export default PriceTableAbbrevations;
