import satheeshanImage from "../../assets/satheeshan.png";
import venugopalImage from "../../assets/kc-image.png";
import type { BoardConfig, CellCoord, Character } from "./types";

const BOARD_SIZE = 9;

const createPerimeter = (size: number): CellCoord[] => {
  const min = 0;
  const max = size - 1;
  const mid = Math.floor(size / 2);
  const path: CellCoord[] = [{ r: min, c: mid }];

  for (let c = mid - 1; c >= min; c -= 1) path.push({ r: min, c });
  for (let r = min + 1; r <= max; r += 1) path.push({ r, c: min });
  for (let c = min + 1; c <= max; c += 1) path.push({ r: max, c });
  for (let r = max - 1; r >= min; r -= 1) path.push({ r, c: max });
  for (let c = max - 1; c >= mid + 1; c -= 1) path.push({ r: min, c });

  return path;
};

const rotateRoute = (loop: CellCoord[], startIndex: number) =>
  loop.slice(startIndex).concat(loop.slice(0, startIndex));

const track = createPerimeter(BOARD_SIZE);
const mid = Math.floor(BOARD_SIZE / 2);
const redEntry = 0;
const blueEntry = Math.floor(track.length / 2);

const redHome: CellCoord[] = [
  { r: 1, c: mid },
  { r: 2, c: mid },
  { r: 3, c: mid },
  { r: mid, c: mid }
];

const blueHome: CellCoord[] = [
  { r: BOARD_SIZE - 2, c: mid },
  { r: BOARD_SIZE - 3, c: mid },
  { r: BOARD_SIZE - 4, c: mid },
  { r: mid, c: mid }
];

export const boardConfig: BoardConfig = {
  size: BOARD_SIZE,
  track,
  routes: {
    red: rotateRoute(track, redEntry).concat(redHome),
    blue: rotateRoute(track, blueEntry).concat(blueHome)
  },
  homeLanes: {
    red: redHome,
    blue: blueHome
  },
  bases: {
    red: { r: 1, c: 1 },
    blue: { r: BOARD_SIZE - 2, c: BOARD_SIZE - 2 }
  },
  turnSeconds: 12
};

export const characters: Character[] = [
  {
    id: "satheeshan",
    name: "VD Satheeshan",
    image: satheeshanImage,
    accent: "#ef4a57"
  },
  {
    id: "venugopal",
    name: "KC Venugopal",
    image: venugopalImage,
    accent: "#3c8dff"
  }
];
