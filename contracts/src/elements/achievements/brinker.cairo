use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl Defused of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'DEFUSED'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Defused',
            description: "Cut the red wire. Then the blue. Then the bag.",
            icon: 'fa-shield',
            points: 15,
            hidden: false,
            index: 0,
            group: 'Brinker',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Defused.tasks(1), metadata: metadata,
        }
    }
}

pub impl Flatline of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FLATLINE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Flatline',
            description: "No more points to give.",
            icon: 'fa-heart-crack',
            points: 15,
            hidden: false,
            index: 1,
            group: 'Brinker',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Flatline.tasks(1), metadata: metadata,
        }
    }
}

pub impl WhatNow of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'WHAT_NOW'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'What Now?',
            description: "The bag is empty. The void stares back.",
            icon: 'fa-circle-question',
            points: 15,
            hidden: false,
            index: 2,
            group: 'Brinker',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::WhatNow.tasks(1), metadata: metadata,
        }
    }
}
