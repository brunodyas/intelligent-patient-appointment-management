"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon } from "@/assets/icons";
import { Alerts, Button, Checkbox, Input } from "@/components/atomics";
import Spinner from "@/components/atomics/Spinner";
import NewCompanyForm from "../../crm/companies/NewCompanyForm";
import { DefaultFormData } from "@/interface/contacts";
import { CompanyFormInterface } from "@/interface/companies";
import { externalAddJob } from "@/services/jobs";
import AddJobForm from "./AddJobForm";
import AppointmentsSchedule from "./AppointmentsSchedule";
import AppointmentDetail from "./AppointmentDetail";
import ReCAPTCHA from "react-google-recaptcha";
import { NewJob } from "@/interface/jobs";
import { useJune } from "@/hooks/useJune";
import Confirmation from "./Confirmation";
import { unformatPhoneNumber } from "@/utils/formatPhoneForCall";

export const DEFAULT_DATA = {
  job_name: "",
  pipeline: "",
  stage: "NEW",
  // consultation_date: "",
  consultation_duration: "120",
  // start_time: "",
  status: "PENDING",
  linked_contact: null,
  customer_description: "",
  bypass_validation: "False",
};

export const COMPANY_DEFAULT_DATA: CompanyFormInterface = {
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  industry: "",
  num_employees: "",
};

export const CONTACT_DEFAULT_DATA: DefaultFormData = {
  contact_name: "",
  customer_email: "",
  customer_phone: "",
  customer_address: "",
  source: "EXTERNAL_FORM",
  bypass_validation: "False",
};

