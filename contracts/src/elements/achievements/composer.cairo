use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl Linear of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'LINEAR'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Linear',
            description: "Straight and narrow, all signal.",
            icon: 'fa-chart-line',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Composer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Linear.tasks(1), metadata: metadata,
        }
    }
}

pub impl Exponential of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'EXPONENTIAL'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Exponential',
            description: "Compound interest, in physical form.",
            icon: 'fa-arrow-trend-up',
            points: 30,
            hidden: false,
            index: 1,
            group: 'Composer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Exponential.tasks(1), metadata: metadata,
        }
    }
}

pub impl Metagamer of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'METAGAMER'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Metagamer',
            description: "Found the loophole and made it home.",
            icon: 'fa-chess',
            points: 40,
            hidden: false,
            index: 2,
            group: 'Composer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Metagamer.tasks(1), metadata: metadata,
        }
    }
}

pub impl Medic of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'MEDIC'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Medic',
            description: "First, do no harm. Then, heal everything.",
            icon: 'fa-kit-medical',
            points: 20,
            hidden: false,
            index: 3,
            group: 'Composer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps { id: Self::identifier(), tasks: Task::Medic.tasks(1), metadata: metadata }
    }
}

pub impl Immortal of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'IMMORTAL'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Immortal',
            description: "Death tried. Death failed.",
            icon: 'fa-heart-pulse',
            points: 40,
            hidden: false,
            index: 4,
            group: 'Composer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Immortal.tasks(1), metadata: metadata,
        }
    }
}
