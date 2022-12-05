<script lang="ts">
  import { onMount } from "svelte";
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

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let data: Drone[] | undefined;
  let rulebreakers: User[] | undefined;

  async function getData() {
    data = <Drone[]>(
      await fetch("http://127.0.0.1:3000/drones").then((res) => res.json())
    );
    rulebreakers = <User[]>(
      await fetch("http://127.0.0.1:3000/rulebreakers").then((res) =>
        res.json()
      )
    );
    canvas.width = 500;
    canvas.height = 500;

    ctx.clearRect(0, 0, 500, 500);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(250, 250, 100, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.font = "30px arial";
    ctx.fillText("NDZ", 250 - 25, 250 + 10);

    ctx.fillStyle = "white";
    ctx.font = "14px arial";
    data.forEach((drone) => {
      ctx.fillRect(
        +drone.positionX / 1000 - 2,
        +drone.positionY / 1000 - 2,
        4,
        4
      );
      ctx.fillText(
        drone.serialNumber,
        +drone.positionX / 1000 + 10,
        +drone.positionY / 1000
      );
    });
  }

  onMount(() => {
    ctx = canvas.getContext("2d");
    getData();
    setInterval(getData, 2000);
  });
</script>

<main class="flex gap-10 justify-center w-full m-10 border border-white p-10">
  {#if rulebreakers}
    <table class="border border-white w-[500px] h-[500px]">
      <tr class="h-5">
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Dist</th>
      </tr>
      {#each rulebreakers as rb}
        <tr>
          <td>{rb.firstName + " " + rb.lastName}</td>
          <td>{rb.email}</td>
          <td>{rb.phoneNumber}</td>
          <td>{rb.dist.toFixed()}</td>
        </tr>
      {/each}
    </table>
  {/if}
  <canvas
    class="border-white border w-[500px] h-[500px]"
    width="500"
    height="500"
    bind:this={canvas} />
</main>

<style>
  @tailwind base;
  @tailwind utilities;

  table tr td,
  table tr th {
    border: 1px solid white;
    padding: 10px;
  }
</style>
