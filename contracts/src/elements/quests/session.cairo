use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::loyalty::Loyalty;
use super::index::{
    INTERVAL_EASY_TWO, INTERVAL_MEDIUM_ONE, INTERVAL_MEDIUM_TWO, ONE_DAY, QuestMetadataTrait,
    QuestProps, QuestTrait,
};

pub impl WarmingUp of QuestTrait {
    fn identifier() -> felt252 {
        'WARMING_UP'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 3;
        let metadata = QuestMetadataTrait::new(
            name: "Warming Up",
            description: "First three rounds on the house.",
            icon: "fa-dice",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Loyalty::identifier(), total.into(), Loyalty::description(total)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Regular of QuestTrait {
    fn identifier() -> felt252 {
        'REGULAR'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 8;
        let metadata = QuestMetadataTrait::new(
            name: "Regular",
            description: "Same time, same seat, every time.",
            icon: "fa-rotate-right",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Loyalty::identifier(), total.into(), Loyalty::description(total)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 12 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Workaholic of QuestTrait {
    fn identifier() -> felt252 {
        'WORKAHOLIC'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 5;
        let metadata = QuestMetadataTrait::new(
            name: "Workaholic",
            description: "No rest, only runs.",
            icon: "fa-briefcase",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Loyalty::identifier(), total.into(), Loyalty::description(total)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 3 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
