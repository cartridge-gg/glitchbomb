import { getChecksumAddress, shortString } from "starknet";

export interface RawAchievementTask {
  total: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  description: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
}

export interface RawAchievementDefinition {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  end: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  tasks: {
    type: "array";
    type_name: "Array<Task>";
    value: {
      type: "struct";
      type_name: "Task";
      value: RawAchievementTask;
      key: boolean;
    }[];
    key: boolean;
  };
  start: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawAchievementCompletion {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievement_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  timestamp: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  unclaimed: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
}

export interface RawAchievementAdvancement {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievement_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  count: {
    type: "primitive";
    type_name: "u128";
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

export interface RawAchievementAssociation {
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievements: {
    type: "array";
    type_name: "Array<felt252>";
    value: {
      type: "primitive";
      type_name: "felt252";
      value: string;
      key: boolean;
    }[];
    key: boolean;
  };
}

export interface RawAchievementCreation {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  hidden: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  index: {
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
  start: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  end: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  group: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  icon: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  title: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  description: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
  tasks: {
    type: "array";
    type_name: "Array<Task>";
    value: {
      type: "struct";
      type_name: "Task";
      value: RawAchievementTask;
      key: boolean;
    }[];
    key: boolean;
  };
  data: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
}

export interface RawAchievementProgression {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  count: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawAchievementCompleted {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievement_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawAchievementClaimed {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievement_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export class AchievementTask {
  id: string;
  description: string;
  total: bigint;

  constructor(id: string, description: string, total: bigint) {
    this.id = shortString.decodeShortString(`0x${BigInt(id).toString(16)}`);
    this.description = description;
    this.total = BigInt(total);
  }

  static from(data: RawAchievementTask): AchievementTask {
    return AchievementTask.parse(data);
  }

  static parse(data: RawAchievementTask): AchievementTask {
    return new AchievementTask(
      data.id.value,
      data.description.value,
      BigInt(data.total.value),
    );
  }
}

export class AchievementDefinition {
  id: string;
  start: number;
  end: number;
  tasks: AchievementTask[];

  constructor(
    id: string,
    start: number,
    end: number,
    tasks: AchievementTask[],
  ) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.tasks = tasks;
  }

  static getModelName(): string {
    return "AchievementDefinition";
  }

  static from(data: RawAchievementDefinition): AchievementDefinition {
    return AchievementDefinition.parse(data);
  }

  static parse(data: RawAchievementDefinition): AchievementDefinition {
    return new AchievementDefinition(
      shortString.decodeShortString(`0x${BigInt(data.id.value).toString(16)}`),
      parseInt(data.start.value, 10),
      parseInt(data.end.value, 10),
      data.tasks.value.map((task) => AchievementTask.parse(task.value)),
    );
  }

  static deduplicate(items: AchievementDefinition[]): AchievementDefinition[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}

export class AchievementCompletion {
  player_id: string;
  achievement_id: string;
  timestamp: number;
  unclaimed: boolean;

  constructor(
    player_id: string,
    achievement_id: string,
    timestamp: number,
    unclaimed: boolean,
  ) {
    this.player_id = player_id;
    this.achievement_id = achievement_id;
    this.timestamp = timestamp;
    this.unclaimed = unclaimed;
  }

  static getModelName(): string {
    return "AchievementCompletion";
  }

  static from(data: RawAchievementCompletion): AchievementCompletion {
    return AchievementCompletion.parse(data);
  }

  static parse(data: RawAchievementCompletion): AchievementCompletion {
    return new AchievementCompletion(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.achievement_id.value).toString(16)}`,
      ),
      parseInt(data.timestamp.value, 10),
      data.unclaimed.value,
    );
  }

  static deduplicate(items: AchievementCompletion[]): AchievementCompletion[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.achievement_id === item.achievement_id,
        ),
    );
  }
}

export class AchievementAdvancement {
  player_id: string;
  achievement_id: string;
  task_id: string;
  timestamp: number;
  count: bigint;

  constructor(
    player_id: string,
    achievement_id: string,
    task_id: string,
    timestamp: number,
    count: bigint,
  ) {
    this.player_id = player_id;
    this.achievement_id = achievement_id;
    this.task_id = task_id;
    this.timestamp = timestamp;
    this.count = count;
  }

  static getModelName(): string {
    return "AchievementAdvancement";
  }

  static from(data: RawAchievementAdvancement): AchievementAdvancement {
    return AchievementAdvancement.parse(data);
  }

  static parse(data: RawAchievementAdvancement): AchievementAdvancement {
    return new AchievementAdvancement(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.achievement_id.value).toString(16)}`,
      ),
      shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      parseInt(data.timestamp.value, 10),
      BigInt(data.count.value),
    );
  }

  static deduplicate(
    items: AchievementAdvancement[],
  ): AchievementAdvancement[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.achievement_id === item.achievement_id &&
            t.task_id === item.task_id,
        ),
    );
  }
}

export class AchievementAssociation {
  task_id: string;
  achievements: string[];

