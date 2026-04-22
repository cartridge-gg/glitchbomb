use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::multiplier::{Climber3, Climber4};
use super::index::{
    INTERVAL_EASY_ONE, INTERVAL_MEDIUM_ONE, ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait,
};

pub impl TripleTake of QuestTrait {
    fn identifier() -> felt252 {
        'TRIPLE_TAKE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Triple Take",
            description: "Third time's the charm.",
            icon: "fa-angles-up",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Climber3::identifier(), 1, Climber3::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Quadruple of QuestTrait {
    fn identifier() -> felt252 {
        'QUADRUPLE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Quadruple",
            description: "Four times the glory.",
            icon: "fa-forward",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Climber4::identifier(), 1, Climber4::description(0)),
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
