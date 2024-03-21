export type GraphType = {
  // status: string;
  // startedAt: number;
  // lastStartedAt: number;
  // totalSecondsSpentSoFar: number;
  actionDate: number;
  address: string;
  driver: {
    firstName: string;
    id: string;
    lastName: string;
  };
  geoLocation?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  engineHours: number;
  lastStartedAt: number;
  odoMeterMillage: number;
  odoMeterSpeed: number;
  actionType:string;
  startedAt: number;
  updated:any;
  status: string;
  totalSecondsSpentSoFar: number;
  vehicleManualId: string;
  eventType:string
};
