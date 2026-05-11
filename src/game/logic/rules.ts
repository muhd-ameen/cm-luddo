import type { BoardConfig, MatchState, PlayerColor, RollResult } from "./types";

const sameCoord = (a: { r: number; c: number }, b: { r: number; c: number }) =>
  a.r === b.r && a.c === b.c;

export class PoliticalLudoRules {
  private readonly trackLen: number;

  private readonly maxProgress: number;

  constructor(private readonly config: BoardConfig) {
    this.trackLen = this.config.track.length;
    this.maxProgress = this.config.routes.red.length - 1;
  }

  newMatch(params: {
    redCharacterId: string;
    blueCharacterId: string;
    redIsBot: boolean;
    blueIsBot: boolean;
  }): MatchState {
    return {
      status: "playing",
      currentTurn: "red",
      winner: null,
      lastRoll: null,
      players: {
        red: {
          color: "red",
          progress: -1,
          characterId: params.redCharacterId,
          isBot: params.redIsBot,
          captures: 0
        },
        blue: {
          color: "blue",
          progress: -1,
          characterId: params.blueCharacterId,
          isBot: params.blueIsBot,
          captures: 0
        }
      }
    };
  }

  rollDice() {
    return Math.floor(Math.random() * 6) + 1;
  }

  getCoord(color: PlayerColor, progress: number) {
    if (progress < 0) return this.config.bases[color];
    return this.config.routes[color][progress] ?? this.config.routes[color][this.maxProgress];
  }

  isOnTrack(progress: number) {
    return progress >= 0 && progress < this.trackLen;
  }

  applyRoll(state: MatchState, roll: number): RollResult {
    const current = state.currentTurn;
    const enemy: PlayerColor = current === "red" ? "blue" : "red";
    const player = state.players[current];
    const opponent = state.players[enemy];

    const movedProgresses: number[] = [];
    let moved = false;
    let target = player.progress;

    if (player.progress < 0) {
      if (roll === 6) {
        moved = true;
        target = 0;
      }
    } else {
      const candidate = player.progress + roll;
      if (candidate <= this.maxProgress) {
        moved = true;
        target = candidate;
      }
    }

    if (moved) {
      for (let p = player.progress + 1; p <= target; p += 1) {
        movedProgresses.push(p);
      }
      player.progress = target;
    }

    let capture = false;
    if (
      moved &&
      this.isOnTrack(player.progress) &&
      this.isOnTrack(opponent.progress) &&
      sameCoord(this.getCoord(current, player.progress), this.getCoord(enemy, opponent.progress))
    ) {
      opponent.progress = -1;
      player.captures += 1;
      capture = true;
    }

    const winner = player.progress === this.maxProgress ? current : null;
    if (winner) {
      state.winner = winner;
      state.status = "finished";
    }

    const extraTurn = roll === 6 && !winner;
    if (!winner && !extraTurn) {
      state.currentTurn = enemy;
    }

    state.lastRoll = roll;

    return {
      roll,
      player: current,
      moved,
      movedProgresses,
      capture,
      winner,
      extraTurn,
      nextTurn: state.currentTurn
    };
  }
}
