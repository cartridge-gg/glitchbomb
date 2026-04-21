use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::scorer::{
    LevelScorer35, LevelScorer45, LevelScorer60, QuickFinish3, QuickFinish4, Surge20,
};
use super::index::{
    INTERVAL_EASY_ONE, INTERVAL_MEDIUM_ONE, INTERVAL_MEDIUM_TWO, ONE_DAY, QuestMetadataTrait,
    QuestProps, QuestTrait,
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
            start: 2 * ONE_DAY,
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

pub impl Midrange of QuestTrait {
    fn identifier() -> felt252 {
        'MIDRANGE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Midrange",
            description: "Not a king, not a pawn, just steady.",
            icon: "fa-chart-bar",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(LevelScorer35::identifier(), 1, LevelScorer35::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 13 * ONE_DAY,
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
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Overachiever of QuestTrait {
    fn identifier() -> felt252 {
        'OVERACHIEVER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Overachiever",
            description: "Raise the bar, then raise it again.",
            icon: "fa-trophy",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(LevelScorer60::identifier(), 1, LevelScorer60::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 11 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl LightningRound of QuestTrait {
    fn identifier() -> felt252 {
        'LIGHTNING_ROUND'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Lightning Round",
            description: "In, out, on to the next.",
            icon: "fa-bolt",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(QuickFinish3::identifier(), 1, QuickFinish3::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 12 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
