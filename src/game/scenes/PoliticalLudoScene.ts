import Phaser from "phaser";
import winboxImage from "../../assets/winbox.png";
import { boardConfig, characters } from "../logic/pathFactory";
import { PoliticalLudoRules } from "../logic/rules";
import type { MatchState, PlayerColor } from "../logic/types";
import { coordToWorld, drawBoard, makeBoardLayout, WINBOX_TEXTURE_KEY, type BoardLayout } from "../board/boardPainter";
import { createToken } from "../tokens/tokenFactory";
import {
  emitUiState,
  emitWin,
  GameEvents,
  gameBus,
  type StartMatchPayload
} from "../utils/gameBus";
import { sleep } from "../utils/sleep";
import { soundEngine } from "../utils/sound";

type TokenMap = Record<PlayerColor, Phaser.GameObjects.Container>;

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export class PoliticalLudoScene extends Phaser.Scene {
  private readonly rules = new PoliticalLudoRules(boardConfig);

  private layout!: BoardLayout;

  private match: MatchState | null = null;

  private tokens: TokenMap | null = null;

  private canRoll = false;

  private isRolling = false;

  private botThinking = false;

  private diceValue = 1;

  private statusText = "Start the match to begin.";

  private turnProgress = 1;

  private turnTimer?: Phaser.Time.TimerEvent;

  private lastStart: StartMatchPayload | null = null;

  private startHandler = (event: Event) => {
    const payload = (event as CustomEvent<StartMatchPayload>).detail;
    void this.startMatch(payload);
  };

  private restartHandler = () => {
    if (!this.lastStart) return;
    void this.startMatch(this.lastStart);
  };

  private rollHandler = (event: Event) => {
    const auto = Boolean((event as CustomEvent<{ auto: boolean }>).detail?.auto);
    void this.handleRoll(auto);
  };

  constructor() {
    super("PoliticalLudoScene");
  }

  async create() {
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    this.layout = makeBoardLayout(this.scale.width, this.scale.height, boardConfig.size);

    gameBus.addEventListener(GameEvents.StartMatch, this.startHandler);
    gameBus.addEventListener(GameEvents.RestartMatch, this.restartHandler);
    gameBus.addEventListener(GameEvents.RollRequest, this.rollHandler);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameBus.removeEventListener(GameEvents.StartMatch, this.startHandler);
      gameBus.removeEventListener(GameEvents.RestartMatch, this.restartHandler);
      gameBus.removeEventListener(GameEvents.RollRequest, this.rollHandler);
    });

    await this.loadBoardTextures();
    drawBoard(this, boardConfig, this.layout);
  }

  private async loadBoardTextures() {
    if (this.textures.exists(WINBOX_TEXTURE_KEY)) return;
    try {
      const image = await this.loadHtmlImage(winboxImage);
      const squared = this.centerCropToSquare(image);
      if (!this.textures.exists(WINBOX_TEXTURE_KEY)) {
        this.textures.addImage(WINBOX_TEXTURE_KEY, squared);
      }
    } catch (error) {
      console.error("Failed to load winbox texture:", error);
    }
  }

  private async startMatch(payload: StartMatchPayload) {
    this.lastStart = payload;
    this.turnTimer?.remove(false);
    this.botThinking = false;
    this.canRoll = true;
    this.isRolling = false;
    this.diceValue = 1;
    this.turnProgress = 1;

    this.match = this.rules.newMatch(payload);
    await this.prepareTextures(payload);
    this.createOrResetTokens(payload);

    const firstName = this.shortName(this.match.currentTurn);
    this.statusText = `${firstName} begins. Roll a 6 to enter.`;
    this.emitUi();
    this.startTurnTimer();

    if (this.match.players[this.match.currentTurn].isBot) {
      this.time.delayedCall(600, () => {
        void this.handleRoll(true);
      });
    }
  }

  private shortName(color: PlayerColor): string {
    const characterId = this.match?.players[color].characterId;
    const character = characters.find((c) => c.id === characterId);
    if (!character) return color.toUpperCase();
    return character.name.split(" ")[0] ?? color.toUpperCase();
  }

  private async prepareTextures(payload: StartMatchPayload) {
    const assets = [
      { id: payload.redCharacterId },
      { id: payload.blueCharacterId }
    ];

    await Promise.all(
      assets.map(async (item) => {
        const key = this.textureKey(item.id);
        if (this.textures.exists(key)) return;
        const char = characters.find((character) => character.id === item.id);
        if (!char) return;

        try {
          const image = await this.loadHtmlImage(char.image);
          const squared = this.centerCropToSquare(image);
          if (!this.textures.exists(key)) {
            this.textures.addImage(key, squared);
          }
        } catch (error) {
          console.error(`Failed to load texture for ${item.id}:`, error);
        }
      })
    );
  }

  private loadHtmlImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Image failed to load: ${src}`));
      image.src = src;
    });
  }

  private centerCropToSquare(image: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
    const { naturalWidth: w, naturalHeight: h } = image;
    if (w === h || w === 0 || h === 0) return image;

    const size = Math.min(w, h);
    const sx = Math.floor((w - size) / 2);
    const sy = Math.floor((h - size) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return image;

    ctx.drawImage(image, sx, sy, size, size, 0, 0, size, size);
    return canvas;
  }

  private createOrResetTokens(payload: StartMatchPayload) {
    this.tokens?.red.destroy();
    this.tokens?.blue.destroy();

    const redChar = characters.find((character) => character.id === payload.redCharacterId);
    const blueChar = characters.find((character) => character.id === payload.blueCharacterId);
    const size = this.layout.cell * 0.88;

    const redToken = createToken(
      this,
      this.textureKey(payload.redCharacterId),
      "R",
      0xef4a57,
      size
    );

    const blueToken = createToken(
      this,
      this.textureKey(payload.blueCharacterId),
      "B",
      0x3c8dff,
      size
    );

    this.tokens = { red: redToken, blue: blueToken };

    this.placeToken("red", this.rules.getCoord("red", -1));
    this.placeToken("blue", this.rules.getCoord("blue", -1));

    redToken.setDepth(8);
    blueToken.setDepth(8);

    if (!redChar || !blueChar) {
      this.statusText = "Character image unavailable. Using fallback token style.";
    }
  }

  private textureKey(characterId: string) {
    return `char-${characterId}`;
  }

  private placeToken(color: PlayerColor, coord: { r: number; c: number }) {
    if (!this.tokens) return;
    const token = this.tokens[color];
    const point = coordToWorld(coord, this.layout);
    token.setPosition(point.x, point.y);
  }

  private async moveToken(color: PlayerColor, coord: { r: number; c: number }, duration = 210) {
    if (!this.tokens) return;
    const token = this.tokens[color];
    const { x, y } = coordToWorld(coord, this.layout);

    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: token,
        x,
        y,
        duration,
        ease: "Cubic.Out",
        onComplete: () => resolve()
      });
    });
  }

  private startTurnTimer() {
    this.turnTimer?.remove(false);

    const totalMs = boardConfig.turnSeconds * 1000;
    let remaining = totalMs;
    this.turnProgress = 1;

    this.turnTimer = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (!this.match || this.match.status !== "playing") return;

        remaining -= 100;
        this.turnProgress = Math.max(0, remaining / totalMs);
        this.emitUi();

        if (remaining <= 0) {
          this.turnTimer?.remove(false);
          if (!this.isRolling && this.canRoll) {
            this.statusText = "Timer expired. Auto rolling...";
            void this.handleRoll(true);
          }
        }
      }
    });
  }

  private async handleRoll(auto = false) {
    if (!this.match || this.match.status !== "playing") return;
    if (!this.canRoll || this.isRolling) return;

    const turn = this.match.currentTurn;
    const isBot = this.match.players[turn].isBot;

    if (isBot && !auto) return;

    this.canRoll = false;
    this.isRolling = true;
    this.botThinking = isBot;
    this.emitUi();

    if (isBot) {
      this.statusText = `${this.shortName(turn)} is thinking...`;
      this.emitUi();
      await sleep(900 + Math.floor(Math.random() * 800));
      this.botThinking = false;
    }

    soundEngine.playRoll();

    for (let i = 0; i < 10; i += 1) {
      this.diceValue = this.rules.rollDice();
      this.emitUi();
      await sleep(55);
    }

    const roll = this.rules.rollDice();
    this.diceValue = roll;
    const result = this.rules.applyRoll(this.match, roll);

    const playerName = this.shortName(result.player);
    this.statusText = `${playerName} rolled ${roll}.`;
    this.emitUi();

    if (result.moved) {
      for (const progress of result.movedProgresses) {
        const coord = this.rules.getCoord(result.player, progress);
        await this.moveToken(result.player, coord);
        soundEngine.playStep();
      }

      if (result.capture) {
        this.statusText = `${playerName} captured the opponent!`;
        this.emitUi();
        await this.moveToken(result.player === "red" ? "blue" : "red", this.rules.getCoord(result.player === "red" ? "blue" : "red", -1), 260);
      }
    } else {
      this.statusText = roll === 6 ? "Roll 6 to enter from base." : "No valid move.";
    }

    if (result.winner) {
      this.statusText = `${this.shortName(result.winner)} reaches center and wins!`;
      this.turnProgress = 1;
      this.canRoll = false;
      this.isRolling = false;
      this.turnTimer?.remove(false);
      soundEngine.playWin();
      this.emitUi();
      emitWin({ winner: result.winner });
      return;
    }

    this.canRoll = true;
    this.isRolling = false;

    if (result.extraTurn) {
      this.statusText = `${playerName} gets an extra turn!`;
    } else {
      this.statusText = `${this.shortName(result.nextTurn)}'s turn.`;
    }

    this.startTurnTimer();
    this.emitUi();

    const nextIsBot = this.match.players[this.match.currentTurn].isBot;
    if (nextIsBot) {
      this.time.delayedCall(500, () => {
        void this.handleRoll(true);
      });
    }
  }

  private emitUi() {
    if (!this.match) return;

    emitUiState({
      match: deepClone(this.match),
      diceValue: this.diceValue,
      canRoll: this.canRoll && !this.isRolling,
      botThinking: this.botThinking,
      statusText: this.statusText,
      turnProgress: this.turnProgress
    });
  }
}
