use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl FullyTorqued of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FULLY_TORQUED'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Fully Torqued',
            description: "All gears spinning, all bolts tight.",
            icon: 'fa-gears',
            points: 40,
            hidden: false,
            index: 0,
            group: 'Sequencer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::FullyTorqued.tasks(1), metadata: metadata,
        }
    }
}

pub impl Cursed of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'CURSED'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Cursed',
            description: "Born under a falling star.",
            icon: 'fa-skull',
            points: 20,
            hidden: false,
            index: 1,
            group: 'Sequencer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::BombStreak4.tasks(1), metadata: metadata,
        }
    }
}

pub impl WraithForm of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'WRAITH_FORM'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Wraith Form',
            description: "Walked through the storm, came out a ghost.",
            icon: 'fa-ghost',
            points: 50,
            hidden: false,
            index: 2,
            group: 'Sequencer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::BombStreak5.tasks(1), metadata: metadata,
        }
    }
}

pub impl Armageddon of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'ARMAGEDDON'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Armageddon',
            description: "End times, four rounds at a time.",
            icon: 'fa-bomb',
            points: 70,
            hidden: false,
            index: 3,
            group: 'Sequencer',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Armageddon4.tasks(1), metadata: metadata,
        }
    }
}
