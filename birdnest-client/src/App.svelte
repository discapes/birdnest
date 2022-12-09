<script lang="ts">
  import { onMount } from "svelte";
  import {
    POLL_SECONDS,
    updateRecordsFromSnapshot,
    type OffenderRecords,
    type Snapshot,
  } from "../../shared/core";
  import DroneMap from "./DroneMap.svelte";
  import { getSnapshot } from "./lib/api";
  import OffendersTable from "./OffendersTable.svelte";

  let offendersBySN: OffenderRecords = new Map();
  let latestSnapshot: Snapshot;

  onMount(async () => {
    const poll = async () => {
      latestSnapshot = await getSnapshot();
      offendersBySN = updateRecordsFromSnapshot(latestSnapshot, offendersBySN);
    };
    setInterval(poll, POLL_SECONDS * 1000);
    poll();
  });
</script>

<main class="flex gap-10 justify-center w-full m-10 border border-white p-10">
  {#if latestSnapshot}
    <DroneMap snapshot={latestSnapshot} />
  {/if}
  {#if offendersBySN}
    <OffendersTable records={offendersBySN} />
  {/if}
</main>

<style>
  @tailwind base;
  @tailwind utilities;
</style>
