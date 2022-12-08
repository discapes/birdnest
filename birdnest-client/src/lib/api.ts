import type { OffenderRecords, Snapshot } from "../../../shared/core.js";
declare var __SERVER_URL__: string;

export async function getSnapshot(): Promise<Snapshot> {
  return await fetch(__SERVER_URL__ + "/snapshot.json")
    .then((res) => res.text())
    .then((res) => JSON.parse(res, JSONMapReviver));
}

export async function getOffenders(): Promise<OffenderRecords> {
  return await fetch(__SERVER_URL__ + "/history.json")
    .then((res) => res.text())
    .then((res) => JSON.parse(res, JSONMapReviver));
}

export function JSONMapReviver(key: string, value: any) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}
