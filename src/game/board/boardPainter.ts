import Phaser from "phaser";
import type { BoardConfig, CellCoord, PlayerColor } from "../logic/types";

export const WINBOX_TEXTURE_KEY = "winbox";

export type BoardLayout = {
  startX: number;
  startY: number;
  cell: number;
};

const key = (coord: CellCoord) => `${coord.r}-${coord.c}`;

const setFrom = (coords: CellCoord[]) => new Set(coords.map((coord) => key(coord)));

export const makeBoardLayout = (sceneWidth: number, sceneHeight: number, size: number): BoardLayout => {
  const usable = Math.min(sceneWidth, sceneHeight) * 0.88;
  const cell = usable / size;
  const boardSize = cell * size;

  return {
    startX: (sceneWidth - boardSize) / 2,
    startY: (sceneHeight - boardSize) / 2,
    cell
  };
};

export const coordToWorld = (coord: CellCoord, layout: BoardLayout) => ({
  x: layout.startX + coord.c * layout.cell + layout.cell / 2,
  y: layout.startY + coord.r * layout.cell + layout.cell / 2
});

export const drawBoard = (scene: Phaser.Scene, config: BoardConfig, layout: BoardLayout) => {
  const track = setFrom(config.track);
  const redHome = setFrom(config.homeLanes.red);
  const blueHome = setFrom(config.homeLanes.blue);
  const center = key(config.homeLanes.red[config.homeLanes.red.length - 1]);
  const bases: Record<PlayerColor, string> = {
    red: key(config.bases.red),
    blue: key(config.bases.blue)
  };

  const boardBg = scene.add.rectangle(
    layout.startX + (config.size * layout.cell) / 2,
    layout.startY + (config.size * layout.cell) / 2,
    config.size * layout.cell + 12,
    config.size * layout.cell + 12,
    0x09182f,
    0.85
  );
  boardBg.setStrokeStyle(2, 0xffffff, 0.2).setOrigin(0.5);

  const redEntryKey = key(config.routes.red[0]);
  const blueEntryKey = key(config.routes.blue[0]);

  for (let r = 0; r < config.size; r += 1) {
    for (let c = 0; c < config.size; c += 1) {
      const id = `${r}-${c}`;
      let fill = 0x1a2e4a;
      let alpha = 0.18;
      let strokeColor = 0xffffff;
      let strokeAlpha = 0.12;
      let strokeWidth = 1;

      if (track.has(id)) {
        fill = 0xe6eefb;
        alpha = 0.55;
      }

      if (redHome.has(id)) {
        fill = 0xef4a57;
        alpha = id === center ? 0.95 : 0.62;
      }

      if (blueHome.has(id)) {
        fill = 0x3c8dff;
        alpha = id === center ? 0.95 : 0.62;
      }

      if (id === center) {
        fill = 0xf7c45f;
        alpha = 0.96;
        strokeColor = 0xfff1c4;
        strokeAlpha = 0.9;
        strokeWidth = 2;
      }

      if (id === redEntryKey) {
        strokeColor = 0xef4a57;
        strokeAlpha = 0.95;
        strokeWidth = 2;
      }

      if (id === blueEntryKey) {
        strokeColor = 0x3c8dff;
        strokeAlpha = 0.95;
        strokeWidth = 2;
      }

      if (id === bases.red) {
        fill = 0xef4a57;
        alpha = 0.55;
        strokeColor = 0xffe4e7;
        strokeAlpha = 0.95;
        strokeWidth = 2;
      }

      if (id === bases.blue) {
        fill = 0x3c8dff;
        alpha = 0.55;
        strokeColor = 0xdfeaff;
        strokeAlpha = 0.95;
        strokeWidth = 2;
      }

      const x = layout.startX + c * layout.cell + layout.cell / 2;
      const y = layout.startY + r * layout.cell + layout.cell / 2;
      const rect = scene.add.rectangle(x, y, layout.cell * 0.88, layout.cell * 0.88, fill, alpha);
      rect.setStrokeStyle(strokeWidth, strokeColor, strokeAlpha);
      rect.setOrigin(0.5);
    }
  }

  if (scene.textures.exists(WINBOX_TEXTURE_KEY)) {
    const centerCoord = config.homeLanes.red[config.homeLanes.red.length - 1];
    const point = coordToWorld(centerCoord, layout);
    const winbox = scene.add.image(point.x, point.y, WINBOX_TEXTURE_KEY);
    winbox.setDisplaySize(layout.cell * 0.88, layout.cell * 0.88);
    winbox.setOrigin(0.5);
    winbox.setDepth(2);
  }
};
