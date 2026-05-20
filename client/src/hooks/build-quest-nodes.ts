import type { QuestNodeProps } from "@/components/elements/quest-node";
import type { Quests } from "@/contexts/quests";

export const DAILY_FINISHER_THREE = "DAILY_FINISHER_THREE";
export const DAILY_FINISHER_FIVE = "DAILY_FINISHER_FIVE";

const FINISHER_IDS = new Set([DAILY_FINISHER_THREE, DAILY_FINISHER_FIVE]);
const GIFT_SLOT_INDICES = new Set([2, 4]);

export function isFinisherQuest(id: string): boolean {
  return FINISHER_IDS.has(id);
}

const isQuestTaskComplete = (quest: Quests): boolean =>
  quest.tasks.every((task) => task.total === 0n || task.count >= task.total);

export function buildQuestNodes(
  dailyQuests: Quests[],
  finisherThree?: Quests,
  finisherFive?: Quests,
): QuestNodeProps[] {
  return dailyQuests.map((quest, index) => {
    if (GIFT_SLOT_INDICES.has(index)) {
      const finisher = index === 2 ? finisherThree : finisherFive;
      const completed = finisher ? isQuestTaskComplete(finisher) : false;

      return {
        variant: "gift" as const,
        completed,
      };
    }

    return {
      variant: "default" as const,
      completed: quest.completed,
    };
  });
}
