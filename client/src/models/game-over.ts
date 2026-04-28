const MODEL_NAME = "GameOver";

export interface RawGameOver {
  game_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  reason: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  points: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
}

export enum GameOverReason {
  Death = 0,
  CashOut = 1,
}

export class GameOver {
  game_id: number;
  reason: GameOverReason;
  points: number;

  constructor(game_id: number, reason: GameOverReason, points: number) {
    this.game_id = game_id;
    this.reason = reason;
    this.points = points;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawGameOver): GameOver {
    return GameOver.parse(data);
  }

  static parse(data: RawGameOver): GameOver {
    const reasonNum = Number(data.reason.value);
    const reason =
      reasonNum === GameOverReason.CashOut
        ? GameOverReason.CashOut
        : GameOverReason.Death;
    return new GameOver(
      Number(data.game_id.value),
      reason,
      Number(data.points.value),
    );
  }

  static deduplicate(items: GameOver[]): GameOver[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.game_id === item.game_id),
    );
  }
}
