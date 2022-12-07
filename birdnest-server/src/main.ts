import http from "node:http";
import { getDrones, getUserData } from "./api.js";
import { distanceFromNest, droneInNDZ } from "./math.js";
import { Drone, User } from "./types.js";

const hostname = "127.0.0.1";
const port = 3000;
export const NEST_POSITION = { x: 250, y: 250 };
const OFFENDER_RETENTION_MINUTES = 10;
const POLL_SECONDS = 2;

// polled by clients for realtime data
type Snapshot = {
  drones: Drone[];
  badUserDataBySN: Map<Drone["serialNumber"], User>;
  badDistancesBySN: Map<Drone["serialNumber"], number>;
};

// fetched at launch by client, retained for OFFENDER_RETENTION_MINUTES
// NOTE, for an app of this scale we don't have data retention on disk
type OffenderRecord = {
  userData: User;
  distance: number;
  deleteTimer: NodeJS.Timeout;
};

// We create this snapshot every POLL_SECONDS to get up to date info
async function createSnapshot(): Promise<Snapshot> {
  const drones = await getDrones();
  const badDrones = drones.filter(droneInNDZ);
  const badDistancesBySN = new Map(
    badDrones.map((d) => [d.serialNumber, distanceFromNest(d)])
  );
  const badUserDataBySNPromises = badDrones.map((d) =>
    getUserData(d.serialNumber).then((ud) => [d.serialNumber, ud] as const)
  );
  const badUserDataBySN = new Map(await Promise.all(badUserDataBySNPromises));

  return {
    drones,
    badUserDataBySN,
    badDistancesBySN,
  };
}

// from the snapshot just fetched, we can update the offender records
function updateRecordsFromSnapshot(
  snapshot: Snapshot,
  offendersBySN: Map<Drone["serialNumber"], OffenderRecord>
) {
  snapshot.badUserDataBySN.forEach((userData, sn) => {
    let distance = latestSnapshot.badDistancesBySN.get(sn) || NaN;

    const existingEntry = offendersBySN.get(sn);
    if (existingEntry) {
      clearTimeout(existingEntry.deleteTimer);
      distance = Math.max(existingEntry.distance, distance);
    }

    const deleteTimer = setTimeout(
      () => offendersBySN.delete(sn),
      OFFENDER_RETENTION_MINUTES * 60 * 1000
    );
    offendersBySN.set(sn, { distance, userData, deleteTimer });
  });
}

let offendersBySN = new Map<Drone["serialNumber"], OffenderRecord>();
let latestSnapshot: Snapshot;

setInterval(async () => {
  latestSnapshot = await createSnapshot();
  updateRecordsFromSnapshot(latestSnapshot, offendersBySN);
}, POLL_SECONDS * 1000);

// TODO switch to HTTPS
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  switch (req.url) {
    case "/snapshot.json":
      res.statusCode = 200;
      res.end(JSON.stringify(latestSnapshot, JSONReplacer));
      break;
    case "/history.json":
      res.statusCode = 200;
      res.end(JSON.stringify(offendersBySN, JSONReplacer));
      break;
    default:
      res.statusCode = 404;
      res.end();
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// preserves maps, throws away NodeJS.Timeout
// kind of a hack, but copying server objects to client objects would be more cumbersome
function JSONReplacer(key: string, value: any) {
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
