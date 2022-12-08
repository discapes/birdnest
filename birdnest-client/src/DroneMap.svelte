<script lang="ts">
  import { onMount } from "svelte";
  import type { Snapshot } from "../../shared/core";

  export let snapshot: Snapshot;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  onMount(() => {
    ctx = canvas.getContext("2d")!;
    render(snapshot);
  });

  $: render(snapshot); // this is reactive

  function render(snapshot: Snapshot) {
    if (!canvas || !ctx) return;
    canvas.width = 500;
    canvas.height = 500;

    ctx.clearRect(0, 0, 500, 500);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(250, 250, 100, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.font = "15px arial";
    ctx.fillRect(250 - 5, 250 - 5, 10, 10);
    ctx.fillText("NDZ", 250, 250 - 10);

    ctx.fillStyle = "white";
    ctx.font = "14px arial";
    snapshot.drones.forEach((drone) => {
      ctx.fillRect(
        +drone.positionX / 1000 - 2,
        +drone.positionY / 1000 - 2,
        4,
        4
      );
      ctx.beginPath();
      ctx.moveTo(+drone.positionX / 1000, +drone.positionY / 1000);
      ctx.lineTo(250, 250);
      ctx.stroke();
      ctx.fillText(
        snapshot.badUserDataBySN.get(drone.serialNumber)?.lastName ?? "404",
        +drone.positionX / 1000 + 10,
        +drone.positionY / 1000
      );
    });
  }
</script>

<canvas
  class="border-white border w-[500px] h-[500px]"
  width="500"
  height="500"
  bind:this={canvas} />
