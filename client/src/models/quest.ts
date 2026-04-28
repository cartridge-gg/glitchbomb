import { getChecksumAddress, shortString } from "starknet";

export interface RawQuestReward {
  name: string;
  description: string;
  icon: string;
}

export interface RawQuestTask {
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

export interface RawQuestDefinition {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  conditions: {
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
      value: RawQuestTask;
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
  duration: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawQuestCreation {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  definition: {
    type: "struct";
    type_name: "QuestDefinition";
    value: RawQuestDefinition;
    key: boolean;
  };
  metadata: {
    type: "struct";
    type_name: "QuestMetadata";
    value: string;
    key: boolean;
  };
}

export interface RawQuestCompletion {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
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
  unclaimed: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  lock_count: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
}

export interface RawQuestAdvancement {
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
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
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
  interval_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawQuestAssociation {
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quests: {
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

export interface RawQuestCondition {
  quests: {
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
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
}

export interface RawQuestProgression {
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
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
}

export interface RawQuestUnlocked {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
    type: "primitive";
    type_name: "u64";
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

export interface RawQuestCompleted {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
    type: "primitive";
    type_name: "u64";
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

export interface RawQuestClaimed {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  quest_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  interval_id: {
    type: "primitive";
    type_name: "u64";
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

export class QuestTask {
  id: string;
  description: string;
  total: bigint;

  constructor(id: string, description: string, total: bigint) {
    this.id = shortString.decodeShortString(`0x${BigInt(id).toString(16)}`);
    this.description = description;
    this.total = BigInt(total);
  }

  static from(data: RawQuestTask): QuestTask {
    return QuestTask.parse(data);
  }

  static parse(data: RawQuestTask): QuestTask {
    return new QuestTask(
      data.id.value,
      data.description.value,
      BigInt(data.total.value),
    );
  }
}

export class QuestDefinition {
  id: string;
  start: number;
  end: number;
  duration: number;
  interval: number;
  tasks: QuestTask[];
  conditions: string[];

  constructor(
    id: string,
    start: number,
    end: number,
    duration: number,
    interval: number,
    tasks: QuestTask[],
    conditions: string[],
  ) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.interval = interval;
    this.tasks = tasks;
    this.conditions = conditions;
  }

  static getModelName(): string {
    return "QuestDefinition";
  }

  static from(data: RawQuestDefinition): QuestDefinition {
    return QuestDefinition.parse(data);
  }

  static parse(data: RawQuestDefinition): QuestDefinition {
    const props = {
      id: shortString.decodeShortString(
        `0x${BigInt(data.id.value).toString(16)}`,
      ),
      start: parseInt(data.start.value, 10),
      end: parseInt(data.end.value, 10),
      duration: parseInt(data.duration.value, 10),
      interval: parseInt(data.interval.value, 10),
      tasks: data.tasks.value.map((task) => QuestTask.parse(task.value)),
      conditions: data.conditions.value.map((condition) =>
        shortString.decodeShortString(
          `0x${BigInt(condition.value).toString(16)}`,
        ),
      ),
    };
    return new QuestDefinition(
      props.id,
      props.start,
      props.end,
      props.duration,
      props.interval,
      props.tasks,
      props.conditions,
    );
  }

  static deduplicate(items: QuestDefinition[]): QuestDefinition[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }

  static now(): number {
    return Math.floor(Date.now() / 1000);
  }

  hasStarted(): boolean {
    const now = QuestDefinition.now();
    return this.start === 0 || (now >= this.start && this.start !== 0);
  }

  hasEnded(): boolean {
    const now = QuestDefinition.now();
    return now >= this.end && this.end !== 0;
  }

  isActive(): boolean {
    if (!this.hasStarted() || this.hasEnded()) return false;
    if (this.interval === 0) return true;
    const now = QuestDefinition.now();
    return (now - this.start) % this.interval < this.duration;
  }

  getIntervalId(): number | undefined {
    if (!this.isActive()) return undefined;
    if (this.interval === 0 || this.duration === 0) return 0;
    const now = QuestDefinition.now();
    return Math.floor((now - this.start) / this.interval);
  }

  getNextEnd(): number | undefined {
    if (!this.isActive()) return undefined;
    const intervalId = this.getIntervalId();
    if (intervalId === undefined) return undefined;
    return this.start + intervalId * this.interval + this.duration;
  }
}

export class QuestCompletion {
  player_id: string;
  quest_id: string;
  interval_id: number;
  timestamp: number;
  unclaimed: boolean;
  lock_count: number;

  constructor(
    player_id: string,
    quest_id: string,
    interval_id: number,
    timestamp: number,
    unclaimed: boolean,
    lock_count: number,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.interval_id = interval_id;
    this.timestamp = timestamp;
    this.unclaimed = unclaimed;
    this.lock_count = lock_count;
  }

  static getModelName(): string {
    return "QuestCompletion";
  }

  static from(data: RawQuestCompletion): QuestCompletion {
    return QuestCompletion.parse(data);
  }

  static parse(data: RawQuestCompletion): QuestCompletion {
    return new QuestCompletion(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      parseInt(data.interval_id.value, 10),
      parseInt(data.timestamp.value, 10),
      data.unclaimed.value,
      parseInt(data.lock_count.value, 10),
    );
  }

  static deduplicate(items: QuestCompletion[]): QuestCompletion[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.quest_id === item.quest_id &&
            t.interval_id === item.interval_id,
        ),
    );
  }
}

export class QuestAdvancement {
  player_id: string;
  quest_id: string;
  task_id: string;
  interval_id: number;
  timestamp: number;
  count: bigint;

  constructor(
    player_id: string,
    quest_id: string,
    task_id: string,
    interval_id: number,
    timestamp: number,
    count: bigint,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.task_id = task_id;
    this.interval_id = interval_id;
    this.timestamp = timestamp;
    this.count = count;
  }

  static getModelName(): string {
    return "QuestAdvancement";
  }

  static from(data: RawQuestAdvancement): QuestAdvancement {
    return QuestAdvancement.parse(data);
  }

  static parse(data: RawQuestAdvancement): QuestAdvancement {
    return new QuestAdvancement(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      parseInt(data.interval_id.value, 10),
      parseInt(data.timestamp.value, 10),
      BigInt(data.count.value),
    );
  }

  static deduplicate(items: QuestAdvancement[]): QuestAdvancement[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.quest_id === item.quest_id &&
            t.task_id === item.task_id &&
            t.interval_id === item.interval_id,
        ),
    );
  }
}

export class QuestAssociation {
  task_id: string;
  quests: string[];

  constructor(task_id: string, quests: string[]) {
    this.task_id = task_id;
    this.quests = quests;
  }

  static getModelName(): string {
    return "QuestAssociation";
  }

  static from(data: RawQuestAssociation): QuestAssociation {
    return QuestAssociation.parse(data);
  }

  static parse(data: RawQuestAssociation): QuestAssociation {
    return new QuestAssociation(
      shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      data.quests.value.map((quest) =>
        shortString.decodeShortString(`0x${BigInt(quest.value).toString(16)}`),
      ),
    );
  }

  static deduplicate(items: QuestAssociation[]): QuestAssociation[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.task_id === item.task_id),
    );
  }
}

export class QuestCondition {
  quest_id: string;
  quests: string[];

