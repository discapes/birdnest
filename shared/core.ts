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
  deleteTimer?: NodeJS.Timeout; // timer for deleting itself after 10 minutes, removed by JSON replacer, remade on client
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
      clearTimeout(existingEntry.deleteTimer);
      distance = Math.min(existingEntry.distance, distance);
      // we persist the closest distance
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

// preserves maps, throws away NodeJS.Timeout, so we can send the records and snapshots to the client
export function JSONReplacer(key: string, value: any) {
  if (value?.constructor?.name === "Timeout") return undefined;
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

export function JSONReviver(key: string, value: any) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  } else if (typeof value === "string" && isIsoDate(value)) {
    return new Date(value);
  }
  return value;
}

function isIsoDate(value: string) {
  return /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/.exec(
    value
  );
}
