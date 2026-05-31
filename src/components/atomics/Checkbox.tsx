import React from 'react'
import { Switch } from '@headlessui/react'
import { CheckIcon } from '@/assets/icons'

interface Checkbox {
  active: any
  setActive: any
}

const Checkbox: React.FC<Checkbox> = ({ active, setActive }) => {
  return (
    <div className='Checkbox h-6 w-6 flex items-center justify-center'>
      <Switch
        checked={active}
        onChange={setActive}
        className={`Checkbox cursor-pointer ${
          active
            ? 'border-primary-main bg-primary-main text-white ring-primary-surface'
            : 'border-neutral-60 bg-transparent ring-neutral-15'
        } relative inline-flex h-4 w-4 items-center justify-center rounded-md border ring-2`}
      >
        {active && <CheckIcon className='h-4 w-4' />} {/* Adjust the icon size here */}
      </Switch>
      <span className='sr-only'>Select All</span>
    </div>
  )
}

export default Checkbox
