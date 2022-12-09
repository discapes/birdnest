<script lang="ts">
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

      setInterval(async () => {
        latestSnapshot = await getSnapshot();
        offendersBySN = updateRecordsFromSnapshot(
          latestSnapshot,
          offendersBySN
        );
      }, POLL_SECONDS * 750); // 750 instead of a 1000 so we get all data points regardless of latency
    }
  );
</script>

<div class="overflow-auto p-10">
  <main
    class="inline-flex flex-wrap min-w-full gap-10 justify-center border border-white p-10">
    {#if latestSnapshot}
      <DroneMap snapshot={latestSnapshot} />
    {/if}
    {#if offendersBySN}
      <OffendersTable records={offendersBySN} />
    {/if}
  </main>
</div>

<style>
  @tailwind base;
  @tailwind utilities;
</style>
