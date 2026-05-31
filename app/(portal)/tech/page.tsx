"use client";
import { Title } from "@/components/atomics";
import Route from "@/components/atomics/Route";
import FilterTech from "@/components/templates/tech/Filter";
import { routes } from "@/constants/routes";
import { getTech, getTechnicianSchedule } from "@/services/tech";
import { useCallback, useEffect, useState } from "react";
import { Pagination } from "@/components/atomics";
import { size, techTypes } from "@/constants/constants";
import formatDate, { formatDuration } from "@/utils/formatDate";
import { arrow } from "@/icons/arrow";
import { Appointments } from "@/interface/tech";
import MapView from "@/components/pages/MapView";
import { MarkerInterface } from "@/interface/mapBox";
import { useJune } from "@/hooks/useJune";
import { Button, } from "@/components/atomics";
import { TimelineGroupBase } from "react-calendar-timeline";
import moment from "moment-timezone";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { DatePicker } from "@/components/atomics/DatePicker/DatePicker";
import { getNextAppointmentDriveTime } from "@/services/tech";
import TechSchedual from "@/components/TechSchedule";
import { getFranchise } from "@/utils/getFranchise";
import convertToLocalTimeToShift from "@/utils/localTImeConverter";
import { useAuth } from "@/context/auth";
interface CustomTimelineGroup extends TimelineGroupBase {
  user_color: string;
  shift_end_time: string;
  shift_start_time: string;
}

