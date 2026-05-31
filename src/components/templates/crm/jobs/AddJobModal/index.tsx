"use client";

import { CheckIcon } from "@/assets/icons";
import { Button } from "@/components/atomics";
import { Modal } from "@/components/molecules";
import { useEffect, useMemo, useState } from "react";
import JobInformationFormData from "./JobInformationFormData";
import { addJob, createJobAll, updateJobById } from "@/services/jobs";
import { useSelectContact } from "@/context/selectContact";
import TechniciansList from "./TechniciansList";
import { CRMTech } from "@/interface/jobs";
import { useSelectCompany } from "@/context/selectCompany";
import { addContact } from "@/services/contacts";
import ContactsSubPage from "./ContactsSubpage";
import { formatPhoneNum } from "@/utils/formatHelper";
import { DateTime } from "luxon";
import Spinner from "@/components/atomics/Spinner";
import JobConfirmationDetails from "./JobCofirmationDetails";
import { useJune } from "@/hooks/useJune";

type Props = {
  setOpenAddJob: (value: boolean) => void;
  openAddJob: boolean;
  jobToEdit: any;
  setIsSubmit: (value: boolean) => void;
};

const localDateTime = DateTime.now().toLocal();

const DEFAULT_DATA = {
  job_name: "",
  pipeline: "REPAIRS",
  stage: "NEW",
  consultation_date: localDateTime.toFormat("yyyy-MM-dd"),
  consultation_duration: "",
  start_time: localDateTime.toFormat("HH:mm"),
  status: "PENDING",
  linked_contact: "",
  customer_description: "",
  bypass_validation: "False",
};

