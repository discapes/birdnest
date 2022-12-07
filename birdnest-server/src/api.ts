import fetch from "node-fetch";
import { xml2js } from "xml-js";
import type { Drone, User } from "./types";

export const DRONES_ENDPOINT =
  "https://assignments.reaktor.com/birdnest/drones";
export const PILOTS_ENDPOINT =
  "https://assignments.reaktor.com/birdnest/pilots/";

type XMLDrone = {
  [Prop in keyof Drone]: {
    _text: string;
  };
};

type XMLResult = {
  report: {
    capture: {
      drone: XMLDrone[];
    };
  };
};

export async function getDrones(): Promise<Drone[]> {
  const xml = await fetch(DRONES_ENDPOINT).then((res) => res.text());
  const result = <XMLResult>xml2js(xml, { compact: true });
  return result.report.capture.drone.map((drone) => removeXMLArtifacts(drone));
}

export async function getUserData(
  serialNumber: Drone["serialNumber"]
): Promise<User> {
  return <User>(
    await fetch(`${PILOTS_ENDPOINT}${serialNumber}`).then((res) => res.json())
  );
}

// replace key: { _text: "foo" } with key: "foo"
function removeXMLArtifacts(xmlDrone: XMLDrone): Drone {
  return <Drone>(
    Object.fromEntries(
      Object.entries(xmlDrone).map(([key, value]) => [key, value._text])
    )
  );
}
