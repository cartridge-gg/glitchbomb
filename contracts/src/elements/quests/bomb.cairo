use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::sequencer::{
    Armageddon3, BombStreak3, BombStreak4, GameBombs10, GameBombs15,
};
use super::index::{
    INTERVAL_EASY_TWO, INTERVAL_HARD, INTERVAL_MEDIUM_ONE, INTERVAL_MEDIUM_TWO, ONE_DAY,
    QuestMetadataTrait, QuestProps, QuestTrait,
};

pub impl TripleThreat of QuestTrait {
    fn identifier() -> felt252 {
        'TRIPLE_THREAT'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Triple Threat",
            description: "Trouble comes in threes.",
            icon: "fa-burst",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Armageddon3::identifier(), 1, Armageddon3::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 8 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_EASY_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl ChainReaction of QuestTrait {
    fn identifier() -> felt252 {
        'CHAIN_REACTION'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Chain Reaction",
            description: "Bad luck loves company.",
            icon: "fa-link",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(BombStreak3::identifier(), 1, BombStreak3::description(0)),
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

pub impl Minesweeper of QuestTrait {
    fn identifier() -> felt252 {
        'MINESWEEPER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Minesweeper",
            description: "Clear the board, flag nothing.",
            icon: "fa-chess-board",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(GameBombs10::identifier(), 1, GameBombs10::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 16 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_ONE,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Jammed of QuestTrait {
    fn identifier() -> felt252 {
        'JAMMED'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Jammed",
            description: "Four in a row and no way out.",
            icon: "fa-lock",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(BombStreak4::identifier(), 1, BombStreak4::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 15 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_MEDIUM_TWO,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}

pub impl Minefield of QuestTrait {
    fn identifier() -> felt252 {
        'MINEFIELD'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Minefield",
            description: "Fifteen bombs, still standing.",
            icon: "fa-biohazard",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(GameBombs15::identifier(), 1, GameBombs15::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 5 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_HARD,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
