"use client";

import { BlindInterface, SelectedBlindPayload } from '@/interface/config'
import { Button } from "@/components/atomics";
import FormSelect from '@/components/atomics/FormSelect';
import { BiCheck, BiMinus, BiPlus } from "react-icons/bi";
import { useState } from 'react';
import AddonColorPickerModal from './AddonColorPickerModal';


type Props = {
  blindItem: BlindInterface;
  selectedBlind?: SelectedBlindPayload;
  setSelectedBlind: (selectedBlind: SelectedBlindPayload) => void
};

const Blind = ({ blindItem, selectedBlind, setSelectedBlind }: Props) => {
  const { blind, total_price, matching_addons, matching_features } = blindItem;
  const [blindPrice, setBlindPrice] = useState<number>(parseFloat(total_price));
  const [selectedAddons, setSelectedAddons] = useState(matching_addons)
  const [selectedColor, setSelectedColor] = useState<string>(blind.color[0])
  const [addonColors, setAddonColors] = useState<{ [addonId: string]: string }>({});

  const [openAddonColorPicker, setOpenAddonColorPicker] = useState(false)
  const [colorOptions, setColorOptions] = useState<string[]>([])
  const [addonId, setAddonId] = useState(0)

  const COLORS = blind.color.map(color => ({ label: color, value: color }))

  const featureMatches = (feature: string): boolean => {
    return matching_features.map(f => f.toLowerCase()).includes(feature.toLowerCase())
  }

  const handleSelectAddonColor = (id: number, name: string, price: number, colors: string[]) => {
    // if(colors.length > 1) {
    setColorOptions(colors)
    setAddonId(id)
    setOpenAddonColorPicker(true)
    // }
    // setSelectedAddons(prevSelectedAddons => [...prevSelectedAddons, {id, name, price: price}])
    // setBlindPrice(blindPrice + price)
  }

  const colorRequiredAndSelected = (id: number, colors: string[]): boolean => {
    return colors.length > 1 ? (addonColors[id] ? true : false) : true
  }
  return (
    <div className="flex flex-col justify-between border rounded-lg p-4 sm:p-6 md:p-8 lg:p-10 shadow-md bg-white hover:shadow-lg transition-shadow duration-300 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
      <AddonColorPickerModal
        openAddonColorPicker={openAddonColorPicker}
        setOpenAddonColorPicker={setOpenAddonColorPicker}
        addonId={addonId}
        setAddonsColor={setAddonColors}
        colors={colorOptions}
      />
      <h2 className="text-xl font-semibold text-center text-primary-main my-2">{blind.name}</h2>
      <div className="text-sm text-center text-gray-600">
        <h3 className="flex gap-3 justify-center">
          <div className="font-medium">Model #</div>
          <div>{blind.model_number}</div>
        </h3>
        <h3 className="flex gap-3 justify-center">
          <div className="font-medium">Type</div>
          <div>{blind.blind_type}</div>
        </h3>
        <h3 className="text-lg font-bold text-center text-primary-dark my-2">
          ${blindPrice}
        </h3>
      </div>

      <hr className="my-4 border-t border-primary-main" />
      <div className="mb-2">
        <p className="font-semibold text-gray-700">Features</p>
        <ul className="mt-1 mb-3 grid grid-cols-1 gap-y-2">
          {blind.features.map((feature, index) => (
            <li key={index} className={`${featureMatches(feature) ? "pl-2" : "pl-5"} flex items-center text-gray-600 text-small`}>
              {featureMatches(feature) && <BiCheck className="size-6 shrink-0 text-text-success" />}
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className='mb-2'>
        <p className="font-semibold text-gray-700">Color {blind.color.length > 1 && "Options"}</p>
        <ul className="mt-1 mb-3 grid grid-cols-1 gap-y-2 pl-2">
          {blind.color.length > 1
            ?
            <FormSelect
              onChange={(name, value) => setSelectedColor(value)}
              name="color"
              datas={COLORS}
              selectedNow={false}
            />
            :
            <li className="flex items-center text-gray-600 text-small">
              <BiCheck className="size-6 shrink-0 text-text-success" />
              {blind.color[0]}
            </li>
          }
        </ul>
      </div>

      <p className="font-semibold text-gray-700">Available Add-ons</p>
      {blind.addons.map(({ name, id, price, addon_color }, index) => (
        <div key={index} className="pl-2 mt-1 flex items-center mb-2 shrink-0">
          {!selectedAddons.some(addon => addon.id === id)
            ?
            <BiPlus
              className={`${colorRequiredAndSelected(id, addon_color) ? "text-primary-main" : "text-primary-surface"} shrink-0 text-2xl  mr-2 hover:bg-primary-hover/20 rounded-full p-0`}
              onClick={() => {
                if (selectedBlind?.blind !== blind.id && colorRequiredAndSelected(id, addon_color)) {
                  setSelectedAddons(prevSelectedAddons => [...prevSelectedAddons, { id, name, price: parseFloat(price) }])
                  setBlindPrice(blindPrice + parseFloat(price))
                }
              }}
            />
            :
            <BiMinus
              className="shrink-0 text-2xl text-primary-main mr-2 hover:bg-primary-hover/20 rounded-full p-0"
              onClick={() => {
                if (selectedBlind?.blind !== blind.id) {
                  setBlindPrice(blindPrice - parseFloat(price))
                  setSelectedAddons(prevSelectedAddons => prevSelectedAddons.filter(addon => addon.id !== id));
                  setAddonColors(prevColors => {
                    const { [id]: _, ...remainingColors } = prevColors;
                    return remainingColors;
                  });
                }
              }}
            />
          }
          <label htmlFor={`addon-${index}`} className="p-text-gray-600 flex-1">
            <span>{name}</span>
            <span className="bg-primary-surface mx-2 px-2 rounded-lg text-primary-main font-semibold">${price}</span>
          </label>

          {addon_color.length > 1 &&
            <Button
              variant="primary-outline"
              size="sm"
              onClick={() => {
                if (selectedBlind?.blind !== blind.id) {
                  handleSelectAddonColor(id, name, parseFloat(price), addon_color)
                }
              }}
            >
              Select Color
            </Button>}
        </div>
      ))}
      <Button
        variant="primary-bg"
        className="mt-10 !h-10 text-white bg-primary-main hover:bg-primary-dark"
        disabled={selectedBlind?.blind === blind.id}
        onClick={() => {
          setSelectedBlind({
            ...selectedBlind,
            blind: blind.id,
            selected_addons: selectedAddons.map(addon => addon.id),
            selected_color: selectedColor,
            addon_colors: addonColors
          })
        }}
      >
        {selectedBlind?.blind === blind.id ? "Selected" : "Select"}
      </Button>
    </div>
  );
}

export default Blind;