import { Drone, NEST_POSITION } from "../../shared/core.js";

export function distanceFromNest(d: Drone) {
  return distanceBetweenPoints(
    +d.positionX / 1000,
    // drone positions are in millimeters
    +d.positionY / 1000,
    NEST_POSITION.x,
    NEST_POSITION.y
  );
}

// Pythagorean theorem
export function distanceBetweenPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function droneInNDZ(d: Drone) {
  const NDZ_RANGE = 100;
  return distanceFromNest(d) < NDZ_RANGE;
}
