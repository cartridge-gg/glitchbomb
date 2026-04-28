//! Daily finisher meta-quests.
//!
//! These quests are *always active* (1-day interval, offset 0) and track
//! the number of regular daily quests completed by the player on the current
//! day. They are progressed by the `on_quest_complete` callback in
//! `systems/play.cairo` whenever a regular (non-finisher) daily quest
//! completes. When the target is reached, the quest auto-claims (via
//! `auto_claim=true`) and the `on_quest_claim` callback rewards the player
//! with a free game (see `QuestType::reward`).
//!
//! The task identifier is the quest's own identifier — this is the "self
//! referential task" pattern used by the arcade `quest` package to express
//! counters that do not map to a regular `Task` enum entry.

use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use super::index::{ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait};

pub impl DailyFinisherThree of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_FINISHER_THREE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Daily Grind",
            description: "Complete 3 daily quests.",
            icon: "fa-medal",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 3, "Complete 3 daily quests"),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: ONE_DAY,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl DailyFinisherFive of QuestTrait {
    fn identifier() -> felt252 {
        'DAILY_FINISHER_FIVE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Clean Sweep",
            description: "Complete all 5 daily quests.",
            icon: "fa-trophy",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Self::identifier(), 5, "Complete 5 daily quests"),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: ONE_DAY,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
