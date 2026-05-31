"use client";

import { useEffect, useMemo, useState } from "react";
import { Alerts, Button } from "@/components/atomics";
import { Modal } from "@/components/molecules";
import { CheckIcon, LoadingIcon } from "@/assets/icons";
import { addActivity } from "@/services/activities";
import { ActivityInformationFormData } from "./ActivityInformationFormData";
import moment from "moment";
import ListJobView from "../../jobs/ListView";
import { convertLocalToUTC } from "@/utils/formatDate";
import { useJune } from "@/hooks/useJune";
import ListJobsActivity from "../ListJobs";

type Props = {
  setOpenAddActivity: (value: boolean) => void;
  setIsRefetch: (value: boolean) => void;
  openAddActivity: boolean;
  filterId?: string;
  filterType?: "companies" | "documents" | "contacts";
};

interface AlertsType {
  open: boolean;
  message: string;
  variant: "success" | "error" | "info" | "warning";
}

type AddActivityFormData = {
  activity_name: string;
  activity_type: "Call" | "Deadline" | "Email" | "Meeting" | "Task";
  meeting_type: "Virtual" | "In Person" | null;
  meeting_location: string | null;
  meeting_link: string | null;
  due_date: string;
  duration: string;
  start_time?: string;
  job?: number;
};

