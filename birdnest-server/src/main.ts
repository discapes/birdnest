import http from "node:http";
import { xml2js } from "xml-js";
import fetch from "node-fetch";

const hostname = "127.0.0.1";
const port = 3000;

type Drone = {
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
type User = {
  pilotId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdDt: string;
  email: string;
};

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

// replace key: { _text: "foo" } with key: "foo"
function removeXMLArtifacts(xmlDrone: XMLDrone): Drone {
  return <Drone>(
    Object.fromEntries(
      Object.entries(xmlDrone).map(([key, value]) => [key, value._text])
    )
  );
}

let rulebreakers = new Map<User["pilotId"], User>();
let drones: Drone[] = [];

async function getRulebreakers() {
  const xml = await fetch(
    "https://assignments.reaktor.com/birdnest/drones"
  ).then((res) => res.text());
  const result = <XMLResult>xml2js(xml, { compact: true });
  drones = result.report.capture.drone.map((drone) =>
    removeXMLArtifacts(drone)
  );

  const badDrones = drones.filter((d) => nestDistance(d) < 100);
  const badUsers = <User[]>await Promise.all(
    badDrones.map(async (d) => {
      const userData = <User>(
        await fetch(
          `https://assignments.reaktor.com/birdnest/pilots/${d.serialNumber}`
        ).then((res) => res.json())
      );
      return {
        ...userData,
        dist: nestDistance(d),
      };
    })
  );
  rulebreakers.clear();
  badUsers.forEach((u) => rulebreakers.set(u.pilotId, u));
}

function nestDistance(d: Drone) {
  return Math.sqrt(
    (+d.positionX / 1000 - 250) ** 2 + (+d.positionY / 1000 - 250) ** 2
  );
}

setInterval(getRulebreakers, 2000);

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  switch (req.url) {
    case "/drones":
      res.end(JSON.stringify(drones));
      break;
    case "/rulebreakers":
      res.end(JSON.stringify([...rulebreakers.values()]));
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
