import { xml2js } from "xml-js";
import type { Drone, User } from "../../shared/core.js";
import axios from "axios";

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
  const xml = await axios
    .get(DRONES_ENDPOINT)
    .then((res) => res.data)
    .catch((e) => null);
  if (xml == null) return [];
  const result = <XMLResult>xml2js(xml, { compact: true });
  return result.report.capture.drone.map((drone) => removeXMLArtifacts(drone));
}

// :) we don't want to stress the endpoint
let userDataCache = new Map<Drone["serialNumber"], User | null>();

export async function getUserData(
  serialNumber: Drone["serialNumber"]
): Promise<User | null> {
  if (userDataCache.has(serialNumber)) return userDataCache.get(serialNumber)!;

  const user = <User | null>await axios
    .get(`${PILOTS_ENDPOINT}${serialNumber}`)
    .then((res) => {
      if (res.status === 404) {
        console.log(`Not found: ${PILOTS_ENDPOINT}${serialNumber}`);
        return null;
      } else return res.data;
    })
    .catch((e) => null);
  if (userDataCache.size > 100) userDataCache.clear();
  userDataCache.set(serialNumber, user);
  return user;
}

// replaces { key: { _text: "foo" } } with { key: "foo" }
function removeXMLArtifacts(xmlDrone: XMLDrone): Drone {
  return <Drone>(
    Object.fromEntries(
      Object.entries(xmlDrone).map(([key, value]) => [key, value._text])
    )
  );
}
