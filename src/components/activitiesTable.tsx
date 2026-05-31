"use client"
import React, { ReactNode } from "react"

import {
  Alerts,
  Badge,
  Button,
  Input,
  Pagination,
  Title,
  Selectbox
} from "./atomics"

import { Modal } from "./molecules"

import {
  CheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  SortAscendingIcon,
  TrashIcon,
  PlusIcon
} from "../assets/icons"

import formatDate from "@/utils/formatDate"
import { CRMContactsResponse } from "@/interface/contacts"
import { CRMActivitiesResponse } from "@/interface/activities"

interface Props {
  tableHeader: string[];
  tableName: string
  tableData?: CRMContactsResponse | CRMActivitiesResponse;
  modalSteps: {
    stepName: string;
    description: string;
    page: ReactNode;
    canSkip: boolean;
    nextAction?: () => void
  }[],
  modalOpen: boolean;
  modalSetOpen: (isOpen: boolean) => void
  alertButton?: {
    text: string;
    action: () => void
  }
  addAction: () => void
}

const ActivitiesTable = ({ tableData, tableName, tableHeader, modalSteps, alertButton, addAction, modalOpen, modalSetOpen }: Props) => {

  // -------------------------------------------------------------------------------------//
  const { count, previous, next, results } = tableData || {};
  const [activeState, setActiveState] = React.useState(1)
  // const [openModalFlashSale, setOpenModalFlashSale] = React.useState(false)
  const [openModalDelete, setOpenModalDelete] = React.useState(false)

  // -------------------------------------------------------------------------------------//
  const [openSuccess, setOpenSuccess] = React.useState(false)
  const [openAlertsDelete, setOpenAlertsDelete] = React.useState(false)

  const openSuccessAlerts = () => {
    setOpenSuccess(true)

    setTimeout(() => {
      setOpenSuccess(false)
    }, 3000)
  }
  // -------------------------------------------------------------------------------------//
  const values = results?.map(({ id, ...rest }) => Object.values(rest));
  return (
    <div className='relative space-y-6 p-6 max-sm:px-2'>
      <h1 className='!text-xl sm:t!ext-body-xl font-semibold'></h1>

      <section className='relative space-y-6 rounded-lg-10 bg-white p-6 max-sm:px-2'>
        {/* Navigation */}
        <nav className='space-y-6'>
          <Title size='lg' variant='default'>
            {tableName}
          </Title>

          {/* render react node buttons if buttons props exist but for now hard code */}
          <div>


          </div>
          <section className='flex items-center justify-between'>
            <div className='relative w-72 2xl:w-96 max-sm:w-full'>
              <MagnifyingGlassIcon className='absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50' />
              <input
                className='w-full rounded-lg border border-transparent bg-neutral-20 px-3.5 py-2.5 pl-11  outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus-within:ring-primary-surface focus:border-primary-main'
                placeholder='Search'
              />
            </div>

            <div className='flex flex-row gap-3 max-sm:w-full'>
              <Button
                size='md'
                variant='default-bg'
              >
                Sort
                <SortAscendingIcon className='h-4 w-4 stroke-neutral-100 stroke-[4px]' />
              </Button>

              <Button
                size='md'
                variant='default-bg'
              >
                Filter
                <FunnelIcon className='h-4 w-4 stroke-neutral-100 stroke-[4px]' />
              </Button>

              <Button
                size='md'
                variant='primary-bg'
                // onClick={() => setOpenModalFlashSale(true)}
                onClick={addAction}
              >
                <PlusIcon className='h-4 w-4 stroke-[10px]' />
                Add
              </Button>

            </div>
          </section>
        </nav>

        {/* Table */}

        {results && results.length ?
          <div className='mb-6 overflow-x-auto'>
            <table className='w-full table-auto'>
              <thead className='bg-neutral-15 text-xs font-semibold uppercase'>
                <tr>
                  {tableHeader.map(columnName =>
                    <th className='whitespace-nowrap px-3 py-4 text-left text-neutral-50 first:pl-5 last:pr-5' key={columnName}>
                      <span className='text-xs font-semibold'>{columnName}</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-neutral-20 pt-4 text-sm'>
                {values?.map((value, rowIndex) =>
                  <tr key={rowIndex}>
                    {value.map((item, colIndex) =>
                      item && typeof item === "object" ?
                        <td className='whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5' key={colIndex}>
                          <span className='text-sm font-medium text-neutral-80'>
                            {item.name}
                          </span>
                        </td>
                        :
                        <td className='whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5' key={colIndex}>
                          <span className='text-sm font-medium text-neutral-80'>
                            {item !== null ? item : ''}
                          </span>
                        </td>
                    )}
                    {/* <td className='whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5'>
                    <div className='flex'>
                      <Button
                        size='md'
                        variant='default-bg'
                        className='mr-4'
                        href={"/flash-sale/detail"}
                      >
                        <svg
                          width='16'
                          height='16'
                          viewBox='0 0 16 16'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M5.79289 13.4999H3C2.86739 13.4999 2.74021 13.4472 2.64645 13.3535C2.55268 13.2597 2.5 13.1325 2.5 12.9999V10.207C2.5 10.1414 2.51293 10.0764 2.53806 10.0157C2.56319 9.95503 2.60002 9.89991 2.64645 9.85348L10.1464 2.35348C10.2402 2.25971 10.3674 2.20703 10.5 2.20703C10.6326 2.20703 10.7598 2.25971 10.8536 2.35348L13.6464 5.14637C13.7402 5.24014 13.7929 5.36732 13.7929 5.49992C13.7929 5.63253 13.7402 5.75971 13.6464 5.85348L6.14645 13.3535C6.10002 13.3999 6.0449 13.4367 5.98424 13.4619C5.92357 13.487 5.85855 13.4999 5.79289 13.4999Z'
                            stroke='#3B4453'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M8.5 4L12 7.5'
                            stroke='#3B4453'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M5.96848 13.4675L2.53223 10.0312'
                            stroke='#3B4453'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </Button>
                    </div>
                  </td> */}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          :
          <h3 className="text-center font-semibold">{`No ${tableName}`}</h3>
        }

        {/* Pagination */}
        {results?.length ? <Pagination currentPage={1} totalPages={5} onPageChange={() => { }} /> : <></>}
      </section>

      <Modal
        variant='primary'
        className='max-w-4xl border-2 border-primary-border'
        title={`Add ${tableName}`}
        open={modalOpen}
        setOpen={modalSetOpen}
      >
        <main className='my-10 flex flex-col items-center justify-center gap-10'>
          <nav className='relative w-fit'>
            <div className='absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 -translate-x-1/2 bg-neutral-40'></div>
            <section className='flex items-center justify-center gap-20'>
              {modalSteps.map((step, key) =>
                <div className='flex flex-col items-center gap-2' key={key}>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${activeState > key
                        ? "border-primary-main bg-primary-main"
                        : "border-neutral-50 bg-neutral-50"
                      } !text-xl sm:!text-body-xl font-semibold text-white`}
                  >
                    {activeState > 0 && activeState <= key + 1 && key + 1}

                    {activeState > key + 1 && (
                      <CheckIcon className='h-6 w-6 text-white' />
                    )}
                  </span>

                  <h5 className='text-xs font-semibold text-neutral-50'>
                    {step.stepName}
                  </h5>
                </div>
              )}
            </section>
          </nav>

          <header className='space-y-2 text-center'>
            <h3 className='text-xl sm:text-body-xl font-semibold'>
              {modalSteps[activeState - 1].stepName}
            </h3>
            <p className='text-xs sm:text-sm text-neutral-50'>
              {modalSteps[activeState - 1].description}
            </p>
          </header>
          {modalSteps[activeState - 1].page}
        </main>

        <footer className='flex justify-end gap-3'>
          <Button
            size='md'
            variant='primary-nude'
            onClick={() => {
              if (activeState === 1) {
                modalSetOpen(false)
              } else {
                setActiveState(activeState - 1)
              }
            }}
          >
            {activeState === 1 ? "Cancel" : "Previous"}
          </Button>

          <Button
            size='md'
            variant='primary-bg'
            onClick={() => {
              if (activeState < modalSteps.length) {
                if (modalOpen === false) {
                  setActiveState(1)
                } else {
                  setActiveState(activeState + 1)
                }
              } else {
                setActiveState(1)
                modalSetOpen(false)
                openSuccessAlerts()
              }
            }}
          >
            {activeState === modalSteps.length ? "Submit" : modalSteps[activeState - 1]?.canSkip ? "Skip" : "Next"}
          </Button>
        </footer>
      </Modal>

      <Modal
        variant='primary'
        open={openModalDelete}
        title='Delete Flash Sale'
        className='max-w-lg border-2 border-primary-border'
        setOpen={setOpenModalDelete}
      >
        <main className='mb-10 mt-4'>
          <p className='text-sm text-neutral-80'>
            Are you sure you want to delete this flash sale? Flash sale which
            already deleted can not be recovered.
          </p>
        </main>

        <footer className='flex w-full justify-end gap-3'>
          <Button
            size='md'
            variant='default-nude'
            onClick={() => setOpenModalDelete(false)}
          >
            Cancel
          </Button>
          <Button
            size='md'
            variant='error-bg'
            onClick={() => {
              setOpenModalDelete(false)
              setOpenAlertsDelete(true)
            }}
          >
            Submit
          </Button>
        </footer>
      </Modal>

      {/* {
        button ?
          <Alerts
            variant='success'
            open={openSuccess}
            setOpen={setOpenSuccess}
            title='Flash sale has been added'
            desc='Contact has been added, you can check your contacts to confirm'
          />
          :
          <Alerts
            variant='success'
            open={openSuccess}
            setOpen={setOpenSuccess}
            title='Flash sale has been added'
            desc='Contact has been added, you can check your contacts to confirm'
            button={button}
          />
      } */}

      <Alerts
        variant='success'
        open={openSuccess}
        setOpen={setOpenSuccess}
        title='Flash sale has been added'
        desc='Customer has been added, you can check your customers to confirm'
        alertButton={alertButton}
      />

      <Alerts
        variant='success'
        open={openAlertsDelete}
        setOpen={setOpenAlertsDelete}
        title='Customer has been deleted'
        desc='Customer has been deleted, you can check your customers to confirm.'
      />
    </div>
  )
}

export default ActivitiesTable