export interface Delivery {
  id?: string;
  address: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  destinataireName: string;
  fee?: number;
}