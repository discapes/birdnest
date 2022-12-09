import https from "node:https";
import http from "node:http";
import {
  OffenderRecords,
  POLL_SECONDS,
  Snapshot,
  updateRecordsFromSnapshot,
} from "../../shared/core.js";
import { getDrones, getUserData } from "./api.js";
import { distanceFromNest, droneInNDZ } from "../../shared/math.js";
import { readFileSync } from "fs";

const hostname = "0.0.0.0";
const port = 8443;

// check /shared/core for more info on the architecture

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

let offendersBySN: OffenderRecords = new Map();
let latestSnapshot: Snapshot;

setInterval(async () => {
  latestSnapshot = await createSnapshot();
  offendersBySN = updateRecordsFromSnapshot(latestSnapshot, offendersBySN);
}, POLL_SECONDS * 1000);

async function handler(
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>
) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN || "*");
  if (req.method == "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Max-Age", "3600");
    res.setHeader("Access-Control-Allow-Private-Network", "true");
    res.statusCode = 200;
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");

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
}

let sslOptions: null | { key: Buffer; cert: Buffer } = null;
try {
  sslOptions = {
    key: readFileSync("key.pem"),
    cert: readFileSync("cert.pem"),
  };
} catch (e) {
  console.log("Couldn't read key.pem or cert.pem, falling back to http");
}

const server = sslOptions
  ? https.createServer(sslOptions, handler)
  : http.createServer(handler);

server.listen(port, hostname, () => {
  console.log(
    `Server running at ${sslOptions ? "https" : "http"}://${hostname}:${port}/`
  );
});

// preserves maps, throws away NodeJS.Timeout, so we can send the records and snapshots to the client
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
