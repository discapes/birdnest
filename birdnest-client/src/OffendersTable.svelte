<script lang="ts">
  import type { OffenderRecords } from "../../shared/core";

  export let records: OffenderRecords;
</script>

<table class="border border-white h-[500px]">
  <tr class="h-5">
    <th>Name</th>
    <th>Email</th>
    <th>Phone</th>
    <th>Dist</th>
  </tr>
  {#each Array.from(records.values()) as rec}
    <tr>
      <td>{rec.userData?.firstName + " " + rec.userData?.lastName}</td>
      <td>{rec.userData?.email}</td>
      <td>{rec.userData?.phoneNumber}</td>
      <td>{rec.distance.toFixed()}</td>
    </tr>
  {/each}
</table>
