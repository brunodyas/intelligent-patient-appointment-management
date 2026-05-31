import React, {
  ReactNode,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { Alerts, Button } from "@/components/atomics";
import Calendar from "@/components/molecules/FullCalender";
import { CheckIcon, LoadingIcon } from "@/assets/icons";
import { addActivity, getActivitiesByDateRange } from "@/services/activities";
import { ActivityInformationFormData } from "./AddActivityModel/ActivityInformationFormData";
import { routes } from "@/constants/routes";
import { DateTime } from "luxon";
import { parseCookies } from "nookies";
import { JWT } from "@/constants/enums/enums";
import { convertLocalToUTC } from "@/utils/formatDate";
import { useJune } from "@/hooks/useJune";

interface Event {
  title: string;
  end: string;
  id: number;
  start: string;
  activity_type: string | null;
}

type ModalStep = {
  stepName: string;
  description: string;
  page: ReactNode;
  canSkip: boolean;
  nextAction?: () => void;
};

interface CalendarConfigItem {
  title: string;
  className: string;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  modalChild: ReactNode;
}

type Props = {
  filterId?: string;
  filterType?: "company" | "documents" | "contact" | "job";
  setIsRefetch?: (value: boolean) => void;
  isRefetch?: boolean;
};

type AddActivityFormData = {
  activity_name: string;
  activity_type: "Call" | "Deadline" | "Email" | "Meeting" | "Task" | "";
  meeting_type: "Virtual" | "In Person" | null;
  meeting_location: string | null;
  meeting_link: string | null;
  due_date: string;
  duration?: number;
  start_time?: string;
  linked_companies?: number;
  linked_contact?: number;
};

export interface DateSelectArg {
  dateStr: string;
  date: Date;
  jsEvent: MouseEvent;
}

const formatUTCDate = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00Z");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

interface AlertsType {
  open: boolean;
  message: string;
  variant: "success" | "error" | "info" | "warning";
}

const CalendarPage = ({
  filterId,
  filterType,
  isRefetch,
  setIsRefetch,
}: Props) => {
  const router = useRouter();
  const [addActivityFormData, setAddActivityFormData] =
    useState<AddActivityFormData>({
      activity_name: "",
      activity_type: "Call",
      due_date: "",
      duration: 0,
      start_time: "",
      meeting_type: null,
      meeting_location: null,
      meeting_link: null,
    });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentViewDate, setCurrentViewDate] = useState({
    start_date: "",
    end_date: "",
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [openAlerts, setOpenAlerts] = useState<AlertsType>({
    open: false,
    message: "",
    variant: "success",
  });
  const [activeStep, setActiveStep] = useState(1);
  const isFetchingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[] | any>([]);
  const analytics = useJune();

  useEffect(() => {
    if (selectedDate) {
      setAddActivityFormData((prev: any) => ({
        ...prev,
        due_date: selectedDate ?? moment(new Date()).format("YYYY-MM-DD"),
        start_time: selectedTime ?? moment(new Date()).format("HH:mm"),
      }));
    }
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (isRefetch) {
      const { start_date, end_date } = currentViewDate;
      handleDateRangeChange(start_date, end_date);
      setIsRefetch && setIsRefetch(!isRefetch);
    }
  }, [isRefetch]);

  const handleDateRangeChange = useCallback(
    async (start_date: string, end_date: string) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const response: any = await getActivitiesByDateRange(
          start_date,
          end_date,
          filterType,
          filterId
        );
        setCurrentViewDate({ start_date, end_date });
        setEvents(
          response.map((activity: any) => {
            const cookies = parseCookies();
            const cookieValue = cookies[JWT];
            const franchise = cookieValue && JSON.parse(cookieValue);

            const originalTimezone = activity?.added_by?.franchise_timezone;
            const targetTimezone =
              franchise?.franchise_timezone || DateTime.local().zoneName;

            let startDateTimeInFranchiseTZ;
            let endDateTimeInFranchiseTZ;

            if (
              activity?.consultation_date &&
              activity?.consultation_duration
            ) {
              startDateTimeInFranchiseTZ = DateTime.fromISO(
                activity.consultation_date,
                {
                  zone: originalTimezone,
                }
              );

              endDateTimeInFranchiseTZ = startDateTimeInFranchiseTZ.plus({
                minutes: activity.consultation_duration,
              });
            } else {
              startDateTimeInFranchiseTZ = activity?.start_time
                ? DateTime.fromFormat(
                    `${activity.due_date} ${activity.start_time}`,
                    "MM-dd-yyyy HH:mm:ss",
                    { zone: originalTimezone }
                  )
                : DateTime.fromFormat(activity.due_date, "MM-dd-yyyy", {
                    zone: originalTimezone,
                  });

              if (activity?.duration) {
                endDateTimeInFranchiseTZ = startDateTimeInFranchiseTZ.plus({
                  minutes: activity.duration,
                });
              }
            }

            let startDateTimeInTargetTZ =
              startDateTimeInFranchiseTZ.setZone(targetTimezone);
            let endDateTimeInTargetTZ = endDateTimeInFranchiseTZ
              ? endDateTimeInFranchiseTZ.setZone(targetTimezone)
              : null;

            return {
              id: activity?.id,
              title: activity?.job_name || activity?.activity_name,
              start: startDateTimeInTargetTZ.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
              end: endDateTimeInTargetTZ
                ? endDateTimeInTargetTZ.toFormat("yyyy-MM-dd'T'HH:mm:ss")
                : null,
              isJob: activity?.job_name ? true : false,
              activity_type: activity?.activity_type,
              job_type: activity?.pipeline,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [setEvents]
  );

  const EventCustomeEventView = (eventData: any) => {
    const { event } = eventData;
    const isWithoutTime =
      event?.startStr === moment(event?.startStr).format("YYYY-MM-DD");
    const startStr = moment(event?.startStr).format("hh:mm A");

    return (
      <div>
        <div>
          {!isWithoutTime && <span className="event-time">{startStr}</span>}
          &nbsp;&nbsp;
          <b>{event?.title}</b>
        </div>
        <div>
          {event?.extendedProps?.activityType ? (
            <b>Activity Type: {event?.extendedProps?.activityType}</b>
          ) : (
            event?.extendedProps?.job_type && (
              <b>Job Type: {event?.extendedProps?.job_type}</b>
            )
          )}
        </div>
      </div>
    );
  };

  const eventFormat = (event: Event) => {
    const { activity_type, ...restEvent } = event;
    return {
      ...restEvent,
      extendedProps: {
        activityType: activity_type,
      },
    };
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (filterType && filterId) {
        setAddActivityFormData((prev) => ({
          ...prev,
          linked_companies: parseInt(filterId),
        }));
      }
      const isValidate =
        addActivityFormData?.due_date && addActivityFormData?.start_time;

      const UtcTimeConverter: any =
        isValidate &&
        convertLocalToUTC(
          `${moment(addActivityFormData?.due_date).format("YYYY-MM-DD")}T${
            addActivityFormData.start_time
          }`
        );
      const [due_date, start_time] = UtcTimeConverter.split(",").map(
        (part: any) => part.trim()
      );

      await addActivity({
        ...addActivityFormData,
        due_date: isValidate ? due_date : addActivityFormData?.due_date,
        start_time: isValidate ? start_time : addActivityFormData?.start_time,
      });
      analytics?.track("addActivity");

      setOpenAlerts({ variant: "success", open: true, message: "" });
      // api called after submit
      const { start_date, end_date } = currentViewDate;
      handleDateRangeChange(start_date, end_date);
    } catch (e) {
      setOpenAlerts({
        variant: "error",
        open: true,
        message: "There is some error. please try again with valid data",
      });
      console.log("Error adding activity:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (activeStep < modalSteps.length) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
      handleCancel();
    }
  };

  const handleCancel = () => {
    setOpenCalendarModal(false);
    setActiveStep(1);
    setSelectedDate(null);
  };

  const onDateClick = (arg: DateSelectArg) => {
    const dateStr = arg.dateStr;
    const [date, time] = dateStr.split("T");
    setSelectedDate(date);
    if (time) {
      const formattedTime = time.split(":").slice(0, 2).join(":");
      setSelectedTime(formattedTime);
    } else {
      setSelectedTime(null);
    }
    setOpenCalendarModal(true);
  };

  const handleEventClick = (eventInfo: any) => {
    const { event } = eventInfo;
    const id = event.id;
    if (event?.extendedProps?.isJob) {
      router.push(`${routes.crmJobs}/${id}`);
    } else {
      router.push(`${routes.crmActivities}/${id}`);
    }
  };

  const modalSteps: ModalStep[] = [
    {
      stepName: "Create Activity",
      description: "",
      canSkip: false,
      page: (
        <ActivityInformationFormData
          addActivityFormData={addActivityFormData}
          setAddActivityFormData={setAddActivityFormData}
          isCalender={true}
        />
      ),
    },
    {
      stepName: "Link Job",
      description:
        'You can create or select a job below, or click "Skip" in the bottom right to proceed without linking a job',
      canSkip: false,
      page: (
        <div className="margin-auto">
          <Button
            className="!h-10"
            variant="primary-bg"
            onClick={() => {
              /* Add your navigation logic here */
            }}
          >
            Go to AddActivity
          </Button>
        </div>
      ),
    },
  ];

  const calendarConfig: CalendarConfigItem[] = [
    {
      title: "Add Activity",
      className: "max-w-4xl",
      open: openCalendarModal,
      setOpen: setOpenCalendarModal,
      modalChild: (
        <>
          <main className="my-10 flex flex-col items-center justify-center gap-10">
            <nav className="relative w-fit">
              <div className="absolute left-1/2 top-5 -z-10 h-0.5 w-10/12 -translate-x-1/2 bg-neutral-40"></div>
              <section className="flex items-center justify-center gap-20">
                {modalSteps.map((step, key) => (
                  <div className="flex flex-col items-center gap-2" key={key}>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                        activeStep > key
                          ? "border-primary-border bg-primary-main"
                          : "border-neutral-50 bg-neutral-50"
                      } text-body-xl font-semibold text-white`}
                    >
                      {activeStep > 0 && activeStep <= key + 1 && key + 1}

                      {activeStep > key + 1 && (
                        <CheckIcon className="h-6 w-6 text-white" />
                      )}
                    </span>

                    <h5 className="text-xs font-semibold text-neutral-50">
                      {step.stepName}
                    </h5>
                  </div>
                ))}
              </section>
            </nav>

            <header className="space-y-2 text-center">
              <h3 className="!text-xl sm:!text-body-xl font-semibold">
                {modalSteps[activeStep - 1]?.stepName}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-50">
                {`${formatUTCDate(selectedDate as string)} at 0:00 - (1 day)`}
              </p>
            </header>
            {modalSteps[activeStep - 1]?.page}
          </main>

          <footer className="flex justify-end gap-3">
            <Button
              className="!h-10"
              size="md"
              variant="primary-nude"
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              className="!h-10"
              size="md"
              variant="primary-bg"
              onClick={handleNextStep}
            >
              {isLoading ? (
                <LoadingIcon />
              ) : activeStep === modalSteps.length ? (
                "Submit"
              ) : modalSteps[activeStep - 1]?.canSkip ? (
                "Skip"
              ) : (
                "Next"
              )}
            </Button>
          </footer>
        </>
      ),
    },
  ];

  return (
    <>
      <Calendar
        calendarConfig={calendarConfig}
        EventCustomeEventView={EventCustomeEventView}
        eventFormat={eventFormat}
        events={events}
        openCalendarModal={openCalendarModal}
        onDateClick={onDateClick}
        handleEventClick={handleEventClick}
        onDateRangeChange={handleDateRangeChange}
      />

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

export default CalendarPage;
