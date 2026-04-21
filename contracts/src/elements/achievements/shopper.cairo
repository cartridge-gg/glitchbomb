use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl Shopaholic of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'SHOPAHOLIC'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Shopaholic',
            description: "Retail therapy, no questions asked.",
            icon: 'fa-cart-shopping',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Shopper',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Shopper10.tasks(1), metadata: metadata,
        }
    }
}

pub impl SoldOut of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'SOLD_OUT'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Sold Out',
            description: "The shelves are bare. You took it all.",
            icon: 'fa-store',
            points: 40,
            hidden: false,
            index: 1,
            group: 'Shopper',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Shopper15.tasks(1), metadata: metadata,
        }
    }
}

pub impl Specialist of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'SPECIALIST'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Specialist',
            description: "One trick. Mastered ten times over.",
            icon: 'fa-layer-group',
            points: 30,
            hidden: false,
            index: 2,
            group: 'Shopper',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Specialist.tasks(1), metadata: metadata,
        }
    }
}

pub impl DiamondHands of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'DIAMOND_HANDS'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Diamond Hands',
            description: "Hold the line. Pockets stay sealed.",
            icon: 'fa-gem',
            points: 30,
            hidden: false,
            index: 3,
            group: 'Shopper',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::DiamondHands.tasks(1), metadata: metadata,
        }
    }
}
