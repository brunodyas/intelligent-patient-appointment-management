import { useCallback } from "react";
import Timeline, {
  CustomMarker,
  DateHeader,
  TimelineGroupBase,
  TimelineHeaders,
  TimelineMarkers,
} from "react-calendar-timeline";
import moment from "moment-timezone";
import * as Tooltip from "@radix-ui/react-tooltip";
import "react-calendar-timeline/lib/Timeline.css";
import { updateTechnicianColor } from "@/services/dispatch";
import { routes } from "@/constants/routes";
import Route from "./atomics/Route";
import { useJune } from "@/hooks/useJune";

interface CustomTimelineGroup extends TimelineGroupBase {
  user_color: string;
  shift_end_time: string;
  shift_start_time: string;
}

const TechSchedual = ({
  technicians,
  events,
  currentTime,
  franchise,
}: {
  technicians: CustomTimelineGroup[];
  events: any;
  currentTime: any;
  franchise: any;
}) => {
  const analytics = useJune();
  const calculateVisibleTimeRange = (technicians: any) => {
    let earliestStart = moment(currentTime).startOf("day").valueOf();
    let latestEnd = moment(currentTime).endOf("day").valueOf();

    technicians?.forEach((tech: any) => {
      const shiftStart = moment(
        tech?.shift_start_time,
        "YYYY-MM-DD HH:mm"
      ).valueOf();
      const shiftEnd = moment(
        tech?.shift_end_time,
        "YYYY-MM-DD HH:mm"
      ).valueOf();

      if (earliestStart > shiftStart) {
        earliestStart = moment(shiftStart).subtract(1, "hour").valueOf();
      }

      if (latestEnd < shiftEnd) {
        latestEnd = moment(shiftEnd).add(1, "hour").valueOf();
      }
    });

    return {
      visibleTimeStart: earliestStart,
      visibleTimeEnd: latestEnd,
    };
  };

  const { visibleTimeStart, visibleTimeEnd } = calculateVisibleTimeRange(
    technicians || []
  );

  return (
    <>
      {technicians?.length ? (
        <div className="overflow-auto">
          <Timeline
            visibleTimeStart={visibleTimeStart}
            visibleTimeEnd={visibleTimeEnd}
            canMove={false}
            canResize={false}
            groups={technicians}
            items={events}
            itemTouchSendsClick={false}
            stackItems={true}
            timeSteps={{
              second: 0,
              minute: 0,
              hour: 1,
              day: 0,
              month: 0,
              year: 0,
            }}
            lineHeight={60}
            groupRenderer={({ group }) => (
              <div
                className={`text-neutral-200 flex items-center gap-1.5 group-${group.id}`}
              >
                <input
                  type="color"
                  disabled={true}
                  value={group.user_color}
                  className={`h-2.5 w-2.5 rounded-full bg-transparent !outline-none `}
                />
                <p className="truncate w-[calc(100%-10px)]">{group.title}</p>
              </div>
            )}
            itemRenderer={({ item, timelineContext, itemContext }: any) => {
              const group = technicians?.find(
                (group) => group.id == item.group
              );
              const backgroundColor = group ? group.user_color : "#ccc";
              const hexToRgba = (hex: string, opacity: any) => {
                let r = parseInt(hex?.slice(1, 3), 16);
                let g = parseInt(hex?.slice(3, 5), 16);
                let b = parseInt(hex?.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${opacity})`;
              };
              const itemStyle = {
                position: "absolute",
                top: `${itemContext.dimensions.top - 10}px`,
                left: `${itemContext.dimensions.left}px`,
                width: `${itemContext.dimensions.width}px`,
                height: `${itemContext.dimensions.height + 18}px`,
                minHeight: `${itemContext.dimensions.height + 18}px`,
                maxHeight: "fit-content",
                backgroundColor: item?.isGap
                  ? "transparent"
                  : hexToRgba(backgroundColor, 0.3),
                borderRadius: "4px",
                color: backgroundColor,
                overflow: "hidden",
                textAlign: "center",
                textWrap: "nowrap",
                fontSize: "12px",
                zIndex: "999",
              };
              return (
                <>
                  <Tooltip.Provider>
                    <Tooltip.Root delayDuration={300}>
                      <Tooltip.Trigger
                        asChild
                        {...itemContext.draggableProps}
                        style={itemStyle}
                      >
                        <div className="flex relative gap-[4px]">
                          {item?.isGap ? (
                            <div className="h-full w-full">
                              <div className="h-full flex flex-col justify-center">
                                <p className="font-semibold truncate pl-1   ">
                                  Drive: {item?.driveTime}
                                </p>
                                <div className="w-full h-[4px]">
                                  <div
                                    className="w-full h-[4px]"
                                    style={{ backgroundColor }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Route
                                route={item?.isJob ? `${routes.crmJobs}/${item.id}` : `${routes.crmActivities}/${item.id}`}
                                linkClassName="cursor-pointer h-full flex items-center"
                              >
                                <div className="h-full w-[6px]">
                                  <div
                                    className="w-[6px] h-full"
                                    style={{ backgroundColor }}
                                  ></div>
                                </div>
                                <div className="flex flex-col w-full justify-center items-start py-1">
                                  <p className="font-semibold">{item?.title}</p>
                                </div>
                              </Route>
                            </>
                          )}
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-white select-none rounded-[4px] bg-[#aaaaaa] px-3 py-1 !text-xs leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] max-w-[250px] relative z-[9999]"
                          sideOffset={5}
                        >
                          {item?.isGap ? (
                            <>
                              <p className="font-bold">
                                Time Gap: {item?.timeGap}
                              </p>
                              <p className="font-bold">
                                Drive Time: {item?.driveTime}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-bold">
                                Type: {item?.isJob ? "Job" : "Activity"}
                              </p>
                              <p className="font-bold">{item?.isJob ? "Job" : "Activity"} Name: {item?.title}</p>
                              <p className="font-bold">
                                Status: {item?.status}
                              </p>
                            </>
                          )}
                          <Tooltip.Arrow className="fill-[#aaaaaa]" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </>
              );
            }}
          >
            <TimelineHeaders>
              <DateHeader
                unit="hour"
                labelFormat={([startTime, endTime], unit, labelWidth) => {
                  const formattedStartTime = moment
                    .tz(startTime, franchise.franchise_timezone)
                    .isValid()
                    ? moment
                      .tz(startTime, franchise.franchise_timezone)
                      .format("h A")
                    : "Invalid Date";
                  return `${formattedStartTime}`;
                }}
              />
            </TimelineHeaders>
            <TimelineMarkers>
              <CustomMarker key={"today"} date={moment().toDate()}>
                {({ styles }) => {
                  const customStyles = {
                    ...styles,
                    backgroundColor: "#e55454",
                    width: "2px",
                  };
                  return <div style={customStyles} />;
                }}
              </CustomMarker>
              {technicians?.map(
                (tech, index) =>
                  tech?.shift_start_time &&
                  tech?.shift_end_time && (
                    <div
                      key={`shift-markers-${Math.round(Math.random() * 10000)}`}
                    >
                      <CustomMarker
                        key={`${index}`}
                        date={moment(
                          tech.shift_start_time,
                          "YYYY-MM-DD HH:mm"
                        ).toDate()}
                      >
                        {({ styles }) => {
                          const rowHeight: any =
                            document.querySelector(`.group-${tech?.id}`)
                              ?.clientHeight || 60;
                          let topCalc = 0;
                          const TechIndex = technicians?.findIndex(
                            (t) => t.id === tech.id
                          );
                          for (let i = 0; i < TechIndex; i++) {
                            const selectTech =
                              document.querySelector(
                                `.group-${technicians[i]?.id}`
                              )?.clientHeight || 60;
                            topCalc += selectTech;
                          }
                          const customStyles: any = {
                            ...styles,
                            backgroundColor: tech?.user_color,
                            width: "5px",
                            height: `${rowHeight}px`,
                            position: "absolute",
                            top: `${topCalc}px`,
                          };
                          return (
                            <>
                              <Tooltip.Provider>
                                <Tooltip.Root delayDuration={300}>
                                  <Tooltip.Trigger asChild>
                                    <div
                                      style={customStyles}
                                      className="!pointer-events-auto"
                                    />
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-white select-none rounded-[4px] bg-[#aaaaaa] px-3 py-1 !text-xs leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] z-50 max-w-[250px]"
                                      sideOffset={5}
                                    >
                                      <p className="font-bold">
                                        Shift Starts:{" "}
                                        {moment(
                                          tech.shift_start_time,
                                          "YYYY-MM-DD HH:mm"
                                        ).format("h:mm A")}
                                      </p>
                                      <Tooltip.Arrow className="fill-[#aaaaaa]" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            </>
                          );
                        }}
                      </CustomMarker>
                      <CustomMarker
                        key={`${index}`}
                        date={moment(
                          tech.shift_end_time,
                          "YYYY-MM-DD HH:mm"
                        ).toDate()}
                      >
                        {({ styles }) => {
                          const selectedRow = document.querySelector(
                            `.group-${tech?.id}`
                          );
                          const rowHeight: any =
                            selectedRow?.clientHeight || 60;
                          let topCalc = 0;
                          const TechIndex = technicians?.findIndex(
                            (t) => t.id === tech.id
                          );
                          for (let i = 0; i < TechIndex; i++) {
                            const selectTech =
                              document.querySelector(
                                `.group-${technicians[i]?.id}`
                              )?.clientHeight || 60;
                            topCalc += selectTech;
                          }
                          const customStyles: any = {
                            ...styles,
                            backgroundColor: tech?.user_color,
                            width: "5px",
                            height: `${rowHeight}px`,
                            position: "absolute",
                            top: `${topCalc}px`,
                          };
                          return (
                            <>
                              <Tooltip.Provider>
                                <Tooltip.Root delayDuration={300}>
                                  <Tooltip.Trigger asChild>
                                    <div
                                      style={customStyles}
                                      className="!pointer-events-auto"
                                    />
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-white select-none rounded-[4px] bg-[#aaaaaa] px-3 py-1 !text-xs leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] z-50 max-w-[250px]"
                                      sideOffset={5}
                                    >
                                      <p className="font-bold">
                                        Shift Ends:{" "}
                                        {moment(
                                          tech.shift_end_time,
                                          "YYYY-MM-DD HH:mm"
                                        ).format("h:mm A")}
                                      </p>
                                      <Tooltip.Arrow className="fill-[#aaaaaa]" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            </>
                          );
                        }}
                      </CustomMarker>
                    </div>
                  )
              )}
            </TimelineMarkers>
          </Timeline>
        </div>
      ) : (
        <div className="h-[300px] border border-[#eeeeee] rounded-lg">
          <p className="w-full h-full flex items-center justify-center font-medium text-base text-[#333333b3]/40">
            No jobs are available on this day
          </p>
        </div>
      )}
    </>
  );
};

export default TechSchedual;
