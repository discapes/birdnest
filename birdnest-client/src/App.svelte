<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    POLL_SECONDS,
    updateRecordsFromSnapshot,
    type OffenderRecords,
    type Snapshot,
  } from "../../shared/core";
  import DroneMap from "./DroneMap.svelte";
  import { getOffenders, getSnapshot } from "./lib/api";
  import OffendersTable from "./OffendersTable.svelte";

  let offendersBySN: OffenderRecords;
  let latestSnapshot: Snapshot;
  let pollInterval: NodeJS.Timer;

  // initialize the 10-min records and start polling
  Promise.all([getOffenders(), getSnapshot()]).then(
    ([_offendersBySN, _snapshot]) => {
      latestSnapshot = _snapshot;
      offendersBySN = _offendersBySN;
      // we need to set the record expiration timers again as they can't be transported
      offendersBySN.forEach((rec, sn) => {
        rec.deleteTimer = setTimeout(
          () => offendersBySN.delete(sn),
          rec.deleteDate.getTime() - Date.now()
        );
      });

      pollInterval = setInterval(async () => {
        latestSnapshot = await getSnapshot();
        offendersBySN = updateRecordsFromSnapshot(
          latestSnapshot,
          offendersBySN
        );
      }, POLL_SECONDS / 2);
    }
  );

  onDestroy(() => {
    clearInterval(pollInterval);
  });
</script>

<div class="overflow-auto p-10">
  <main
    class="inline-flex flex-wrap min-w-full gap-10 justify-center border border-white p-10">
    <div>
      <p class="w-[500px] h-[50px] mb-1">
        Last names are shown only for drones in the No Drone Zone (NDZ) around
        the green nest. Only serial numbers are visible for others.
      </p>
      {#if latestSnapshot}
        <DroneMap snapshot={latestSnapshot} />
      {/if}
    </div>
    <div>
      <p class="mb-1 h-[50px] flex flex-col justify-center">
        Violators of the NDZ in the past 10 minutes with their closest
        distances:
      </p>
      {#if offendersBySN}
        <OffendersTable records={offendersBySN} />
      {/if}
    </div>
  </main>
</div>

<style>
  @tailwind base;
  @tailwind utilities;
</style>
