import { CheckIcon } from '@/assets/icons'
import { Button } from '@/components/atomics'
import { CompanyFormInterface } from '@/interface/companies'
import { DefaultFormData } from '@/interface/contacts'
import { NewJob } from '@/interface/jobs'
import React from 'react'
import { COMPANY_DEFAULT_DATA, CONTACT_DEFAULT_DATA, DEFAULT_DATA } from '.'

interface Props {
  foundFranchise: boolean
  setStep: (step: number) => void
  setCompany: (company: CompanyFormInterface) => void
  setContact: (contact: DefaultFormData) => void
  setJob: (job: NewJob) => void 
}

const Confirmation = ({ foundFranchise, setStep, setCompany, setContact, setJob }: Props) => {
  return (
    <div className="w-full text-center space-y-4">
      <CheckIcon className="w-24 min-w-[4rem] max-w-[8rem] bg-primary-main rounded-full p-4 shrink-0 mx-auto text-neutral-white"/>
      {foundFranchise ? (
        <>
          <h2 className="text-2xl font-bold">Success!</h2>
          <p>Your appointment has been confirmed!</p>
          <p className="text text-neutral-50">
            You&apos;re all set! We&apos;ll reach out soon to finalize the details of your service.
          </p>
        </>
      ) : (
        <>
          {/* <h2 className="text-2xl font-bold">Thank You!</h2> */}
          <p className="w-1/2 mx-auto">
          Thank you for your interest! Unfortunately, we don&apos;t currently serve your area. We&apos;re always looking to expand, so please check back in the future to see if we&apos;ve reached your location. We appreciate your understanding!
          </p>
        </>
      )}
      <Button
        className="mt-4 w-1/2 mx-auto"
        size="sm"
        variant="primary-bg"
        onClick={() => {
          setJob(DEFAULT_DATA)
          setCompany(COMPANY_DEFAULT_DATA)
          setContact(CONTACT_DEFAULT_DATA)
          setStep(1)
        }}
      >
        Request a New Service
      </Button>
    </div>
  )
}

export default Confirmation