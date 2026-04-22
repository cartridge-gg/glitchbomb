use quest::types::task::{Task as QuestTask, TaskTrait as QuestTaskTrait};
use starknet::ContractAddress;
use crate::elements::tasks::shopper::{ShopRich80, Spender};
use super::index::{
    INTERVAL_EASY_TWO, INTERVAL_HARD, INTERVAL_MEDIUM_TWO, ONE_DAY, QuestMetadataTrait, QuestProps,
    QuestTrait,
};

pub impl SmallSpender of QuestTrait {
    fn identifier() -> felt252 {
        'SMALL_SPENDER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 80;
        let metadata = QuestMetadataTrait::new(
            name: "Small Spender",
            description: "Burning holes in light pockets.",
            icon: "fa-piggy-bank",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Spender::identifier(), total.into(), Spender::description(total)),
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

pub impl BigSpender of QuestTrait {
    fn identifier() -> felt252 {
        'BIG_SPENDER'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let total: u32 = 200;
        let metadata = QuestMetadataTrait::new(
            name: "Big Spender",
            description: "Money talks, and yours is loud.",
            icon: "fa-money-bill-wave",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(Spender::identifier(), total.into(), Spender::description(total)),
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

pub impl FatWallet of QuestTrait {
    fn identifier() -> felt252 {
        'FAT_WALLET'
    }

    fn props(registry: ContractAddress) -> QuestProps {
        let metadata = QuestMetadataTrait::new(
            name: "Fat Wallet",
            description: "Shop with the big boys.",
            icon: "fa-money-bills",
            registry: registry,
            rewards: [].span(),
        );
        let tasks: Array<QuestTask> = array![
            QuestTaskTrait::new(ShopRich80::identifier(), 1, ShopRich80::description(0)),
        ];
        QuestProps {
            id: Self::identifier(),
            start: 2 * ONE_DAY,
            end: 0,
            duration: ONE_DAY,
            interval: INTERVAL_HARD,
            tasks: tasks,
            conditions: array![],
            metadata: metadata,
        }
    }
}
