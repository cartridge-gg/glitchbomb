use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::conqueror::{LevelCritical, LevelFlawless};
use crate::elements::tasks::level::{
    LevelReacher2, LevelReacher3, LevelReacher4, LevelReacher5, LevelReacher6,
};
use super::index::{
    INTERVAL_EASY_TWO, INTERVAL_HARD, INTERVAL_MEDIUM_ONE, INTERVAL_MEDIUM_TWO, ONE_DAY,
    QuestMetadataTrait, QuestProps, QuestTrait,
};

pub impl Untouched of QuestTrait {
    fn identifier() -> felt252 {
        'UNTOUCHED'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 1;
        let metadata = QuestMetadataTrait::new(
            name: "Untouched",
            description: "Walked through fire without a scratch.",
            icon: "fa-shield",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                LevelFlawless::identifier(), total.into(), LevelFlawless::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 7 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl FirstSteps of QuestTrait {
    fn identifier() -> felt252 {
        'FIRST_STEPS'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "First Steps",
            description: "One small climb for a player.",
            icon: "fa-shoe-prints",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(LevelReacher2::identifier(), 1, LevelReacher2::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 10 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Cliffhanger of QuestTrait {
    fn identifier() -> felt252 {
        'CLIFFHANGER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 1;
        let metadata = QuestMetadataTrait::new(
            name: "Cliffhanger",
            description: "One hit away from the void.",
            icon: "fa-mountain",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                LevelCritical::identifier(), total.into(), LevelCritical::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 6 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Staircase of QuestTrait {
    fn identifier() -> felt252 {
        'STAIRCASE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Staircase",
            description: "Three floors up, no elevator.",
            icon: "fa-stairs",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(LevelReacher3::identifier(), 1, LevelReacher3::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 10 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl TierClimber of QuestTrait {
    fn identifier() -> felt252 {
        'TIER_CLIMBER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Tier Climber",
            description: "Four rungs up the ladder.",
            icon: "fa-signal",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(LevelReacher4::identifier(), 1, LevelReacher4::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 6 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl FifthFloor of QuestTrait {
    fn identifier() -> felt252 {
        'FIFTH_FLOOR'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Fifth Floor",
            description: "The view is better up here.",
            icon: "fa-building",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(LevelReacher5::identifier(), 1, LevelReacher5::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 9 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Summit of QuestTrait {
    fn identifier() -> felt252 {
        'SUMMIT'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Summit",
            description: "The sixth floor has a view.",
            icon: "fa-mountain-sun",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(LevelReacher6::identifier(), 1, LevelReacher6::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 4 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_HARD,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
