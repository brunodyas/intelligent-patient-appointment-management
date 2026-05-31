import { DateTime } from "luxon";

export function convertUtcToLocalTime(timeInput: string) {
  const [timePart, offsetPart] = timeInput.split(" ");

  if (offsetPart === "UTC") {
    const format = DateTime.fromFormat(timePart, "HH:mm:ss").isValid ? "HH:mm:ss" : "HH:mm";

    let shiftTime = DateTime.fromFormat(`${timePart} UTC`, `${format} 'UTC'`, {
      zone: "UTC",
    });

    if (!shiftTime.isValid) {
      console.error(`Invalid time format: ${shiftTime.invalidExplanation}`);
      return null;
    }

    shiftTime = shiftTime.setZone(DateTime.local().zoneName);
    return shiftTime.toLocaleString(DateTime.TIME_24_SIMPLE);
  } else {
    return null;
  }
}

export function convertLocalTimeToUtc(timeInput: string) {
  const localZone = DateTime.local().zoneName;

  let localTime = DateTime.fromFormat(timeInput, "HH:mm", { zone: localZone });

  if (!localTime.isValid) {
    console.error(`Invalid time format: ${localTime.invalidExplanation}`);
    return null;
  }

  let utcTime = localTime.setZone("UTC");

  return `${utcTime.toFormat("HH:mm")} UTC`;
}