import React, { useMemo } from 'react';
import { BiCheck } from "react-icons/bi";
import { ChoseConfigInterface } from '@/interface/config';

type Props = {
  chosenConfig: ChoseConfigInterface,
  filters: {
    answer: string;
    question: string;
  }[] | null
};

const ChosenConfig = ({ chosenConfig, filters }: Props) => {
  const { blind, selected_addons, selected_color, blind_height_in, blind_width_in, total_price  } = chosenConfig;  
  
  const general = useMemo(() => ({
    "Blind Name": blind.name,
    "Type": blind.blind_type,
    "Model Number": blind.model_number,
    "Total Price": "$" + total_price,
    "Size": `${blind_width_in} x ${blind_height_in}`,
    "Color": selected_color,
  }), [chosenConfig]);

  return (
    <div className="flex flex-col lg:flex-row justify-between w-full py-5 px-8">
      <div className="mb-5 lg:w-1/3 lg:pr-4">
        <p className="font-semibold text-gray-700">General</p>
        <div>
          <table className="w-full">
            <tbody className="text-left">
              {Object.entries(general).map(([key, value]) => (
                <tr key={key}>
                  <td className="py-1 pr-10 text-gray-500">{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {filters &&
        <div className="mb-5 lg:w-1/3 lg:px-2">
        <p className="font-semibold text-gray-700">Filters</p>
        <div>
          <table className="w-full">
            <tbody className="text-left">
              {filters.map(({ question, answer }, index) => (
                <tr key={index}>
                  <td className="py-1 pr-10">
                    <span className="italic mr-2">{question}</span>
                    <span>{answer}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      }

      <div className="mb-4 lg:w-1/3 lg:pl-4">
        <p className="font-semibold text-gray-700">Selected Add-ons and Features</p>
        <div>
          {selected_addons.map(({ name, price }, index) => (
            <div key={index} className="mt-1 flex justify-between items-center mb-2">
              <BiCheck className="text-green-500 size-6 shrink-0" />
              <span className="text-gray-600 flex-1">{name}</span>
              <span className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs">${price}</span>
            </div>
          ))}
          {/* <ul className="mt-1 mb-3">
            {blind.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <BiCheck className="text-green-500 size-6 shrink-0" />
                {feature}
              </li>
            ))}
          </ul> */}
        </div>
        <div className="mb-4">
          <p className="font-semibold text-gray-700">Features</p>
          <ul className="mt-1 mb-3 grid grid-cols-1 gap-y-2">
            {blind.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-600 text-small">
                <BiCheck className="size-6 shrink-0 text-text-success" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChosenConfig;