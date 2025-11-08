import { AcceptanceType } from "./enum/acceptance.enum";

export interface Acceptance {
    acceptanceToken: string;
    permalink?: string;
    type?: AcceptanceType;
}