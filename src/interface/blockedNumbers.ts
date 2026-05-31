import { Option } from "./manufacturers";

export interface ListBlockedResponse {
    results?: any;
    count: number;
    previous?: number | null;
    next?: number | string | null;
}

export type BlockedData = {
    number: string, //requires country code
    notes?: string
}