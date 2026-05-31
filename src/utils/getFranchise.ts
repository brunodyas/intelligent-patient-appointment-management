import { JWT } from "@/constants/enums/enums";
import { parseCookies } from "nookies";
import { DateTime } from "luxon";

export const getFranchise = () => {
  const cookies = parseCookies();
  const cookieValue = cookies[JWT];
  const franchise = cookieValue ? JSON.parse(cookieValue) : null;

  const localTimezone = DateTime.local().zoneName;

  return {
    franchise: franchise?.franchise_timezone
      ? franchise
      : { ...franchise, franchise_timezone: localTimezone },
  };
};
