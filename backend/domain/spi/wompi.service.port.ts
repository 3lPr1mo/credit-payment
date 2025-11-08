import { Acceptance } from "domain/model/acceptance.model";

export interface WompiServicePort {
    getAcceptances(): Promise<Acceptance[]>
}