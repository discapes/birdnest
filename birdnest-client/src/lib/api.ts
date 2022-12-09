import {
  JSONReviver,
  type OffenderRecords,
  type Snapshot,
} from "../../../shared/core.js";
declare var __SERVER_URL__: string;

export async function getSnapshot(): Promise<Snapshot> {
  return await fetch(__SERVER_URL__ + "/snapshot.json")
    .then((res) => res.text())
    .then((res) => JSON.parse(res, JSONReviver));
}

export async function getOffenders(): Promise<OffenderRecords> {
  return await fetch(__SERVER_URL__ + "/history.json")
    .then((res) => res.text())
    .then((res) => JSON.parse(res, JSONReviver));
}
