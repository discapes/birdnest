<script lang="ts">
  import type { OffenderRecords } from "../../shared/core";

  export let records: OffenderRecords;
</script>

<div class="h-[500px] overflow-y-auto border-white border-y">
  <table>
    <tr class="h-5">
      <th>Name</th>
      <th>Email</th>
      <th>Phone</th>
      <th>Dist.</th>
    </tr>
    {#each Array.from(records.values()).reverse() as rec}
      <tr>
        <td>{rec.userData?.firstName + " " + rec.userData?.lastName}</td>
        <td>{rec.userData?.email}</td>
        <td>{rec.userData?.phoneNumber}</td>
        <td>{rec.distance.toFixed()}</td>
      </tr>
    {/each}
  </table>
</div>

<style>
  table tr td,
  table tr th {
    border: 1px solid white;
    padding: 10px;
  }
  table tr th {
    border-top: 0px;
  }
  table tr:last-child td {
    border-bottom: 0px;
  }
</style>
