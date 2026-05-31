import { useCalendarGrid, useLocale } from "react-aria";
import { getWeeksInMonth } from "@internationalized/date";
import { CalendarCell } from "./CalendarCell";

export function CalendarGrid({ state, handleSetNewDate, ...props }) {
  let { locale } = useLocale();
  let { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

  // Get the number of weeks in the month so we can render the proper number of rows.
  let weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

  return (
    <div className="sm:px-4 px-2 w-full pb-5">
      <table {...gridProps} cellPadding="0" className="flex-1 w-full">
        <thead {...headerProps} className="text-gray-600">
          <tr>
            {weekDays.map((day, index) => (
              <th className="text-center text-sm" key={index}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
            <tr key={weekIndex}>
              {state
                .getDatesInWeek(weekIndex)
                .map((date, i) =>
                  date ? (
                    <CalendarCell key={i} state={state} date={date} onClick={() => handleSetNewDate(date)} />
                  ) : (
                    <td key={i} className="text-sm" />
                  )
                )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
