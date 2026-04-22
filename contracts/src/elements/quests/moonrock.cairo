use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::moonrock::{CashOut125, CashOut150, CashOut180, Harvest80, Survivor1};
use super::index::{
    INTERVAL_EASY_ONE, INTERVAL_HARD, INTERVAL_MEDIUM_TWO, ONE_DAY, QuestMetadataTrait, QuestProps,
    QuestTrait,
};

// --- Easy One ---

pub impl QuickExit of QuestTrait {
    fn identifier() -> felt252 {
        'QUICK_EXIT'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Quick Exit",
            description: "Take the money and run.",
            icon: "fa-door-open",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(CashOut125::identifier(), 1, CashOut125::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 3 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

// --- Medium Two ---

pub impl HairTrigger of QuestTrait {
    fn identifier() -> felt252 {
        'HAIR_TRIGGER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Hair Trigger",
            description: "Cash out while the heart still beats.",
            icon: "fa-heart-pulse",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Survivor1::identifier(), 1, Survivor1::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 4 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Bankroll of QuestTrait {
    fn identifier() -> felt252 {
        'BANKROLL'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Bankroll",
            description: "A hundred and fifty reasons to go home.",
            icon: "fa-sack-dollar",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(CashOut150::identifier(), 1, CashOut150::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 5 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

// --- Hard ---

pub impl GoldenParachute of QuestTrait {
    fn identifier() -> felt252 {
        'GOLDEN_PARACHUTE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Golden Parachute",
            description: "Touch down with the loot intact.",
            icon: "fa-parachute-box",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(CashOut180::identifier(), 1, CashOut180::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_HARD,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl GoldRush of QuestTrait {
    fn identifier() -> felt252 {
        'GOLD_RUSH'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Gold Rush",
            description: "Strike it rich, one level deep.",
            icon: "fa-cubes-stacked",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Harvest80::identifier(), 1, Harvest80::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 6 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_HARD,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
