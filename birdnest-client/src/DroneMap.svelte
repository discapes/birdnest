<script lang="ts">
  import { onMount } from "svelte";
  import { NEST_POSITION, type Snapshot } from "../../shared/core.js";
  import { midPoint } from "../../shared/math.js";

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

    ctx.fillStyle = "green";
    ctx.fillRect(NEST_POSITION.x - 5, NEST_POSITION.y - 5, 10, 10);
    ctx.fillStyle = "red";
    ctx.font = "15px arial";
    ctx.fillText("NDZ", NEST_POSITION.x, NEST_POSITION.y - 10);

    ctx.fillStyle = "white";
    ctx.font = "14px arial";
    snapshot.drones.forEach((drone) => {
      const dx = +drone.positionX / 1000;
      const dy = +drone.positionY / 1000;

      // draw drone dot and prepare line
      ctx.fillRect(dx - 2, dy - 2, 4, 4);
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(250, 250);

      if (snapshot.badDistancesBySN.has(drone.serialNumber)) {
        // for violators
        ctx.strokeStyle = "red";
        ctx.stroke(); // draw bright line
        const mp = midPoint(dx, dy, NEST_POSITION.x, NEST_POSITION.y);
        ctx.fillText(
          snapshot.badDistancesBySN.get(drone.serialNumber)!.toFixed() + "m",
          mp.x,
          mp.y
        ); // draw distance
      } else {
        ctx.strokeStyle = "darkred";
        ctx.stroke(); // draw dark line
      }

      ctx.fillText(
        snapshot.badUserDataBySN.get(drone.serialNumber)?.lastName ??
          drone.serialNumber.slice(0, 6) + ".",
        dx + 10,
        dy
      );
    });
  }
</script>

<div class="w-[500px] h-[500px] relative">
  <p class="absolute left-0 top-0 mx-1 text-gray-400">(0, 0)</p>
  <p class="absolute right-0 top-0 mx-1 text-gray-400">(500, 0)</p>
  <p class="absolute right-0 bottom-0 mx-1 text-gray-400">(500, 500)</p>
  <p class="absolute left-0 bottom-0 mx-1 text-gray-400">(0, 500)</p>
  <canvas
    class="border-white border w-[500px] h-[500px] -z-10"
    width="500"
    height="500"
    bind:this={canvas} />
</div>
