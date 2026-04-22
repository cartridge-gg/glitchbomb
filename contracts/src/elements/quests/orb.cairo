use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::puller::{
    BombPuller, HealthPuller, MultiplierPuller, OrbPuller, PointsPuller, SpecialPuller,
};
use crate::elements::tasks::scorer::{Bottomless15, Bottomless25, Bottomless40};
use super::index::{
    INTERVAL_EASY_ONE, INTERVAL_EASY_TWO, INTERVAL_HARD, INTERVAL_MEDIUM_ONE, INTERVAL_MEDIUM_TWO,
    ONE_DAY, QuestMetadataTrait, QuestProps, QuestTrait,
};

// --- Easy One ---

pub impl PointHunter of QuestTrait {
    fn identifier() -> felt252 {
        'POINT_HUNTER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 30;
        let metadata = QuestMetadataTrait::new(
            name: "Point Hunter",
            description: "Thirty reasons to keep pulling.",
            icon: "fa-crosshairs",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                PointsPuller::identifier(), total.into(), PointsPuller::description(total),
            ),
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

pub impl Mileage of QuestTrait {
    fn identifier() -> felt252 {
        'MILEAGE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 40;
        let metadata = QuestMetadataTrait::new(
            name: "Mileage",
            description: "Forty orbs down, the journey unfolds.",
            icon: "fa-route",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                OrbPuller::identifier(), total.into(), OrbPuller::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 5 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

// --- Easy Two ---

pub impl Connoisseur of QuestTrait {
    fn identifier() -> felt252 {
        'CONNOISSEUR'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 10;
        let metadata = QuestMetadataTrait::new(
            name: "Connoisseur",
            description: "An eye for the rare and unusual.",
            icon: "fa-star",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                SpecialPuller::identifier(), total.into(), SpecialPuller::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 0,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl DeepDive of QuestTrait {
    fn identifier() -> felt252 {
        'DEEP_DIVE'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Deep Dive",
            description: "The bag goes on and on.",
            icon: "fa-hand",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Bottomless15::identifier(), 1, Bottomless15::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 2 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl FirstAid of QuestTrait {
    fn identifier() -> felt252 {
        'FIRST_AID'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 5;
        let metadata = QuestMetadataTrait::new(
            name: "First Aid",
            description: "Stitched up, five times over.",
            icon: "fa-suitcase-medical",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                HealthPuller::identifier(), total.into(), HealthPuller::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 3 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl BombSquad of QuestTrait {
    fn identifier() -> felt252 {
        'BOMB_SQUAD'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 10;
        let metadata = QuestMetadataTrait::new(
            name: "Bomb Squad",
            description: "Danger is just opportunity dressed up.",
            icon: "fa-bomb",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                BombPuller::identifier(), total.into(), BombPuller::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 4 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl PowerUp of QuestTrait {
    fn identifier() -> felt252 {
        'POWER_UP'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 15;
        let metadata = QuestMetadataTrait::new(
            name: "Power Up",
            description: "Fifteen gears clicked into place.",
            icon: "fa-wand-magic-sparkles",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                MultiplierPuller::identifier(), total.into(), MultiplierPuller::description(total),
            ),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 6 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

// --- Medium One ---

pub impl Marathon of QuestTrait {
    fn identifier() -> felt252 {
        'MARATHON'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Marathon",
            description: "Twenty-five pulls, one long run.",
            icon: "fa-flag-checkered",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Bottomless25::identifier(), 1, Bottomless25::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 4 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

// --- Medium Two ---

pub impl Roadrunner of QuestTrait {
    fn identifier() -> felt252 {
        'ROADRUNNER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 70;
        let metadata = QuestMetadataTrait::new(
            name: "Roadrunner",
            description: "Seventy milestones in the rearview.",
            icon: "fa-person-running",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(
                OrbPuller::identifier(), total.into(), OrbPuller::description(total),
            ),
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

// --- Hard ---

pub impl Ironlung of QuestTrait {
    fn identifier() -> felt252 {
        'IRONLUNG'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Ironlung",
            description: "Forty pulls on a single breath.",
            icon: "fa-wind",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Bottomless40::identifier(), 1, Bottomless40::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 3 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_HARD,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
