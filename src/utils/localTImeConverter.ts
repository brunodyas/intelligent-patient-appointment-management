import moment from "moment-timezone";
import { getFranchise } from "./getFranchise";

const convertToLocalTimeToShift = (
  date: any,
  timeString: any,
  timezone: any,
  startTime: any = ""
) => {
  const { franchise } = getFranchise();
  let datetimeWithTimezone = moment.tz(
    `${date.format("YYYY-MM-DD")} ${timeString}`,
    "YYYY-MM-DD HH:mm",
    timezone
  );

  const localTime = datetimeWithTimezone
    .clone()
    .tz(franchise.franchise_timezone);
  let adjustedLocalTime = localTime;
  let formatDate = adjustedLocalTime.format("YYYY-MM-DD HH:mm");

  if (startTime && moment(formatDate).isBefore(startTime)) {
    adjustedLocalTime = datetimeWithTimezone
      .add(1, "day")
      .clone()
      .tz(franchise.franchise_timezone);
    formatDate = adjustedLocalTime.format("YYYY-MM-DD HH:mm");
  }
  return formatDate;
};

export default convertToLocalTimeToShift;