  constructor(quest_id: string, quests: string[]) {
    this.quest_id = quest_id;
    this.quests = quests;
  }

  static getModelName(): string {
    return "QuestCondition";
  }

  static from(data: RawQuestCondition): QuestCondition {
    return QuestCondition.parse(data);
  }

  static parse(data: RawQuestCondition): QuestCondition {
    return new QuestCondition(
      shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      data.quests.value.map((quest) =>
        shortString.decodeShortString(`0x${BigInt(quest.value).toString(16)}`),
      ),
    );
  }

  static deduplicate(items: QuestCondition[]): QuestCondition[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.quest_id === item.quest_id),
    );
  }
}

export class QuestReward {
  name: string;
  description: string;
  icon: string;

  constructor(name: string, description: string, icon: string) {
    this.name = name;
    this.description = description;
    this.icon = icon;
  }

  static from(data: RawQuestReward): QuestReward {
    return QuestReward.parse(data);
  }

  static parse(data: RawQuestReward): QuestReward {
    return new QuestReward(data.name, data.description, data.icon);
  }

  static deduplicate(items: QuestReward[]): QuestReward[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.name === item.name &&
            t.description === item.description &&
            t.icon === item.icon,
        ),
    );
  }
}

export class QuestMetadata {
  name: string;
  description: string;
  icon: string;
  registry: string;
  rewards: QuestReward[];

  constructor(
    name: string,
    description: string,
    icon: string,
    registry: string,
    rewards: QuestReward[],
  ) {
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.registry = registry;
    this.rewards = rewards;
  }

  static from(data: string): QuestMetadata {
    return QuestMetadata.parse(data);
  }

