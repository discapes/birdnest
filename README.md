# Birdnest

[For the reaktor pre-assignment](https://assignments.reaktor.com/birdnest)

This project consists of a frontend made with Svelte (a framework similar to React) and a node.js backend with dependencies on `xml-js` and `axios`. There is some shared code in the `shared` folder.

![screenshot](https://i.imgur.com/oKuOLr2.png)

### Develop locally

In both `birdnest-client/` and `birdnest-server/`, run `npm install` and `npm run dev`.

### About the architecture

from `shared/core.ts`:

> The realtime drone and offenders' user data from the endpoint are compiled into a `Snapshot` every two seconds,
> which clients poll from the server at the same interval.

> The records of offenders in the last 10 minutes are kept in a
> `Map<Drone["serialNumber"], OffenderRecord>` that's sent to clients when they connect.

> Each time after getting a snapshot, both the client and server keep updating their own OffenderRecords map
> with the shared function `updateRecordsFromSnapshot()`. This is cheap as the server doesn't need to send each
> offenders' data every time. It's also convenient to have the same data structures on both sides.

> NOTE, for an app of this scale we don't have data retention on disk, so it's all in memory.