const AddJobModal = ({
  setIsSubmit,
  openAddJob,
  setOpenAddJob,
  jobToEdit,
}: Props) => {
  const analytics = useJune();
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(3);
  const { selectedContact, setSelectedContact } = useSelectContact();
  const [tech, setTech] = useState<CRMTech>();

  const { selectedCompany, setSelectedCompany, skipCompany, setSkipCompany } =
    useSelectCompany();

  useEffect(() => {
    if (jobToEdit) {
      const utcDateTime = DateTime.fromISO(jobToEdit?.consultation_date, {
        zone: "utc",
      });
      const localDateTime = utcDateTime.toLocal();
      setFormData({
        job_name: jobToEdit?.job_name,
        pipeline: jobToEdit?.pipeline,
        stage: jobToEdit?.stage,
        consultation_date: localDateTime?.toFormat("yyyy-MM-dd"),
        start_time: localDateTime.toFormat("HH:mm"),
        consultation_duration: jobToEdit?.consultation_duration,
        status: jobToEdit?.status,
        linked_contact: jobToEdit?.linked_contact?.id,
        customer_description: jobToEdit?.customer_description,
        bypass_validation: "False",
      });
      setTech(jobToEdit.assigned_Driver);
      setSelectedContact(jobToEdit.linked_contact);
    }
  }, [jobToEdit]);

  useEffect(() => {
    if (!openAddJob) {
      setStep(1);
      setFormData(DEFAULT_DATA);
      setSelectedContact(undefined);
    }
  }, [openAddJob]);

  const modalSteps = [
    {
      stepName: "Job",
      description: "",
      canSkip: false,
      page: (
        <JobInformationFormData formData={formData} setFormData={setFormData} />
      ),
    },
    {
      stepName: "Link a Customer",
      description: selectedContact
        ? `Selected Customer: <button class=" border-primary-main bg-neutral-101 text-primary-main  px-3 py-1 text-sm border font-semibold  ring-2 ring-transparent !rounded-[999px]">${selectedContact.contact_name}</button>`
        : "",
      canSkip: false,
      page: (
        <ContactsSubPage
          idSelect={
            selectedContact
              ? "id" in selectedContact
                ? selectedContact?.id?.toString()
                : ""
              : ""
          }
        />
      ),
    },
    {
      stepName: "Assign a Technician",
      description: tech
        ? `Selected Technician: <button class=" border-primary-main bg-neutral-101 text-primary-main  px-3 py-1 text-sm border font-semibold  ring-2 ring-transparent !rounded-[999px]">${tech.name}</button>`
        : "",
      canSkip: true,
      page: (
        <TechniciansList
          consultationDate={formData?.consultation_date}
          consultationDuration={formData?.consultation_duration}
          selectedTech={tech}
          setTech={setTech}
          start_time={formData?.start_time}
        />
      ),
    },
    {
      stepName: "Confirm Details",
      description: "",
      canSkip: false,
      page: (
        <JobConfirmationDetails
          job={formData}
          contact={selectedContact}
          company={skipCompany ? undefined : selectedCompany}
          tech={tech}
        />
      ),
    },
  ];

  const onChangeStep = (value: number) => {
    setStep(value);
  };

  const handleSubmit = async () => {
    if (selectedContact) {
      let linkedCompany;
      let linkedContact;
      let contactResponse;

      const combinedConsultationDateTime = `${formData.consultation_date} ${formData.start_time}`;

      const localDateTime = DateTime.fromFormat(
        combinedConsultationDateTime,
        "yyyy-MM-dd HH:mm",
        { zone: "local" }
      );
      const utcDateTime = localDateTime.toUTC();

      const jobPayload = {
        job_name: formData.job_name,
        customer_description: formData.customer_description,
        pipeline: formData.pipeline.toUpperCase(),
        stage: formData.stage.toUpperCase(),
        consultation_date: utcDateTime,
        consultation_duration: formData.consultation_duration,
        status: formData.status,
        bypass_validation: formData.bypass_validation,
      };
      console.log(jobPayload);
      if ("id" in selectedContact) {
        try {
          if (jobToEdit) {
            await updateJobById(jobToEdit.id, {
              ...jobPayload,
              linked_contact: selectedContact.id,
              assigned_Driver: tech?.id,
            });
            analytics?.track("updateJobById");
          } else {
            await addJob({
              ...jobPayload,
              linked_contact: selectedContact.id,
              assigned_Driver: tech?.id,
            });
            analytics?.track("addJob");
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        if (selectedCompany && !skipCompany) {
          if ("id" in selectedCompany) {
            linkedCompany = selectedCompany.id;
            try {
              contactResponse = await addContact({
                ...selectedContact,
                phone: formatPhoneNum(selectedContact?.phone),
                linked_company: linkedCompany,
              });
              analytics?.track("addContact");
              linkedContact = contactResponse.id;
            } catch (e) {
              console.error(e);
            }
          } else {
            //creates new job, new contact and new company
            createJobAll({
              ...jobPayload,
              new_contact: {
                ...selectedContact,
                phone: formatPhoneNum(selectedContact.phone),
              },
              new_company: {
                ...selectedCompany,
                phone: formatPhoneNum(selectedCompany.phone),
              },
            });
            analytics?.track("createJobAll");
            return;
          }
        } else {
          try {
            contactResponse = await addContact({
              ...selectedContact,
              phone: formatPhoneNum(selectedContact?.phone),
            });
            analytics?.track("addContact");
            linkedContact = contactResponse.id;
          } catch (e) {
            console.error(e);
          }
        }

        try {
          if (jobToEdit) {
            await updateJobById(jobToEdit.id, {
              ...jobPayload,
              linked_contact: linkedContact,
              assigned_Driver: tech?.id,
            });
            analytics?.track("updateJobById");
          } else {
            await addJob({
              ...jobPayload,
              linked_contact: linkedContact,
              assigned_Driver: tech?.id,
            });
            analytics?.track("addJob");
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    setTech(undefined);
    setFormData(DEFAULT_DATA);
    setSelectedContact(undefined);
    setSelectedCompany(undefined);
    setIsLoading(false);
    setIsSubmit(true);
    setSkipCompany(false);
  };

  const disabled = useMemo(() => {
    switch (step) {
      case 1:
        return false;
      default:
        break;
    }
  }, [step]);

  const checkRequiredFields = useMemo(() => {
    if (
      formData.job_name.length &&
      formData.consultation_date.length &&
      formData.start_time.length &&
      formData.consultation_duration.toString().length
    ) {
      return true;
    } else {
      setStep(1);
      return false;
    }
  }, [formData]);

  useEffect(() => {
    if (selectedCompany || skipCompany) setStep((prevStep) => prevStep + 1);
  }, [selectedCompany, skipCompany]);

  useEffect(() => {
    if (tech) setStep((prevStep) => (prevStep == 1 ? 1 : prevStep + 1));
  }, [tech]);

  useEffect(() => {
    if (jobToEdit.id) setStep(1);
  }, [jobToEdit]);

  return (
    <Modal
      variant="primary"
      className=""
      title={jobToEdit ? "Edit job" : "Add job"}
      open={openAddJob}
      setOpen={setOpenAddJob}
    >
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
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${step > key
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
              {modalSteps[step - 1]?.stepName}
            </h3>
            <p
              className="text-xs sm:text-sm text-neutral-50"
              dangerouslySetInnerHTML={{
                __html: modalSteps[step - 1]?.description,
              }}
            />
          </header>
          {modalSteps[step - 1]?.page}
        </main>

        <footer className="flex justify-end gap-3">
          <Button
            className="!h-10"
            size="md"
            variant="primary-nude"
            disabled={isLoading}
            onClick={() => {
              if (step === 1) {
                setOpenAddJob(false);
              } else {
                onChangeStep(step - 1);
              }
            }}
          >
            {step === 1 ? "Cancel" : "Previous"}
          </Button>
          {(step !== 2 || (selectedContact && step === 2) || tech) && (
            <Button
              className="w-24 !h-10"
              size="md"
              variant="primary-bg"
              onClick={async () => {
                if (step === modalSteps.length) {
                  setIsLoading(true);
                  await handleSubmit();
                  setIsLoading(false);
                  setOpenAddJob(false);
                } else {
                  onChangeStep(step + 1);
                }
              }}
              disabled={!checkRequiredFields || isLoading}
            >
              {isLoading ? (
                <Spinner />
              ) : step === modalSteps.length ? (
                "Submit"
              ) : tech ? (
                "Next"
              ) : modalSteps[step - 1]?.canSkip ? (
                "Skip"
              ) : (
                "Next"
              )}
            </Button>
          )}
        </footer>
      </div>
    </Modal>
  );
};

export default AddJobModal;
