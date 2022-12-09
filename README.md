# Birdnest

This project is for a [Reaktor pre-assignment](https://assignments.reaktor.com/birdnest).

You can see it deployed [here](https://birdnest-topaz.vercel.app/).

This project consists of a frontend made with Svelte (a framework similar to React) and a node.js backend with dependencies on `xml-js` and `axios`. There is some shared code in the `shared` folder.

![screenshot](https://i.imgur.com/oKuOLr2.png)

### Developing locally

In both `birdnest-client/` and `birdnest-server/`, run `npm install` and `npm run dev`. The server automatically uses https if it sees a `cert.pem` and a `key.pem` in it's folder.

### Deployment

You can host the backend on any cloud provider with node 16. Set the environment variable `ALLOW_ORIGIN` to set CORS restrictions (default is "\*").

The frontend can also be deployed to platforms like Vercel or Cloudflare pages. Set the environment variable `SERVER_URL` to specify the server address and port.

### About the architecture

from `shared/core.ts`:

> The realtime drone and offenders' user data from the endpoint are compiled into a `Snapshot` every two seconds,
> which clients poll from the server at the almost the same interval.

> The records of offenders in the last 10 minutes are kept in a
> `Map<Drone["serialNumber"], OffenderRecord>` that's sent to clients when they connect.

> Each time after getting a snapshot, both the client and server keep updating their own OffenderRecords map
> with the shared function `updateRecordsFromSnapshot()`. This is cheap as the server doesn't need to send each
> offenders' data every time. It's also convenient to have the same data structures on both sides.

> NOTE, for an app of this scale we don't have data retention on disk, so it's all in memory.
