use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::bag::{BagCopies4, BagCopies5, BagCopies6, BagSize20, BagSize25};
use super::index::{
    INTERVAL_MEDIUM_ONE, INTERVAL_MEDIUM_TWO, ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait,
};

pub impl ComfortZone of QuestTrait {
    fn identifier() -> felt252 {
        'COMFORT_ZONE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Comfort Zone",
            description: "Room to breathe, room to pull.",
            icon: "fa-house",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(BagSize25::identifier(), 1, BagSize25::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 8 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl TwinPeaks of QuestTrait {
    fn identifier() -> felt252 {
        'TWIN_PEAKS'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Twin Peaks",
            description: "Doubles, quadrupled.",
            icon: "fa-mountain-city",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(BagCopies4::identifier(), 1, BagCopies4::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 14 * ONE_DAY,
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
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl FullHouse of QuestTrait {
    fn identifier() -> felt252 {
        'FULL_HOUSE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Full House",
            description: "Six chairs, all the same face.",
            icon: "fa-users",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(BagCopies6::identifier(), 1, BagCopies6::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 13 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