  static parse(data: string): QuestMetadata {
    try {
      const object = JSON.parse(data);
      const rewards = Array.isArray(object.rewards)
        ? object.rewards.map((reward: RawQuestReward) =>
            QuestReward.parse(reward),
          )
        : [];
      return new QuestMetadata(
        object.name ?? "",
        object.description ?? "",
        object.icon ?? "",
        object.registry
          ? getChecksumAddress(`0x${BigInt(object.registry).toString(16)}`)
          : "",
        rewards,
      );
    } catch (error) {
      console.error("Failed to parse QuestMetadata:", error);
      return new QuestMetadata("", "", "", "", []);
    }
  }
}

export class QuestCreation {
  id: string;
  definition: QuestDefinition;
  metadata: QuestMetadata;

  constructor(
    id: string,
    definition: QuestDefinition,
    metadata: QuestMetadata,
  ) {
    this.id = id;
    this.definition = definition;
    this.metadata = metadata;
  }

  static getModelName(): string {
    return "QuestCreation";
  }

  static from(data: RawQuestCreation): QuestCreation {
    return QuestCreation.parse(data);
  }

  static parse(data: RawQuestCreation): QuestCreation {
    return new QuestCreation(
      shortString.decodeShortString(`0x${BigInt(data.id.value).toString(16)}`),
      QuestDefinition.parse(data.definition.value),
      QuestMetadata.parse(data.metadata.value),
    );
  }

  static deduplicate(items: QuestCreation[]): QuestCreation[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}

export class QuestProgression {
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
    return "QuestProgression";
  }

  static from(data: RawQuestProgression): QuestProgression {
    return QuestProgression.parse(data);
  }

  static parse(data: RawQuestProgression): QuestProgression {
    return new QuestProgression(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      parseInt(data.time.value, 10),
      BigInt(data.count.value),
    );
  }

  static deduplicate(items: QuestProgression[]): QuestProgression[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.player_id === item.player_id && t.task_id === item.task_id,
        ),
    );
  }
}

export class QuestUnlocked {
  player_id: string;
  quest_id: string;
  interval_id: number;
  time: number;

  constructor(
    player_id: string,
    quest_id: string,
    interval_id: number,
    time: number,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.interval_id = interval_id;
    this.time = time;
  }

  static getModelName(): string {
    return "QuestUnlocked";
  }

  static from(data: RawQuestUnlocked): QuestUnlocked {
    return QuestUnlocked.parse(data);
  }

  static parse(data: RawQuestUnlocked): QuestUnlocked {
    return new QuestUnlocked(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      parseInt(data.interval_id.value, 10),
      parseInt(data.time.value, 10),
    );
  }
}

export class QuestCompleted {
  player_id: string;
  quest_id: string;
  interval_id: number;
  time: number;

  constructor(
    player_id: string,
    quest_id: string,
    interval_id: number,
    time: number,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.interval_id = interval_id;
    this.time = time;
  }

  static getModelName(): string {
    return "QuestCompleted";
  }

  static from(data: RawQuestCompleted): QuestCompleted {
    return QuestCompleted.parse(data);
  }

  static parse(data: RawQuestCompleted): QuestCompleted {
    return new QuestCompleted(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      parseInt(data.interval_id.value, 10),
      parseInt(data.time.value, 10),
    );
  }

  static getId(item: QuestCompleted): string {
    return `${item.player_id}-${item.quest_id}-${item.interval_id}-${item.time}`;
  }

  hasExpired(): boolean {
    return this.time + 30 < Math.floor(Date.now() / 1000);
  }
}

export class QuestClaimed {
  player_id: string;
  quest_id: string;
  interval_id: number;
  time: number;

  constructor(
    player_id: string,
    quest_id: string,
    interval_id: number,
    time: number,
  ) {
    this.player_id = player_id;
    this.quest_id = quest_id;
    this.interval_id = interval_id;
    this.time = time;
  }

  static getModelName(): string {
    return "QuestClaimed";
  }

  static from(data: RawQuestClaimed): QuestClaimed {
    return QuestClaimed.parse(data);
  }

  static parse(data: RawQuestClaimed): QuestClaimed {
    return new QuestClaimed(
      getChecksumAddress(`0x${BigInt(data.player_id.value).toString(16)}`),
      shortString.decodeShortString(
        `0x${BigInt(data.quest_id.value).toString(16)}`,
      ),
      parseInt(data.interval_id.value, 10),
      parseInt(data.time.value, 10),
    );
  }

  static getId(item: QuestClaimed): string {
    return `${item.player_id}-${item.quest_id}-${item.interval_id}-${item.time}`;
  }

  hasExpired(): boolean {
    return this.time + 30 < Math.floor(Date.now() / 1000);
  }
}