  constructor(task_id: string, achievements: string[]) {
    this.task_id = task_id;
    this.achievements = achievements;
  }

  static getModelName(): string {
    return "AchievementAssociation";
  }

  static from(data: RawAchievementAssociation): AchievementAssociation {
    return AchievementAssociation.parse(data);
  }

  static parse(data: RawAchievementAssociation): AchievementAssociation {
    return new AchievementAssociation(
      shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      data.achievements.value.map((achievement) =>
        shortString.decodeShortString(
          `0x${BigInt(achievement.value).toString(16)}`,
        ),
      ),
    );
  }

  static deduplicate(
    items: AchievementAssociation[],
  ): AchievementAssociation[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.task_id === item.task_id),
    );
  }
}

export class AchievementCreation {
  id: string;
  hidden: boolean;
  index: number;
  points: number;
  start: number;
  end: number;
  group: string;
  icon: string;
  title: string;
  description: string;
  tasks: AchievementTask[];
  data: string;

  constructor(
    id: string,
    hidden: boolean,
    index: number,
    points: number,
    start: number,
    end: number,
    group: string,
    icon: string,
    title: string,
    description: string,
    tasks: AchievementTask[],
    data: string,
  ) {
    this.id = id;
    this.hidden = hidden;
    this.index = index;
    this.points = points;
    this.start = start;
    this.end = end;
    this.group = group;
    this.icon = icon;
    this.title = title;
    this.description = description;
    this.tasks = tasks;
    this.data = data;
  }

  static getModelName(): string {
    // On-chain event name from the shared achievement workspace.
    return "TrophyCreation";
  }

  static from(data: RawAchievementCreation): AchievementCreation {
    return AchievementCreation.parse(data);
  }

  static parse(data: RawAchievementCreation): AchievementCreation {
    return new AchievementCreation(
      shortString.decodeShortString(`0x${BigInt(data.id.value).toString(16)}`),
      data.hidden.value,
      parseInt(data.index.value, 10),
      parseInt(data.points.value, 10),
      parseInt(data.start.value, 10),
      parseInt(data.end.value, 10),
      shortString.decodeShortString(
        `0x${BigInt(data.group.value).toString(16)}`,
      ),
      shortString.decodeShortString(
        `0x${BigInt(data.icon.value).toString(16)}`,
      ),
      shortString.decodeShortString(
        `0x${BigInt(data.title.value).toString(16)}`,
      ),
      data.description.value,
      data.tasks.value.map((task) => AchievementTask.parse(task.value)),
      data.data.value,
    );
  }

  static deduplicate(items: AchievementCreation[]): AchievementCreation[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}

export class AchievementProgression {
  player_id: string;
  task_id: string;
  timestamp: number;
  count: bigint;

  constructor(
    player_id: string,
    task_id: string,
    timestamp: number,
    count: bigint,
  ) {
    this.player_id = player_id;
    this.task_id = task_id;
    this.timestamp = timestamp;
    this.count = count;
  }

  static getModelName(): string {
    // On-chain event name from the shared achievement workspace.
    return "TrophyProgression";
  }

  static from(data: RawAchievementProgression): AchievementProgression {
    return AchievementProgression.parse(data);
  }

  static parse(data: RawAchievementProgression): AchievementProgression {
    return new AchievementProgression(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      parseInt(data.time.value, 10),
      BigInt(data.count.value),
    );
  }

  static deduplicate(
    items: AchievementProgression[],
  ): AchievementProgression[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.player_id === item.player_id && t.task_id === item.task_id,
        ),
    );
  }
}

export class AchievementCompleted {
  player_id: string;
  achievement_id: string;
  time: number;

  constructor(player_id: string, achievement_id: string, time: number) {
    this.player_id = player_id;
    this.achievement_id = achievement_id;
    this.time = time;
  }

  static getModelName(): string {
    return "AchievementCompleted";
  }

  static from(data: RawAchievementCompleted): AchievementCompleted {
    return AchievementCompleted.parse(data);
  }

  static parse(data: RawAchievementCompleted): AchievementCompleted {
    return new AchievementCompleted(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.achievement_id.value).toString(16)}`,
      ),
      parseInt(data.time.value, 10),
    );
  }

  static getId(item: AchievementCompleted): string {
    return `${item.player_id}-${item.achievement_id}`;
  }

  hasExpired(): boolean {
    return this.time + 30 < Math.floor(Date.now() / 1000);
  }
}

export class AchievementClaimed {
  player_id: string;
  achievement_id: string;
  time: number;

  constructor(player_id: string, achievement_id: string, time: number) {
    this.player_id = player_id;
    this.achievement_id = achievement_id;
    this.time = time;
  }

  static getModelName(): string {
    return "AchievementClaimed";
  }

  static from(data: RawAchievementClaimed): AchievementClaimed {
    return AchievementClaimed.parse(data);
  }

  static parse(data: RawAchievementClaimed): AchievementClaimed {
    return new AchievementClaimed(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.achievement_id.value).toString(16)}`,
      ),
      parseInt(data.time.value, 10),
    );
  }
}
