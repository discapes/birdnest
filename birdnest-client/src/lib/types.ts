export type Drone = {
  serialNumber: string;
  model: string;
  manufacturer: string;
  mac: string;
  ipv4: string;
  ipv6: string;
  firmware: string;
  positionY: string;
  positionX: string;
  altitude: string;
};
export type User = {
  pilotId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdDt: string;
  email: string;
};

// polled by clients for realtime data
export type Snapshot = {
  drones: Drone[];
  badUserDataBySN: Map<Drone["serialNumber"], User>;
  badDistancesBySN: Map<Drone["serialNumber"], number>;
};

// fetched at launch by client, retained for OFFENDER_RETENTION_MINUTES
// NOTE, for an app of this scale we don't have data retention on disk
export type OffenderRecord = {
  userData: User;
  distance: number;
  deleteTimer: NodeJS.Timeout;
};
