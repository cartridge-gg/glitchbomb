use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::scorer::{LevelScorer45, QuickFinish4, Surge20};
use super::index::{
    INTERVAL_EASY_ONE, INTERVAL_MEDIUM_ONE, ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait,
};

pub impl SharpShot of QuestTrait {
    fn identifier() -> felt252 {
        'SHARP_SHOT'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Sharp Shot",
            description: "One pull, twenty reasons to smile.",
            icon: "fa-bullseye",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Surge20::identifier(), 1, Surge20::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 4 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Speedrunner of QuestTrait {
    fn identifier() -> felt252 {
        'SPEEDRUNNER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Speedrunner",
            description: "Blink and it's over.",
            icon: "fa-gauge-high",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(QuickFinish4::identifier(), 1, QuickFinish4::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl HighScorer of QuestTrait {
    fn identifier() -> felt252 {
        'HIGH_SCORER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "High Scorer",
            description: "Forty-five and still climbing.",
            icon: "fa-chart-line",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(LevelScorer45::identifier(), 1, LevelScorer45::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
