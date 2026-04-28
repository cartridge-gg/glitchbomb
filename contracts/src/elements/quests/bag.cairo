use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::bag::{BagCopies5, BagSize20};
use super::index::{
    INTERVAL_MEDIUM_ONE, INTERVAL_MEDIUM_TWO, ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait,
};

pub impl FiveOfAKind of QuestTrait {
    fn identifier() -> felt252 {
        'FIVE_OF_A_KIND'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Five of a Kind",
            description: "A hand too good to fold.",
            icon: "fa-clone",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(BagCopies5::identifier(), 1, BagCopies5::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 2 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Hoarder of QuestTrait {
    fn identifier() -> felt252 {
        'HOARDER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Hoarder",
            description: "The bag is never full enough.",
            icon: "fa-bag-shopping",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(BagSize20::identifier(), 1, BagSize20::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
