use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl Surge of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'SURGE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Surge',
            description: "Lightning in a bottle, uncorked.",
            icon: 'fa-bolt',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Scorer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps { id: Self::identifier(), tasks: Task::Surge.tasks(1), metadata: metadata }
    }
}

pub impl Overload of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'OVERLOAD'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Overload',
            description: "The breakers tripped on impact.",
            icon: 'fa-bolt-lightning',
            points: 40,
            hidden: false,
            index: 1,
            group: 'Scorer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Overload.tasks(1), metadata: metadata,
        }
    }
}

pub impl Bottomless of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'BOTTOMLESS'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Bottomless',
            description: "Reach in deeper, the bag never ends.",
            icon: 'fa-arrow-down-wide-short',
            points: 30,
            hidden: false,
            index: 2,
            group: 'Scorer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Bottomless.tasks(1), metadata: metadata,
        }
    }
}
