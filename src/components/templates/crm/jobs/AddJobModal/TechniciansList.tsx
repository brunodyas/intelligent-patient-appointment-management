"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import moment from "moment-timezone";
import { TimelineGroupBase } from "react-calendar-timeline";
import { FaUser } from "react-icons/fa";
import { DateTime } from "luxon";
import { getNextAppointmentDriveTime } from "@/services/tech";
import { getTechs } from "@/services/jobs";
import TechSchedual from "@/components/TechSchedule";
import { CRMJobTechsResponse, CRMTech } from "@/interface/jobs";
import { formatDuration } from "@/utils/formatDate";
import convertToLocalTimeToShift from "@/utils/localTImeConverter";
import { getFranchise } from "@/utils/getFranchise";
import { useJune } from "@/hooks/useJune";

type Props = {
  setTech: (Tech: CRMTech) => void;
  selectedTech: CRMTech | undefined;
  consultationDate?: any;
  consultationDuration?: string;
  start_time?: string;
};

interface CustomTimelineGroup extends TimelineGroupBase {
  user_color: string;
  shift_end_time?: string;
  shift_start_time?: string;
}

const TechniciansList = ({
  start_time,
  selectedTech,
  setTech,
  consultationDate,
  consultationDuration,
}: Props) => {
  const { franchise } = getFranchise();

  const [techSchedual, setTechSchedual] = useState<{
    technicians: any;
    events: any;
  }>({ technicians: [], events: [] });
  const [techs, setTechs] = useState<CRMJobTechsResponse>();
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
      ...data?.results
        ?.map((entry: any) => {
          const {
            id,
            name,
            tech_vehicle,
            tech_license_plate,
            user_color,
            shift_start_time,
            shift_end_time,
          } = entry;

          const shiftStartTimeLocal = convertToLocalTimeToShift(
            moment(consultationDate),
            shift_start_time,
            "UTC"
          );
          const shiftEndTimeLocal = convertToLocalTimeToShift(
            moment(consultationDate),
            shift_end_time,
            "UTC",
            shiftStartTimeLocal
          );

          return {
            id,
            title: name,
            tech_vehicle,
            tech_license_plate,
            user_color: user_color || getRandomColor(),
            shift_start_time:
              moment(shiftStartTimeLocal).format("YYYY-MM-DD HH:mm"),
            shift_end_time:
              moment(shiftEndTimeLocal).format("YYYY-MM-DD HH:mm"),
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
    data?.results?.forEach((entry: any) => {
      entry?.jobs?.forEach((job: any) => {
        const startTime = moment(job?.consultation_date);

        const endTime = startTime
          .clone()
          .add(job?.consultation_duration, "minutes");
        const { id, job_name, status, contact_address } = job;
        events.push({
          id,
          group: entry?.id ?? "unassigned",
          title: job_name,
          start_time: startTime,
          end_time: endTime,
          status,
          contact_address,
          className: status.toLowerCase(),
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
        moment(a.start_time).diff(moment(b.start_time))
      );
    });

    for (const group of Object.keys(groupedEvents)) {
      const events = groupedEvents[group];

      for (let i = 0; i < events.length - 1; i++) {
        const gapStart = events[i].end_time;
        const gapEnd = events[i + 1].start_time;
        const gapDuration = moment(gapEnd).diff(moment(gapStart), "minutes");

        const origin_address = events[i]?.contact_address;
        const destination_address = events[i + 1]?.contact_address;

        if (origin_address && destination_address) {
          driveTimes.push({
            origin_address,
            destination_address,
            group,
            id: i,
          });
        }

        if (gapDuration > 0) {
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
        console.log("error", error);
      }
    }

    return {
      ...techSchedule,
      events: [...techSchedule.events, ...gapItems],
    };
  };

  const isTechAvailable = (status?: string) => {
    return status == "Available";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const combinedConsultationDateTime = `${consultationDate} ${start_time}`;

        const localDateTime = DateTime.fromFormat(
          combinedConsultationDateTime,
          "yyyy-MM-dd HH:mm",
          { zone: "local" }
        );
        const utcDateTime = localDateTime.toUTC().toFormat("MM-dd-yyyy HH:mm");
        const response = await getTechs(utcDateTime, consultationDuration);
        analytics?.track("getTechs");
        setTechs(response);
        const techAndEvents = mapDataToTimeline(response);
        const gapSchedual = await gapCalculator(techAndEvents);
        setTechSchedual(gapSchedual);
      } catch (e) {
        throw e;
      }
    };
    fetchData();
  }, []);

  return (
    techs && (
      <>
        <div className="flex w-full overflow-y-auto p-5">
          <div className="flex gap-5">
            {techs?.results?.map((tech) => (
              <div
                className={`card bg-[#3333330d] px-6 py-7 rounded-xl relative group/btn max-w-[230px] xsm:mx-0 mx-auto w-full xsm:w-auto shadow-small transition-all duration-300 hover:shadow-medium ${
                  selectedTech?.id === tech.id ? "bg-primary-surface" : ""
                } ${
                  isTechAvailable(tech?.availability) ? "cursor-pointer" : ""
                }`}
                key={tech.id}
                onClick={() => {
                  isTechAvailable(tech?.availability) && setTech(tech);
                }}
              >
                <div
                  className={`${
                    isTechAvailable(tech?.availability)
                      ? "bg-system-success-green"
                      : "!bg-system-error-red"
                  } absolute top-2 right-2  w-fit h-fit rounded-full text-[10px] text-white py-0.5 px-1.5 z-40`}
                >
                  {isTechAvailable(tech?.availability)
                    ? "Available"
                    : "Unavailable"}
                </div>
                <div
                  className={`${
                    isTechAvailable(tech?.availability) ? "hidden" : "flex"
                  } !bg-black/20 opacity-50 absolute w-full h-full rounded-xl top-0 left-0`}
                ></div>
                <div className="flex flex-col items-stretch text-center">
                  <div className="mb-2.5 flex w-full items-center justify-center smx:mb-1.5">
                    {tech.photo ? (
                      <div className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full object-cover">
                        <Image
                          src={tech.photo}
                          alt={tech.name}
                          width={10}
                          height={10}
                          className="h-full w-full rounded-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-[106px] w-[106px] sm:w-[80px] sm:h-[80px] lg:h-[113px] lg:w-[113px] rounded-full flex items-center justify-center bg-gray-200">
                        <FaUser size="50%" color="gray" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h6 className="text-sm font-bold !leading-4 mb-1">
                      {tech.name}
                    </h6>
                    <p className="text-neutral-200  text-primary-main text-sm">
                      {tech.tech_vehicle}
                    </p>
                    <p className="text-neutral-200 text-sm">
                      {tech.tech_license_plate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="dispatch-calendar p-5 w-full tech-calendar">
          <TechSchedual
            technicians={techSchedual?.technicians}
            events={techSchedual?.events}
            currentTime={moment(consultationDate)}
            franchise={franchise}
          />
        </div>
      </>
    )
  );
};

export default TechniciansList;
