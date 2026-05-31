"use client";
import Route from "@/components/atomics/Route";
import FilterTech from "@/components/templates/tech/Filter";
import { routes } from "@/constants/routes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pagination } from "@/components/atomics";
import { dispatchTypes, size } from "@/constants/constants";
import { formatDateForFranchiseUser } from "@/utils/formatDate";
import { formatDuration } from "@/utils/formatDate";
import { Appointments } from "@/interface/tech";
import { getDispatch, getTechnicianScheduler } from "@/services/dispatch";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { Button, Alerts } from "@/components/atomics";
import {
  Button as DropDownBtn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@relume_io/relume-ui";
import { Modal } from "@/components/molecules";
import { deleteJobById, getJobsById } from "@/services/jobs";
import { MarkerInterface } from "@/interface/mapBox";
import { useTechLocation } from "@/context/techLocationContext";
import MapView from "@/components/pages/MapView";
import AddJobModal from "@/components/templates/crm/jobs/AddJobModal";
import { TimelineGroupBase } from "react-calendar-timeline";
// make sure you include the timeline stylesheet or the timeline will not be styled
import moment from "moment-timezone";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { DatePicker } from "@/components/atomics/DatePicker/DatePicker";
import { getNextAppointmentDriveTime } from "@/services/tech";
import TechSchedual from "@/components/TechSchedule";
import convertToLocalTimeToShift from "@/utils/localTImeConverter";
import { getFranchise } from "@/utils/getFranchise";
import { useJune } from "@/hooks/useJune";

interface CustomTimelineGroup extends TimelineGroupBase {
  user_color: string;
  shift_end_time: string;
  shift_start_time: string;
}

const Tech = () => {
  const { franchise } = getFranchise();

  const [appointments, setAppointments] = useState<Appointments[]>([]);
  const [openAddJob, setOpenAddJob] = useState(false);
  const [appointmentType, setAppointmentType] = useState("unassigned-upcoming");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [productIdToDelete, setJobIdToDelete] = useState<string>("");
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [openModalUpsertJob, setOpenModalUpsertJob] = useState(false);
  const { techLocations } = useTechLocation();
  const [jobmarkers, setJobMarkers] = useState<MarkerInterface[]>([]);
  const [techmarkers, setTechMarkers] = useState<MarkerInterface[]>([]);
  const [currentTime, setCurrentTime] = useState(
    moment().tz(franchise?.franchise_timezone)
  );
  const [techSchedual, setTechSchedual] = useState<{
    technicians: CustomTimelineGroup[];
    events: any;
  }>({ technicians: [], events: [] });
  const analytics = useJune();

  const mapDataToTimeline = (data: any) => {
    const getRandomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
  
    const unAssignedTech = {
      id: "unassigned",
      title: "Unassigned",
      user_color: "#808080",
    };
  
    const technicians: CustomTimelineGroup[] = [
      unAssignedTech,
      ...data
        .filter((entry: any) => entry?.technician)
        .map((entry: any) => {
          const {
            id,
            name,
            email,
            tech_vehicle,
            tech_license_plate,
            user_color,
            shift_start_time,
            shift_end_time,
          } = entry?.technician;
  
          const shiftStartTimeLocal = convertToLocalTimeToShift(
            currentTime,
            shift_start_time,
            "UTC"
          );
          const shiftEndTimeLocal = convertToLocalTimeToShift(
            currentTime,
            shift_end_time,
            "UTC",
            shiftStartTimeLocal
          );
  
          return {
            id,
            title: name,
            email,
            tech_vehicle,
            tech_license_plate,
            shift_start_time: moment
              .tz(shiftStartTimeLocal, franchise?.franchise_timezone)
              .format("YYYY-MM-DD HH:mm"),
            shift_end_time: moment
              .tz(shiftEndTimeLocal, franchise?.franchise_timezone)
              .format("YYYY-MM-DD HH:mm"),
            user_color: user_color || getRandomColor(),
          };
        })
        .filter(
          (
            item: CustomTimelineGroup,
            index: number,
            self: CustomTimelineGroup[]
          ) => index === self.findIndex((t) => t?.id === item?.id)
        )
        .sort((a: CustomTimelineGroup, b: CustomTimelineGroup) => {
          if (a?.id === "unassigned") return -1;
          if (b?.id === "unassigned") return 1;
          return 0;
        }),
    ];
  
    const events: any = [];
      data.forEach((entry: any) => {
      entry.jobs.forEach((job: any) => {
        const startTime = moment.tz(
          job?.consultation_date,
          franchise?.franchise_timezone
        );
        const endTime = startTime
          .clone()
          .add(job?.consultation_duration, "minutes");
        const {
          id,
          job_name,
          pipeline,
          stage,
          status,
          linked_contact,
          added_by,
          description,
        } = job;
        events.push({
          id,
          group: entry?.technician?.id ?? "unassigned",
          title: job_name,
          start_time: startTime.valueOf(),
          end_time: endTime.valueOf(),
          pipeline,
          stage,
          status,
          linked_contact,
          added_by,
          className: status.toLowerCase(),
          description: description ?? "",
          isJob: true,
        });
      });
  
      entry.activities.forEach((activity: any) => {
        const startTime = moment.tz(
          `${activity?.due_date} ${activity?.start_time}`,
          franchise?.franchise_timezone
        );
        const endTime = startTime.clone().add(activity?.duration, "minutes");
  
        const {
          id,
          activity_name,
          activity_type,
          assigned_to,
          added_by,
          completed,
          description,
        } = activity;
  
        events.push({
          id,
          group: entry?.technician?.id ?? "unassigned",
          title: activity_name,
          start_time: startTime.valueOf(),
          end_time: endTime.valueOf(),
          type: activity_type,
          assigned_to,
          added_by,
          className: completed ? "completed" : "pending",
          status: completed ? "COMPLETED" : "PENDING",
          description: description ?? "",
          isJob: false,
        });
      });
    });
  
    return { technicians, events };
  };

  const gapCalculator = async (techSchedule: any) => {
    const gapItems: any = [];
    const driveTimes: any = [];

    const groupedEvents = techSchedule.events.reduce((acc: any, event: any) => {
      if (!acc[event.group]) {
        acc[event.group] = [];
      }
      acc[event.group].push(event);
      return acc;
    }, {});

    Object.keys(groupedEvents).forEach((group) => {
      groupedEvents[group].sort((a: any, b: any) =>
        moment
          .tz(a.start_time, franchise?.franchise_timezone)
          .diff(moment.tz(b.start_time, franchise?.franchise_timezone))
      );
    });

    for (const group of Object.keys(groupedEvents)) {
      const events = groupedEvents[group];

      for (let i = 0; i < events.length - 1; i++) {
        const gapStart = events[i].end_time;
        const gapEnd = events[i + 1].start_time;
        const gapDuration = moment
          .tz(gapEnd, franchise?.franchise_timezone)
          .diff(moment.tz(gapStart, franchise?.franchise_timezone), "minutes");

        const origin_address = events[i]?.linked_contact?.customer_address;
        const destination_address =
          events[i + 1]?.linked_contact?.customer_address;

        if (origin_address && destination_address) {
          driveTimes.push({
            origin_address,
            destination_address,
            group,
            id: i,
          });
        }

        if (gapDuration > 0) {
          if (group !== "unassigned") {
            gapItems.push({
              id: `gap-${group}-${i}`,
              group: group,
              timeGap: formatDuration(gapDuration),
              start_time: gapStart,
              end_time: gapEnd,
              isGap: true,
              driveTime: "",
            });
          }
        }
      }
    }

    if (driveTimes.length > 0) {
      try {
        const driveTimeResponse: any = await getNextAppointmentDriveTime(
          driveTimes.map((item: any) => ({
            origin_address: item.origin_address,
            destination_address: item.destination_address,
          }))
        );
        analytics?.track("getNextAppointmentDriveTime");

        const { data } = driveTimeResponse;

        driveTimes.forEach((item: any, index: number) => {
          const driveTimeData = data[index];

          const driveTime = driveTimeData.duration
            ? driveTimeData.duration
            : "No Drive Time Available";

          const gapItem = gapItems.find(
            (gap: any) =>
              gap.group === item.group &&
              gap.id === `gap-${item.group}-${item.id}`
          );

          if (gapItem) {
            gapItem.driveTime = `${driveTime}`;
          }
        });
      } catch (error) {
        console.error("Error fetching drive times", error);
      }
    }

    return {
      ...techSchedule,
      events: [...techSchedule.events, ...gapItems],
    };
  };

  const fetchTechnicianSchedule = async (time?: any) => {
    const formattedDate = (time ?? currentTime).format("M-D-YYYY");
    const scheDualData = await getTechnicianScheduler(formattedDate, franchise);
    analytics?.track("getTechnicianScheduler");
    const techAndEvents = mapDataToTimeline(scheDualData);
    const gapSchedual = await gapCalculator(techAndEvents);
    setTechSchedual(gapSchedual);
  };

  useEffect(() => {
    fetchTechnicianSchedule();
  }, [currentTime]);

  const handleTodayClick = () => {
    setCurrentTime(moment().tz(franchise?.franchise_timezone));
  };

  const handlePrevClick = () => {
    setCurrentTime(currentTime.clone().subtract(1, "day"));
  };

  const handleNextClick = () => {
    setCurrentTime(currentTime.clone().add(1, "day"));
  };

  const handleDateClick = (date: any) => {
    setCurrentTime(date);
  };

  const handleDateChange = (selectedDate: any) => {
    const { year, month, day } = selectedDate;

    const newDate = moment.tz(
      { year, month: month - 1, day },
      franchise?.franchise_timezone
    );

    setCurrentTime(newDate);
  };

  const getNextFourDays = () => {
    return [0, 1, 2, 3, 4].map((offset) =>
      currentTime.clone().add(offset, "day")
    );
  };

  const [times, setTimes] = useState({
    eastern: "",
    central: "",
    pacific: "",
  });

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const eastern = now.toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const central = now.toLocaleString("en-US", {
        timeZone: "America/Chicago",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const pacific = now.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setTimes({ eastern, central, pacific });
    };

    updateTimes();
    const intervalId = setInterval(updateTimes, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const loadAppointments = async (type: string, page: number, size: number) => {
    const response = await getDispatch(type, page, size);
    analytics?.track("getDispatch");
    const { count, results } = response;
    if (results === undefined) return { appointments: [], count: 0 };
    const transformedAppointments = results?.map((item: any) => {
      const address =
        item.linked_contact?.customer_address_coordinates?.split(",");
      return {
        id: item.id,
        name: item.job_name || "",
        status: item.status,
        pipeline: item.pipeline,
        address: item.linked_contact?.customer_address || "",
        created_at: formatDateForFranchiseUser(item.consultation_date),
        assigned_Driver: item?.assigned_Driver || {},
        ...(address ? { latitude: address[0], longitude: address[1] } : {}),
      };
    });
    return { appointments: transformedAppointments, count };
  };

  const fetchAppointments = async (
    type: string,
    page: number,
    setAppointments: Function,
    setTotalPages: Function
  ) => {
    const { appointments, count } = await loadAppointments(type, page, size);
    setAppointments(appointments);
    setTotalPages(Math.ceil(count / size));
  };

  useMemo(() => {
    fetchAppointments(appointmentType, page, setAppointments, setTotalPages);
  }, [appointmentType, page]);

  useEffect(() => {
    const newMarkers: MarkerInterface[] = [];
    techSchedual?.events
      ?.filter((event: any) => !event?.isGap)
      ?.forEach((job: any) => {
        const userColor = techSchedual?.technicians?.find(
          (event: any) => event.id === job.group
        );
        if (job?.linked_contact?.customer_address_coordinates) {
          const [lat, lon] =
            job?.linked_contact?.customer_address_coordinates?.split(",");

          const latitude = parseFloat(lat.trim() || "");
          const longitude = parseFloat(lon.trim() || "");

          if (!isNaN(latitude) && !isNaN(longitude)) {
            newMarkers.push({
              id: +job.id,
              assigned_tech: +job.group,
              name: job.title,
              created_at: `${job.pipeline}: ${job.linked_contact?.createdAt}`,
              longitude: longitude,
              latitude: latitude,
              jobTime: job?.start_time,
              color: userColor?.user_color,
            });
          }
        }
      });
    setJobMarkers(newMarkers);
  }, [appointments, techSchedual?.events]);

  useEffect(() => {
    const newMarkers: MarkerInterface[] = [];
    techLocations?.forEach((techLocation: any) => {
      if (
        techLocation &&
        !isNaN(techLocation.latitude) &&
        !isNaN(techLocation.longitude)
      ) {
        newMarkers.push({
          id: techLocation.tech_id,
          name: techLocation.tech_name ?? "Technician",
          created_at: techLocation.timestamp.toString(),
          longitude: techLocation?.longitude,
          latitude: techLocation?.latitude,
        });
      }
    });

    setTechMarkers(newMarkers);
  }, [techLocations]);

  const handleStatus = useCallback((status: string) => {
    const statusIcons: { [key: string]: string } = {
      PENDING: "🕑",
      ACTIVE: "🚚",
      FAILED: "❌",
      COMPLETED: "✅",
      CANCELED: "❌",
    };
    return statusIcons[status] || null;
  }, []);

  const handleEditJob = async (id: string) => {
    const jobToEdit = await getJobsById(id);
    analytics?.track("getJobsById");
    if (jobToEdit?.id) {
      setJobToEdit(jobToEdit);
      setOpenModalUpsertJob(true);
    }
  };

  const renderAppointments = (
    appointments: Appointments[],
    type: string,
    currentPage: number,
    totalPages: number,
    setPage: Function,
    active: boolean
  ) => (
    <div>
      {appointments.length ? (
        <>
          {appointments.map((appointment, k) => (
            <div key={k} className="relative">
              <Route
                route={`${routes.crmJobs}/${appointment.id}`}
                linkClassName={`cursor-pointer flex items-center gap-2 max-sm:gap-2 rounded-xl border border-neutral-lightest p-2 mt-2 hover:bg-gray-100 ${
                  !active && "bg-neutral-15"
                }`}
              >
                <div className="flex items-center flex-auto gap-4 max-sm:gap-2">
                  <div className=" text-lg max-smx:text-md  flex justify-center items-center ">
                    {handleStatus(appointment.status)}
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-sm sm:text-md">
                      {appointment.name}
                    </p>
                    {type !== "assigned-upcoming" && (
                      <p className="text-sm">({appointment.pipeline})</p>
                    )}
                    <p className="text-neutral-light text-sm">
                      {appointment.address}
                    </p>
                    {type !== "assigned-upcoming" && (
                      <p className="text-neutral-light text-sm">
                        Consultation . {appointment.created_at}
                      </p>
                    )}
                  </div>
                </div>
              </Route>
              <div className="absolute group top-[50%] right-2 translate-y-[-50%]">
                <div className="transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropDownBtn className="!px-2 !py-1 !rounded-lg !bg-[#ffffff1a] smx:hover:!bg-[#3333330d] !border-none group-hover/btn:opacity-100 opacity-1 focus-visible:!ring-transparent focus-visible:!ring-offset-transparent text-black">
                        <HiOutlineDotsHorizontal />
                      </DropDownBtn>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white shadow-alerts rounded-lg absolute p-1 w-[192px] mt-1 z-20 -left-[160px] border-none data-[side=bottom]:!slide-in-from-bottom-0">
                      <DropdownMenuItem
                        className="px-4 py-2 bg-transparent hover:bg-[#3333330d] rounded-md !text-sm text-text-black"
                        onClick={() => handleEditJob(appointment.id)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="px-4 py-2 bg-transparent hover:bg-[#3333330d] rounded-md !text-sm text-text-black"
                        onClick={() => {
                          setOpenModalDelete(true);
                          setJobIdToDelete(appointment.id);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="smx:opacity-0 smx:group-hover:opacity-100">
                    <div className="bg-[#242424f2] text-white text-xs font-normal px-2.5 py-1.5 rounded-md absolute -top-8 -left-2 opacity-0 group-hover:opacity-100">
                      <span>Menu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className={"mt-5"}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(val) => setPage(val)}
            />
          </div>
        </>
      ) : (
        <h1 className="font-semibold text-center">
          No {type.replace(/-/g, " ")} appointments
        </h1>
      )}
    </div>
  );
  const [openAlertsDelete, setOpenAlertsDelete] = useState(false);

  const handleJobDelete = async (id: number) => {
    try {
      await deleteJobById(id);
      analytics?.track("deleteJobById");
      setOpenModalDelete(false);
      setJobIdToDelete("");
      setOpenAlertsDelete(true);
      appointments?.length &&
        setPage((prev) =>
          prev < 2
            ? appointments?.length < 2 && totalPages > 1
              ? prev + 1
              : prev
            : prev - 1
        );
      setAppointments([...appointments.filter((item) => +item.id !== id)]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAppointmentType = (type: string) => {
    if (type != appointmentType) {
      setAppointmentType(type);
      setJobMarkers([]);
      setPage(1);
    }
  };

  return (
    <>
      <div className="p-5">
        <div className="flex xl:flex-row flex-col gap-4 justify-between items-center">
          <div className="flex justify-end gap-2 items-center flex-wrap xl:order-1 order-2">
            <div className="bg-neutral-20 px-4 py-2 rounded-lg text-sm sm:text-md">
              <strong className="font-medium">Eastern Time (ET):</strong>{" "}
              {times.eastern}
            </div>
            <div className="bg-neutral-20 px-4 py-2 rounded-lg text-sm sm:text-md">
              <strong className="font-medium">Central Time (CT):</strong>{" "}
              {times.central}
            </div>
            <div className="bg-neutral-20 px-4 py-2 rounded-lg text-sm sm:text-md">
              <strong className="font-medium">Pacific Time (PT):</strong>{" "}
              {times.pacific}
            </div>
          </div>
          <Button
            size="lg"
            variant="tab-selected"
            onClick={() => setOpenAddJob(true)}
            className="!rounded-lg !border-none ml-auto xl:order-2 order-1 !py-[13px]"
          >
            Create a New Job
          </Button>
        </div>
        <div className="grid grid-cols-3 max-xl:grid-cols-2 gap-4 rounded-xl border border-neutral-lightest p-6 mt-5">
          <div className="col-span-2">
            <FilterTech title="Appointments" />
            <MapView
              markers={jobmarkers}
              techmarkers={techmarkers}
              style={{ flex: 1, minHeight: "50vh", maxHeight: "100vh" }}
            />
          </div>
          <div className="h-full col-span-1 max-xl:col-span-2">
            <FilterTech
              title={appointmentType}
              handleAppointmentType={handleAppointmentType}
              types={dispatchTypes}
            />
            <div className="flex flex-col gap-3">
              {renderAppointments(
                appointments,
                appointmentType,
                page,
                totalPages,
                setPage,
                false
              )}
            </div>
          </div>
        </div>
        {openModalDelete && (
          <Modal
            key={"delete-job"}
            variant="primary"
            className={""}
            title={"Delete Job"}
            open={openModalDelete}
            setOpen={() => setOpenModalDelete(false)}
          >
            <>
              <main className="mb-10 mt-4">
                <p className="text-sm text-neutral-80">
                  Are you sure you want to delete this product? Deleted Products
                  cannot be recovered
                </p>
              </main>
              <footer className="flex w-full justify-end gap-3">
                <Button
                  size="md"
                  variant="default-nude"
                  onClick={() => {
                    setOpenModalDelete(false);
                    setJobIdToDelete("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="md"
                  variant="error-bg"
                  onClick={() => {
                    if (productIdToDelete !== null) {
                      handleJobDelete(+productIdToDelete);
                    }
                  }}
                >
                  Submit
                </Button>
              </footer>
            </>
          </Modal>
        )}
        <Alerts
          key="alert-job-deleted"
          variant="success"
          open={openAlertsDelete}
          setOpen={setOpenAlertsDelete}
          title="Job has been deleted"
          desc="Job has been deleted. Please review any adjustments to your job records as necessary."
        />
        {openModalUpsertJob && (
          <AddJobModal
            setOpenAddJob={setOpenModalUpsertJob}
            openAddJob={openModalUpsertJob}
            jobToEdit={jobToEdit}
            setIsSubmit={(val) => {
              val &&
                fetchAppointments(
                  appointmentType,
                  page,
                  setAppointments,
                  setTotalPages
                );
            }}
          />
        )}
      </div>
      <div className="dispatch-calendar dispatch p-5">
        <div className="min-[640px]:flex-row min-[520px]:flex-col min-[400px]:flex-row flex-col flex justify-center items-center mb-5 min-[790px]:gap-4 gap-2">
          <div className="flex items-center min-[790px]:gap-4 gap-3 me-auto min-[400px]:me-0 min-[520px]:me-auto min-[640px]:me-0">
            <DatePicker
              selected={currentTime.format("YYYY-MM-DD")}
              handleDateChange={handleDateChange}
              placement="bottom start"
            />
            <Button
              variant="primary-bg"
              size="md"
              className="!h-10 hover:!bg-primary-main focus:!ring-0"
              onClick={handleTodayClick}
            >
              Today
            </Button>
          </div>
          <div className="flex items-center min-[790px]:gap-4 gap-3">
            <button
              onClick={handlePrevClick}
              className="text-[#333333b3] rounded-lg p-[6px] hover:bg-[#f4f5f6] duration-700"
            >
              <MdChevronLeft className="text-[28px]" />
            </button>
            {getNextFourDays().map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={`py-2 mx-1 text-sm min-[520px]:flex hidden ${
                  date.isSame(currentTime, "day")
                    ? "text-primary-main border-b-2 !border-b-primary-main font-semibold"
                    : "text-[#333333b3] border-b-2 border-b-transparent"
                }`}
              >
                {date.format("ddd, MMM D")}
              </button>
            ))}
            <button
              onClick={handleNextClick}
              className="text-[#333333b3] rounded-lg p-[6px] hover:bg-[#f4f5f6] duration-700"
            >
              <MdChevronRight className="text-[28px]" />
            </button>
          </div>
        </div>
        <TechSchedual
          technicians={techSchedual?.technicians}
          events={techSchedual?.events}
          currentTime={currentTime}
          franchise={franchise}
        />
        <AddJobModal
          setOpenAddJob={setOpenAddJob}
          openAddJob={openAddJob}
          jobToEdit={""}
          setIsSubmit={(val) => {}}
        />
      </div>
    </>
  );
};

export default Tech;
