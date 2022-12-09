export const NEST_POSITION = { x: 250, y: 250 };
export const OFFENDER_RETENTION_MINUTES = 10;
export const POLL_SECONDS = 2;

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

/*
The realtime drone and user data from the endpoint are compiled into a Snapshot every two seconds,
which clients poll from the server at the same interval. 

The records of offenders in the last 10 minutes are kept in a
Map<Drone["serialNumber"], OffenderRecord> that's sent to clients
only once when they connect.

Each time after getting a snapshot, both the client and server keep updating their own OffenderRecords
with updateRecordsFromSnapshot(). This is cheap as the server doesn't need to send each 
offenders' data every time. It's also convenient to have the same data structure on both sides.

NOTE, for an app of this scale we don't have data retention on disk, so it's all memory.
*/

export type Snapshot = {
  drones: Drone[];
  badUserDataBySN: Map<Drone["serialNumber"], User | null>;
  badDistancesBySN: Map<Drone["serialNumber"], number>;
};

export type OffenderRecord = {
  userData: User | null;
  distance: number;
  deleteTimer?: NodeJS.Timeout; // this is removed for transport
  deleteDate: Date;
};

export type OffenderRecords = Map<Drone["serialNumber"], OffenderRecord>;

// runs on both client and server
// from the snapshot just fetched, we can update the offender records and return them
// also adds a timer to delete expired records
export function updateRecordsFromSnapshot(
  snapshot: Snapshot,
  offendersBySN: OffenderRecords
): OffenderRecords {
  snapshot.badUserDataBySN.forEach((userData, sn) => {
    let distance = snapshot.badDistancesBySN.get(sn) || NaN;

    const existingEntry = offendersBySN.get(sn);
    if (existingEntry) {
      // we persist the closest distance
      clearTimeout(existingEntry.deleteTimer);
      distance = Math.min(existingEntry.distance, distance);
    }

    const deleteTimer = setTimeout(
      () => offendersBySN.delete(sn),
      OFFENDER_RETENTION_MINUTES * 60 * 1000
    );
    const deleteDate = new Date(
      Date.now() + OFFENDER_RETENTION_MINUTES * 60 * 1000
    );
    offendersBySN.set(sn, { distance, userData, deleteTimer, deleteDate });
  });
  return offendersBySN;
}
