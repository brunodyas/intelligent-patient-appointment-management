"use client"

import React from "react"
import * as Dialog from "@radix-ui/react-dialog"

import { XIcon } from "@/assets/icons"
import { Title } from "../atomics"
import { useAuth } from "@/context/auth"

interface Modal {
  children: React.ReactNode
  className: string
  open: boolean
  setOpen: (value: boolean) => void
  title: string
  variant: "default" | "success" | "info" | "warning" | "error" | "primary"
  height?: string
  contentSpacing?: string
}

const Modal: React.FC<Modal> = ({
  children,
  className,
  open,
  setOpen,
  title,
  variant,
  height,
  contentSpacing = "",
}) => {

  const { isApiCalled } = useAuth();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.DialogTrigger></Dialog.DialogTrigger>

      <Dialog.Portal>
        <Dialog.Overlay className={`fixed inset-0 z-[998] overflow-hidden bg-black/25 data-[state=open]:animate-overlayShow`} />

        <Dialog.Content
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          className={`fixed left-1/2 top-1/4 z-[999] ${height ? height : "max-h-[85vh]"} w-3/4 max-sm:w-11/12 ${className} -translate-x-1/2 -translate-y-1/4 rounded-lg-10 bg-white shadow-lg focus:outline-none data-[state=open]:animate-contentShow`}
        >
          <div className={`overflow-y-auto p-6 max-sm:px-2 max-sm:py-4 ${height ? height : "max-h-[84vh]"} ${contentSpacing} ${isApiCalled ? "pointer-events-none opacity-50" : ""
            }`}>
            {title && (<Dialog.Title className={`flex items-center justify-between`}>
              <Title size='sm' variant={variant}>
                {title}
              </Title>

              <Dialog.Close asChild>
                <button aria-label='Close'>
                  <XIcon className='h-6 w-6 text-neutral-50' />
                </button>
              </Dialog.Close>
            </Dialog.Title>)}

            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
