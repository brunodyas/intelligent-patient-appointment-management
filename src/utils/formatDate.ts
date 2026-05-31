import { DateTime, Duration } from "luxon";
import { getFranchise } from "./getFranchise";
import moment from "moment";


const formatDateCallCenter = (dateString: string) => {
  const date: Date = new Date(dateString)
  const day: string = date.getDate().toString().padStart(2, '0');
  const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
  const year: number = date.getFullYear();
  const hours: string = date.getHours().toString().padStart(2, '0');
  const hoursNum: number = date.getHours()
  const minutes: string = date.getMinutes().toString().padStart(2, '0');

  return `${month}/${day}/${year} ${hoursNum <= 12 ? hours : hoursNum - 12}:${minutes} ${hoursNum < 12 ? "AM" : "PM"}`;
}

const formatDate = (dateString: string) => {
  if(!dateString) return null;
  const { franchise } = getFranchise();

  const date = DateTime.fromISO(dateString, { zone: 'utc' });
  const localTime = franchise?.franchise_timezone ? date.setZone(franchise.franchise_timezone) : date.toLocal();
  
  return localTime.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
};


export const formatUnixTimestamp = (timestamp: number) => {
  if (!timestamp) return null;
  const { franchise } = getFranchise();

  const date = DateTime.fromMillis(timestamp * 1000, { zone: 'utc' });
  const localTime = franchise?.franchise_timezone 
    ? date.setZone(franchise.franchise_timezone) 
    : date.toLocal();

  return localTime.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
};

export const formatDateWithTime = (value: string, startTime: string) => {
  if (value === null) {
    return value;
  }

  const formattedDate = `${moment(value).format("YYYY-MM-DD")}T${startTime}`;
  return formatSmallDate(formattedDate);
};

export const formatSmallDate = (dateString: string) => {
  const { franchise } = getFranchise();

  const date = DateTime.fromISO(dateString, { zone: 'utc' });
  const localTime = franchise?.franchise_timezone 
    ? date.setZone(franchise.franchise_timezone) 
    : date.toLocal();
  
  return localTime.toLocaleString(DateTime.DATE_SHORT);
};

export default formatDate


// export const formatDateWithAt = (date: string) => {
//   const dateToBeFormat = DateTime.fromISO(date, { zone: "utc" }).setZone(
//     "local"
//   );
//   return dateToBeFormat.toFormat("dd LLLL yyyy 'at' HH:mm");

export const formatDateForFranchiseUser = (dateString: string) => {
  const { franchise } = getFranchise();

  const date = DateTime.fromISO(dateString, { zone: 'utc' });
  const localTime = franchise?.franchise_timezone ? date.setZone(franchise.franchise_timezone) : date.toLocal();
  
  return localTime.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
};

export const formaPreviousTime  = (time: string) => {
  const [hours, minutes, seconds] = time.split(":");

  let hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  hour = hour ? hour : 12;

  return `${hour}:${minutes} ${ampm}`;

};

export const formatTime = (time: string, originalTimeZone: string) => {
  const { franchise } = getFranchise();


  const [hours, minutes, seconds] = time.split(":");
  let date = DateTime.fromObject(
    { hour: parseInt(hours), minute: parseInt(minutes), second: parseInt(seconds) },
    { zone: originalTimeZone }
  );

  if (franchise?.franchise_timezone) {
    date = date.setZone(franchise.franchise_timezone);
  } else {
    date = date.toLocal();
  }

  const hour = date.hour % 12 || 12;
  const ampm = date.hour >= 12 ? "PM" : "AM";

  return `${hour}:${date.minute.toString().padStart(2, '0')} ${ampm}`;
};

export const formatDuration = (minutes: number) => {
  const duration = Duration.fromObject({ minutes });
  const hours = Math.floor(duration.as('hours'));
  const mins = duration.minutes;

  return `${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ` : ''} ${mins > 0 ? `${mins} min${mins > 1 ? 's' : ''}` : ''}`;
};

export const dueDate = (date: string, originalTimeZone: string) => {
  const { franchise } = getFranchise();

  if (!date || !originalTimeZone || !franchise.franchise_timezone) {
    return ''; 
  }

  let dueDate = DateTime.fromFormat(date, 'MM-dd-yyyy', { zone: originalTimeZone });

  if (!dueDate.isValid) {
    dueDate = DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: originalTimeZone });
  }

  const convertedDueDate = dueDate.setZone(franchise.franchise_timezone);
  return convertedDueDate.toFormat('MM-dd-yyyy');
}

export const convertLocalToUTC = (localDateString: string) => {
  const { franchise } = getFranchise();
  
  const localDate = DateTime.fromISO(localDateString, { zone: franchise?.franchise_timezone || 'local' });
  const utcTime = localDate.setZone('utc');
  
  return utcTime.toFormat('MM-dd-yyyy, HH:mm');

};