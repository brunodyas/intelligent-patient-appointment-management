import { Button } from '@/components/atomics';
import { Modal } from '@/components/molecules';
import React from 'react'

type Props = {
  openAddonColorPicker: boolean;
  setOpenAddonColorPicker: (value: boolean) => void
  // selectedAddonColor: string
  // setSelectedAddonColor: (color: string) => void
  addonId: number
  colors: string[]
  setAddonsColor: (value: React.SetStateAction<{ [addonId: string]: string }>) => void
}
const AddonColorPickerModal = ({ openAddonColorPicker, setOpenAddonColorPicker, colors, addonId, setAddonsColor }: Props) => {
  
  const handleSelectColor = (color: string) => {
    setAddonsColor(prev => ({...prev, [addonId]: color}))
    setOpenAddonColorPicker(false)
  }

  return (
    <Modal
      title="Choose Addon Color"
      className="w-[75%]"
      variant="primary"
      open={openAddonColorPicker}
      setOpen={setOpenAddonColorPicker}
    >
      <div className="flex justify-center">
        {
          colors.map(color => (
            <Button
              variant="primary-nude"
              size='md'
              className=""
              onClick={() => handleSelectColor(color)}
              key={color}
            >
              {color}
            </Button>
          ))
        }
      </div>
    </Modal>
  )
}

export default AddonColorPickerModal