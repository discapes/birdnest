import http from "node:http";
import { getDrones, getUserData } from "./api";
import { distanceFromNest, droneInNDZ } from "./math";
import { Drone, User } from "./types";

const hostname = "127.0.0.1";
const port = 3000;
export const NEST_POSITION = { x: 250, y: 250 };
const OFFENDER_RETENTION_MINUTES = 10;
const POLL_SECONDS = 2;

type Snapshot = {
  drones: Drone[];
  badUserDataBySN: Map<Drone["serialNumber"], User>;
  badDistancesBySN: Map<Drone["serialNumber"], number>;
};

type OffenderRecord = {
  userData: User;
  distance: number;
  deleteTimer: NodeJS.Timeout;
};

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

function updateRecordsFromSnapshot(
  snapshot: Snapshot,
  offendersBySN: Map<Drone["serialNumber"], OffenderRecord>
) {
  snapshot.badUserDataBySN.forEach((userData, sn) => {
    let distance = latestSnapshot.badDistancesBySN.get(sn);

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

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  switch (req.url) {
    case "/snapshot":
      res.statusCode = 200;
      res.end(JSON.stringify(latestSnapshot, JSONMapReplacer));
      break;
    case "/history":
      res.statusCode = 200;
      res.end(JSON.stringify(offendersBySN, JSONMapReplacer));
      break;
    default:
      res.statusCode = 400;
      res.end();
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function JSONMapReplacer() {}

function JSONMapReviver() {}