const Tech = () => {
  const { franchise } = getFranchise();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointments[]>([]);
  const [activeAppointments, setActiveAppointments] = useState<Appointments[]>(
    []
  );
  const [appointmentType, setAppointmentType] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeAppoinmentPage, setActiveAppoinmentPage] = useState(1);
  const [activeAppointmentTotalPages, setActiveAppointmentTotalPages] =
    useState(1);
  const [origin, setOrigin] = useState("");
  const [currentUserLocation, setCurrentUserLocation] =
    useState<MarkerInterface | null>(null);

  const [currentTime, setCurrentTime] = useState(
    moment().tz(franchise?.franchise_timezone)
  );
  const [techSchedual, setTechSchedual] = useState<{
    technicians: CustomTimelineGroup[];
    events: any;
  }>({ technicians: [], events: [] });
  const analytics = useJune();

  const mapDataToTimeline = (data: any) => {

    const technicians: CustomTimelineGroup[] = []
    if (user) {
      const {
        id,
        name,
        email,
        tech_vehicle,
        tech_license_plate,
        shift_start_time,
        shift_end_time,
      } = user;

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

      const technician = {
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
        user_color: "#c63d7f"
      };
      technicians.push(technician);
    }

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
          group: user?.id,
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
    const scheDualData = await getTechnicianSchedule(formattedDate, franchise);
    analytics?.track("getTechnicianScheduler");
    const techAndEvents = mapDataToTimeline(scheDualData);
    const gapSchedual = await gapCalculator(techAndEvents);
    setTechSchedual(gapSchedual);
  };

  useEffect(() => {
    fetchTechnicianSchedule();
  }, [currentTime]);

  const handleDateChange = (selectedDate: any) => {
    const { year, month, day } = selectedDate;

    const newDate = moment.tz(
      { year, month: month - 1, day },
      franchise?.franchise_timezone
    );

    setCurrentTime(newDate);
  };

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

  const getNextFourDays = () => {
    return [0, 1, 2, 3, 4].map((offset) =>
      currentTime.clone().add(offset, "day")
    );
  };

  const loadAppointments = async (type: string, page: number, size: number) => {
    const response = await getTech(type, page, size);
    analytics?.track("getTech");
    const { count, results } = response;
    const transformedAppointments = results.map((item: any) => {
      const address =
        item.linked_contact?.customer_address_coordinates?.split(",");

      let latitude: number | undefined;
      let longitude: number | undefined;

      if (address && address.length === 2) {
        const [lat, lng] = address.map((coord: string) =>
          parseFloat(coord.trim())
        );
        if (!isNaN(lat) && !isNaN(lng)) {
          latitude = lat;
          longitude = lng;
        }
      }

      return {
        id: item.id,
        name: item.job_name || "",
        status: item.status,
        pipeline: item.pipeline,
        address: item.linked_contact?.customer_address || "",
        created_at: formatDate(item.consultation_date),
        ...(latitude !== undefined && longitude !== undefined
          ? { latitude, longitude }
          : {}),
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

  useEffect(() => {
    fetchAppointments(
      "active",
      activeAppoinmentPage,
      setActiveAppointments,
      setActiveAppointmentTotalPages
    );
    if (window) setOrigin(window.location.origin);
  }, [activeAppoinmentPage]);

  useEffect(() => {
    fetchAppointments(appointmentType, page, setAppointments, setTotalPages);
  }, [appointmentType, page]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentUserLocation({
            id: Number(user?.id),
            name: "Current Location",
            created_at: "Now",
            latitude,
            longitude,
            isTechnician: true,
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  }, []);

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

  const transformToMarkers = (
    appointments: Appointments[]
  ): MarkerInterface[] => {
    return appointments
      .filter((item) => item?.latitude && item?.longitude)
      .map((item) => ({
        id: Number(item.id),
        name: item.name,
        created_at: item.created_at,
        longitude: Number(item.longitude),
        latitude: Number(item.latitude),
      }));
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
            <Route
              key={k}
              route={`${routes.crmJobs}/${appointment.id}`}
              linkClassName={`cursor-pointer flex items-center gap-2 max-sm:gap-2 rounded-xl border border-neutral-lightest p-2 mt-2 hover:bg-gray-100 ${!active && "bg-neutral-15"
                }`}
            >
              <div className="flex items-center flex-auto gap-4 max-sm:gap-2">
                {active ? (
                  <div className="h-20 w-20 text-lg max-smx:text-md max-smx:h-10 max-smx:w-15 flex justify-center items-center bg-neutral-lightest rounded-full">
                    {handleStatus(appointment.status)}
                  </div>
                ) : null}
                <div className="w-full">
                  <p className="font-bold">{appointment.name}</p>
                  {type !== "upcoming" && (
                    <p className="text-sm">({appointment.pipeline})</p>
                  )}
                  <p className="text-neutral-light">{appointment.address}</p>
                  {type !== "upcoming" && (
                    <p className="text-neutral-light">
                      Consultation . {appointment.created_at}
                    </p>
                  )}
                </div>
              </div>
              <div>{arrow("mr-2")}</div>
            </Route>
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
        <h1 className="font-semibold text-center">No {type} appointments</h1>
      )}
    </div>
  );



  return (
    <>
      <div className="p-5">
        <Title variant="primary" size="lg" className="pb-5">
          Active Appointments
        </Title>
        {renderAppointments(
          activeAppointments,
          "active",
          activeAppoinmentPage,
          activeAppointmentTotalPages,
          setActiveAppoinmentPage,
          true
        )}
        <div className="grid grid-cols-3 max-xl:grid-cols-2 gap-4 rounded-xl border border-neutral-lightest p-6 mt-5">
          <div className="col-span-2">
            <FilterTech title="My Appointment" />
            {origin && currentUserLocation && (
              <MapView
                markers={[
                  currentUserLocation,
                  ...transformToMarkers(appointments),
                ]}
                style={{ width: "100%", minHeight: "50vh" }}
              />
            )}
          </div>
          <div className="h-full col-span-1 max-xl:col-span-2">
            <FilterTech
              title={appointmentType}
              handleAppointmentType={setAppointmentType}
              types={techTypes}
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
      </div>
      <div className="dispatch-calendar p-5 w-full dispatch">
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
                className={`py-2 mx-1 text-sm min-[520px]:flex hidden ${date.isSame(currentTime, "day")
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
      </div>
    </>
  );
};

export default Tech;
