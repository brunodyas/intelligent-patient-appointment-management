import { DateTime } from 'luxon';
import { getFranchise } from './getFranchise';

export function timeAgo(createdAt: string) {
  const { franchise } = getFranchise()

  const date = DateTime.fromISO(createdAt).setZone(franchise.franchise_timezone);
  const now = DateTime.now().setZone(franchise.franchise_timezone);
  const diffInDays = now.diff(date, 'days').days;

  if (diffInDays < 1) {
    const diffInSeconds = now.diff(date, 'seconds').seconds;
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else {
      return date.toRelative();
    }
  } else {
    return date.toFormat('h:mma dd LLL yyyy');
  }
}
