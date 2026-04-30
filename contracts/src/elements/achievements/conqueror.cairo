use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl Victory of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'VICTORY'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Victory',
            description: "Welcome to the big leagues.",
            icon: 'fa-trophy',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Conqueror',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Conqueror.tasks(1), metadata: metadata,
        }
    }
}

pub impl Elite of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'ELITE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Elite',
            description: "The summit, ten times over.",
            icon: 'fa-medal',
            points: 40,
            hidden: false,
            index: 1,
            group: 'Conqueror',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Conqueror.tasks(10), metadata: metadata,
        }
    }
}

pub impl Royalty of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'ROYALTY'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Royalty',
            description: "Heavy is the head that wears the crown.",
            icon: 'fa-crown',
            points: 80,
            hidden: false,
            index: 2,
            group: 'Conqueror',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Conqueror.tasks(50), metadata: metadata,
        }
    }
}

pub impl Flawless of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FLAWLESS'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Flawless',
            description: "Not a single scratch on the paint.",
            icon: 'fa-shield-halved',
            points: 60,
            hidden: false,
            index: 3,
            group: 'Conqueror',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Flawless.tasks(1), metadata: metadata,
        }
    }
}

pub impl NeverSurrender of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'NEVER_SURRENDER'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Never Surrender',
            description: "Down to the wire, refusing to fall.",
            icon: 'fa-flag',
            points: 80,
            hidden: false,
            index: 4,
            group: 'Conqueror',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::NeverSurrender.tasks(1), metadata: metadata,
        }
    }
}

pub impl WhatBombs of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'WHAT_BOMBS'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'What Bombs?',
            description: "Played the whole song without missing a beat.",
            icon: 'fa-feather',
            points: 80,
            hidden: false,
            index: 5,
            group: 'Conqueror',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::WhatBombs.tasks(1), metadata: metadata,
        }
    }
}
