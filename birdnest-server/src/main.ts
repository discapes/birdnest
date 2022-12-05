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

const server = http.createServer(async (req, res) => {
  const xml = await fetch(
    "https://assignments.reaktor.com/birdnest/drones"
  ).then((res) => res.text());
  const result = <XMLResult>xml2js(xml, { compact: true });
  const drones = result.report.capture.drone.map((drone) =>
    removeXMLArtifacts(drone)
  );

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(drones, null, 2));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
