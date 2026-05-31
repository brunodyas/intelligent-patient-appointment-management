import formatDate, { formatDateWithTime, formatSmallDate, formatTime } from "./formatDate";

export const formatData = (value: any, type: string, item: any): string => {
  switch (type) {
    case 'date':
      if (value === null) {
        return value;
      }
      return formatSmallDate(value);
    case 'OnlyDate':
      if (value === null) {
        return value;
      }
      return formatDateWithTime(value, item?.start_time);
    case 'dateTime':
      if (value === null) {
        return value;
      }
      return formatDate(value) ?? '';
    case 'time':
      if (value === null) {
        return value;
      }
      return formatTime(value, item?.added_by?.franchise_timezone)
    case 'string':
    default:
      return value;
  }
};

export const formatURL = (url: string) => {
  url = url.replace(/^https?:\/\//i, '');

  if (!/^www\./i.test(url)) {
    url = `www.${url}`;
  }

  return `https://${url}`;
};

export const formatPhoneNum = (number: string | null) => {
  if (number) return `+1${number}`

  return ''
}


