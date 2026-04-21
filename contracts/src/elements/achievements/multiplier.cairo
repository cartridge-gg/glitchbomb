use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl SkyHigh of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'SKY_HIGH'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Sky High',
            description: "Two peaks, no breath between them.",
            icon: 'fa-cloud-arrow-up',
            points: 40,
            hidden: false,
            index: 0,
            group: 'Multiplier',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::SkyHigh.tasks(1), metadata: metadata,
        }
    }
}

pub impl ToTheMoon of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'TO_THE_MOON'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'To The Moon',
            description: "Stonks only go up.",
            icon: 'fa-rocket',
            points: 60,
            hidden: false,
            index: 1,
            group: 'Multiplier',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::ToTheMoon.tasks(1), metadata: metadata,
        }
    }
}
