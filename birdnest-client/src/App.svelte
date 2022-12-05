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

  let canvas: HTMLCanvasElement;
  let data;

  async function getData() {
    data = <Drone[]>(
      await fetch("http://127.0.0.1:3000").then((res) => res.json())
    );

    console.log(data);
  }
  getData();
  setInterval(getData, 2000);

  onMount(async () => {
    let ctx = canvas.getContext("2d");
  });
</script>

<main>
  <canvas bind:this={canvas} />
</main>

<style>
</style>
