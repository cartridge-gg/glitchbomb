import { useMemo } from "react";
import type { QuestsProps } from "@/components/containers/quests";
import { useQuests } from "@/contexts/quests";
import {
  buildQuestNodes,
  DAILY_FINISHER_FIVE,
  DAILY_FINISHER_THREE,
  isFinisherQuest,
} from "@/hooks/build-quest-nodes";

export function useQuestScene(): QuestsProps {
  const { quests } = useQuests();

  return useMemo(() => {
    const activeQuests = quests.filter(
      (quest) => !quest.locked && quest.end > 0,
    );

    const dailyQuests = activeQuests.filter(
      (quest) => !isFinisherQuest(quest.id),
    );
    const finisherThree = activeQuests.find(
      (quest) => quest.id === DAILY_FINISHER_THREE,
    );
    const finisherFive = activeQuests.find(
      (quest) => quest.id === DAILY_FINISHER_FIVE,
    );

    const questProps = dailyQuests.map((quest) => {
      const totalCount = quest.tasks.reduce(
        (acc, task) => acc + Number(task.count),
        0,
      );
      const totalTotal = quest.tasks.reduce(
        (acc, task) => acc + Number(task.total),
        0,
      );

      return {
        id: quest.id,
        icon: quest.icon,
        title: quest.name,
        description: quest.tasks[0]?.description || quest.description,
        count: totalCount,
        total: totalTotal,
      };
    });

    const expiration =
      dailyQuests.length > 0 ? dailyQuests[0].end : (activeQuests[0]?.end ?? 0);

    return {
      quests: questProps,
      expiration,
      nodes: buildQuestNodes(dailyQuests, finisherThree, finisherFive),
    };
  }, [quests]);
}