const AddActivityModal = ({
  openAddActivity,
  setOpenAddActivity,
  setIsRefetch,
  filterId,
  filterType,
}: Props) => {
  const [addActivityFormData, setAddActivityFormData] =
    useState<AddActivityFormData>({
      activity_name: "",
      activity_type: "Call",
      due_date: "2024-07-18",
      duration: "",
      start_time: "--:--",
      meeting_type: null,
      meeting_location: null,
      meeting_link: null,
    });
  const [selectedJob, setSelectedJob] = useState<any>();

  const [openAlerts, setOpenAlerts] = useState<AlertsType>({
    open: false,
    message: "",
    variant: "success",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const analytics = useJune();

  useEffect(() => {
    if (!openAddActivity) {
      setStep(1);
      setAddActivityFormData((prevAddActivityFormData) => ({
        ...prevAddActivityFormData,
        due_date: moment(new Date()).format("YYYY-MM-DD"),
        start_time: moment(new Date()).format("HH:mm"),
        job: parseInt(filterId as string),
      }));
    }
  }, [openAddActivity]);

  const modalSteps = [
    {
      stepName: "Create Activity",
      description: "",
      canSkip: false,
      page: (
        <ActivityInformationFormData
          addActivityFormData={addActivityFormData}
          setAddActivityFormData={setAddActivityFormData}
        />
      ),
    },
    {
      stepName: "Link Job",
      description:
        'You can create or select a job below, or click "Skip" in the bottom right to proceed without linking a job',
      canSkip: true,
      page: (
        <div className="grid w-full max-h-[380px] overflow-auto grid-cols-1 gap-6">
          <ListJobsActivity
            setSelectedJob={setSelectedJob}
            selectedJob={selectedJob}
            isSelectJob={true}
          />
        </div>
      ),
    },
    {
      stepName: "Confirmation",
      description: "Confirmation new customer information",
      canSkip: false,
      page: (
        <>
          <div className="container mx-auto px-4">
            <div className="p-4">
              <h1 className="text-sm sm:text-md font-semibold">NEW ACTIVITY</h1>
              <div className="mt-2 px-6 py-4 border rounded-md">
                {Object.entries(addActivityFormData).map(
                  ([key, value]) =>
                    key !== "job" && value ? (
                      <p
                        key={key}
                        className="text-sm font-semibold text-gray-500"
                      >
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace("_", " ")}
                        : {value}
                      </p>
                    ) : ""
                )}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            {selectedJob ? (
              <div className="p-4 rounded-lg">
                <h1 className="text-sm sm:text-md font-semibold">LINKED JOB</h1>
                <div className="mt-2 px-6 py-4 border rounded-md shadow-small">
                  <p className="text-sm">
                    <strong>Job Name:</strong> {(selectedJob as any).job_name}
                  </p>
                  <p className="text-sm">
                    <strong>Description:</strong>{" "}
                    {(selectedJob as any).customer_description}
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-semibold text-center text-sm sm:text-md text-neutral-50">
                No Company Linked
              </p>
            )}
          </div>
        </>
      ),
    },
  ];

  const onChangeStep = (value: number) => setStep(value);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (filterType && filterId) {
        setAddActivityFormData((prevAddActivityFormData) => ({
          ...prevAddActivityFormData,
          job: parseInt(filterId),
        }));
      }

      const isValidate =
        addActivityFormData?.due_date && addActivityFormData?.start_time;
      const UtcTimeConverter: any =
        isValidate &&
        convertLocalToUTC(
          `${moment(addActivityFormData?.due_date).format("YYYY-MM-DD")}T${addActivityFormData.start_time
          }`
        );
      const [due_date, start_time] = UtcTimeConverter.split(",").map(
        (part: string) => part.trim()
      );

      const response = await addActivity({
        ...addActivityFormData,
        job: selectedJob?.id || null,
        due_date: isValidate ? due_date : addActivityFormData?.due_date,
        start_time: isValidate ? start_time : addActivityFormData?.start_time,
      });
      analytics?.track("addActivity");
      response && setIsLoading(false);
      setOpenAlerts({ variant: "success", open: true, message: "" });
      setOpenAddActivity(false);
      setIsRefetch(true);
    } catch (error:any) {
      setOpenAlerts({
        variant: "error",
        open: true,
        message: error?.response?.data?.job[0],
      });
      setIsLoading(false);
      throw error;
    }
  };

  const checkRequiredFields = useMemo(() => {
    if (
      addActivityFormData.activity_name.length &&
      addActivityFormData.activity_type.length > 0 &&
      addActivityFormData.duration.length
    ) {
      return true;
    } else {
      setStep(1);
      return false;
    }
  }, [addActivityFormData]);

  return (
    <>
      <Modal
        variant="primary"
        className=""
        title={"Add Activity"}
        open={openAddActivity}
        setOpen={setOpenAddActivity}
      >
        <div className="relative space-y-6">
          <main className="my-10 flex flex-col items-center justify-center gap-10">
            <nav className="relative w-fit">
              <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 -translate-x-1/2 bg-neutral-40"></div>
              <section className="flex items-center justify-center gap-20">
                {modalSteps.map((value, key) => (
                  <div className="flex flex-col items-center gap-2" key={key}>
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
              <h3 className="!text-xl sm:!text-body-xl font-semibold">
                {modalSteps[step - 1].stepName}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-50">
                {modalSteps[step - 1].description}
              </p>
            </header>
            {modalSteps[step - 1].page}
          </main>

          <footer className="flex justify-end gap-3">
            <Button
              className="!h-10"
              size="md"
              variant="primary-nude"
              onClick={() => {
                if (step === 1) {
                  setOpenAddActivity(false);
                } else {
                  onChangeStep(step - 1);
                }
              }}
            >
              {step === 1 ? "Cancel" : "Previous"}
            </Button>

            <Button
              className="w-24 !h-10"
              size="md"
              variant="primary-bg"
              onClick={async () => {
                if (step === modalSteps.length) {
                  await handleSubmit();
                } else {
                  onChangeStep(step + 1);
                }
              }}
              disabled={!checkRequiredFields}
            >
              {isLoading ? (
                <LoadingIcon />
              ) : step === modalSteps.length ? (
                "Submit"
              ) : modalSteps[step - 1]?.canSkip ? (
                !selectedJob ? (
                  "Skip"
                ) : (
                  "Next"
                )
              ) : (
                "Next"
              )}
            </Button>
          </footer>
        </div>
      </Modal>
      {openAlerts.open && (
        <Alerts
          key="alert-activity-added"
          variant={openAlerts.variant}
          open={openAlerts.open}
          setOpen={() => setOpenAlerts({ ...openAlerts, open: false })}
          title={
            openAlerts.variant == "error"
              ? "Activity creation Error"
              : "Activity has been added"
          }
          desc={
            openAlerts.message ||
            "Activity has been added. You can manage this activity or add additional information as needed."
          }
        />
      )}
    </>
  );
};

export default AddActivityModal;