const PublicAddJobModal = () => {
  const [formData, setFormData] = useState<NewJob>(DEFAULT_DATA);
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [companyFormData, setCompanyFormData] = useState<CompanyFormInterface>(COMPANY_DEFAULT_DATA);
  const [contactFormData, setContactFormData] = useState<DefaultFormData>(CONTACT_DEFAULT_DATA);
  const [companyErrors, setCompanyErrors] = useState<{ [key: string]: string }>({});
  const [contactErrors, setContactErrors] = useState<{ [key: string]: string }>({});
  const [linkCompanySelected, setLinkCompanySelected] = useState(false);
  const [capVal, setCapVal] = useState(null);
  const analytics = useJune();
  const [foundFranchise, setFoundFranchise] = useState(false)
  const [openAlertFail, setOpenAlertFail] = useState(false)

  useEffect(() => {
    setCapVal(null);
  }, [step]);
  const validateContactForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!contactFormData.customer_email) {
      newErrors.customer_email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactFormData.customer_email)) {
        newErrors.customer_email = "Invalid email format";
      }
    }

    const phoneRegex = /^\d{10}$/;
    if (
      contactFormData.customer_phone &&
      !phoneRegex.test(unformatPhoneNumber(contactFormData.customer_phone))
    ) {
      newErrors.customer_phone = "Phone number must be exactly 10 digits.";
    }
    setContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCompanyForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!companyFormData.name) newErrors.name = "Company Name is required";
    if (companyFormData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(companyFormData.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    const phoneRegex = /^\d{10}$/;
    if (companyFormData.phone && !phoneRegex.test(unformatPhoneNumber(companyFormData.phone))) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }
    setCompanyErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCaptchaChange = (value: any) => {
    setCapVal(value);
  };

  const modalSteps = [
    {
      stepName: "Your Info",
      description: "Tell us about yourself",
      canSkip: false,
      page: (
        <div className="w-full">
          <AddJobForm
            formData={formData}
            setContactData={setContactFormData}
            setFormData={setFormData}
            contactData={contactFormData}
            errors={contactErrors}
          />
          <div className="grid grid-cols-2 gap-4 max-smx:grid-cols-1">
            <div className="flex items-center gap-1 my-4">
              <Checkbox
                active={linkCompanySelected}
                setActive={setLinkCompanySelected}
              />
              <p className="leading-none">
                Would you like to link a company to this request?
              </p>
            </div>
          </div>
          {linkCompanySelected && (
            <NewCompanyForm
              companyFormData={companyFormData}
              setCompanyFormData={setCompanyFormData}
              errors={companyErrors}
              isExternalForm={true}
            />
          )}
        </div>
      ),
    },
    {
      stepName: "Additional Details",
      description: "Share any details or special instructions regarding your appointment.",
      canSkip: true,
      page: (
        <div className="w-3/4">
          <div className="w-full mx-auto mb-4">
            <Input
              type="textarea"
              id="customer_description"
              variant="default"
              label={`${
                formData.pipeline === "CONSULTATION" ? "Consultation" : "Repair"
              } Details (Be specific)`}
              placeholder="Looking for new motorized blinds..."
              handleTextAreaChange={handleTextAreaChange}
              defaultValue={formData.customer_description}
              isRequired={false}
              className="min-h-96"
            />
          </div>
        </div>
      ),
    },
    {
      stepName: "Pick a Slot",
      description:
        "Pick a date and time that works best for your appointment",
      canSkip: false,
      page: (
        <AppointmentsSchedule
          setForm={setFormData}
          step={step}
          setStep={setStep}
          address={contactFormData.customer_address}
          formData={formData}
          setFoundFranchise={setFoundFranchise}
        />
      ),
    },
    {
      stepName: "Review and Submit",
      description: "Double-check your details to make sure everything looks good before submitting",
      canSkip: false,
      page: (
        <div className="w-1/2">
          <AppointmentDetail job={formData} contact={contactFormData} />
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_CAPTCHA_CLIENT_KEY as string}
            onChange={handleCaptchaChange}
            className="flex justify-center my-6"
          />
        </div>
      ),
    },
    {
      stepName: "Confirmation",
      description: "",
      canSkip: false,
      page: (
        <Confirmation 
          foundFranchise={foundFranchise} 
          setStep={setStep}
          setCompany={setCompanyFormData}
          setContact={setContactFormData}
          setJob={setFormData}
        />
      ),
    },
  ];

  const checkRequiredFields = useMemo(() => {
    const companyReqs = linkCompanySelected ? companyFormData.name.length !== 0 : true;
    const appointmentIsSelected = step === 3 ? formData.consultation_date && formData.start_time : true;
    const captchaSuccess = step === modalSteps.length-1 ? capVal != null : true;
    if (
      formData.pipeline &&
      contactFormData.contact_name.length &&
      contactFormData.customer_address.length &&
      contactFormData.customer_email.length &&
      contactFormData.customer_phone.length &&
      companyReqs &&
      appointmentIsSelected &&
      captchaSuccess
    ) {
      return true;
    } else {
      return false;
    }
  }, [
    formData,
    contactFormData,
    companyFormData,
    linkCompanySelected,
    step,
    capVal,
  ]);

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      contact: {
        ...contactFormData,
        customer_address: "6342 Lantana Rd, Lake Worth Beach, FL 33463",
        customer_phone: "+1" + contactFormData.customer_phone,
      },
      new_company: Object.values(companyFormData).every(
        (value) => value.trim().length === 0
      )
        ? null
        : companyFormData,
    };
    try {
      setIsLoading(true)
      await externalAddJob(payload);
      analytics?.track("externalAddJob");
      setStep(prevStep => prevStep +1)
    } catch (e) {
      setOpenAlertFail(true)
      throw e;
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="w-full px-6">
      <Alerts
        key="alert-company-edited"
        variant="error"
        open={openAlertFail}
        setOpen={setOpenAlertFail}
        title="Submission Failed"
        desc="We encountered an issue while processing your form. Try submitting again in a moment."
      />
      <div className="relative space-y-6 p-6 max-smx:p-0">
        <main className="my-10 flex flex-col items-center justify-center gap-10">
          <nav className="relative w-fit">
            <div className="absolute left-1/2 top-5 -z-10 h-0.5 max-lg:w-10/12 lg:w-11/12 -translate-x-1/2 bg-neutral-40"></div>
            <section className="flex items-start justify-center gap-20 max-lg:gap-10 max-md:gap-4 max-smx:gap-2">
              {modalSteps.map((value, key) => (
                <div
                  className="flex flex-col items-center gap-2 text-center"
                  key={key}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                      step > key
                        ? "border-primary-main bg-primary-main"
                        : "border-neutral-50 bg-neutral-50"
                    } text-xl sm:text-body-xl font-semibold text-white`}
                  >
                    {step > 0 && step <= key + 1 && key + 1}

                    {step > key + 1 && (
                      <CheckIcon className="h-6 w-6 text-white" />
                    )}
                  </span>

                  <h5 className="text-xs font-semibold text-neutral-50">
                    {value.stepName}
                  </h5>
                </div>
              ))}
            </section>
          </nav>

          <header className="space-y-2 text-center">
            <h3 className="text-xl sm:text-body-xl font-semibold">
              {modalSteps[step - 1].stepName}
            </h3>
            <p
              className="text-xs sm:text-sm text-neutral-50"
              dangerouslySetInnerHTML={{
                __html: modalSteps[step - 1].description,
              }}
            />
          </header>
          {modalSteps[step - 1].page}
        </main>

        {step !== modalSteps.length && 
          <footer className="flex justify-end gap-3">
            <Button
              className="!h-10"
              size="md"
              variant="primary-nude"
              disabled={step === 1}
              onClick={() => {
                if (step === 4 && !formData.consultation_date && !formData.start_time) {
                  setStep(2)
                } else { 
                  setStep((prevStep) => prevStep - 1)
                }
              }}
            >
              Previous
            </Button>

            <Button
              className="w-24 !h-10"
              size="md"
              variant="primary-bg"
              onClick={async () => {
                if (step === modalSteps.length-1) {
                  await handleSubmit();
                } else {
                  if (step === 1 && !validateContactForm()) return;
                  if (linkCompanySelected && !validateCompanyForm()) return;
                  setStep((prevStep) => prevStep + 1);
                }
              }}
              disabled={!checkRequiredFields}
            >
              {isLoading ? (
                <Spinner />
              ) : modalSteps[step - 1].canSkip &&
                step === 2 &&
                !formData.customer_description.length ? (
                "Skip"
              ) : step === modalSteps.length-1 ? (
                "Submit"
              ) : (
                "Next"
              )}
            </Button>
          </footer>}
      </div>
    </div>
  );
};

export default PublicAddJobModal;