import http from "node:http";
import { xml2js } from "xml-js";
import fetch from "node-fetch";
const hostname = "127.0.0.1";
const port = 3000;
// replace key: { _text: "foo" } with key: "foo"
function removeXMLArtifacts(xmlDrone) {
    return (Object.fromEntries(Object.entries(xmlDrone).map(([key, value]) => [key, value._text])));
}
const server = http.createServer(async (req, res) => {
    const xml = await fetch("https://assignments.reaktor.com/birdnest/drones").then((res) => res.text());
    const result = xml2js(xml, { compact: true });
    const drones = result.report.capture.drone.map((drone) => removeXMLArtifacts(drone));
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(JSON.stringify(drones, null, 2));
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
//# sourceMappingURL=main.js.map