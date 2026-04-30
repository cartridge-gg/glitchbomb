const MODEL_NAME = "LeaderboardScore";

export interface RawScore {
  leaderboard_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  game_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  player: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  score: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  timestamp: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export class Score {
  constructor(
    public leaderboard_id: string,
    public player: string,
    public game_id: number,
    public score: number,
    public timestamp: number,
  ) {
    this.leaderboard_id = leaderboard_id;
    this.player = player;
    this.game_id = game_id;
    this.score = score;
    this.timestamp = timestamp;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawScore): Score {
    return Score.parse(data);
  }

  static parse(data: RawScore) {
    const props = {
      leaderboard_id: data.leaderboard_id.value,
      player: data.player.value,
      game_id: Number(data.game_id.value),
      score: Number(data.score.value),
      timestamp: Number(data.timestamp.value),
    };
    return new Score(
      props.leaderboard_id,
      props.player,
      props.game_id,
      props.score,
      props.timestamp,
    );
  }

  static dedupe(Scores: Score[]): Score[] {
    return Scores.filter(
      (Score, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.leaderboard_id === Score.leaderboard_id &&
            t.game_id === Score.game_id,
        ),
    );
  }

  static getId(Score: Score): string {
    return `${Score.leaderboard_id}-${Score.game_id}-${Score.timestamp}`;
  }
}
