use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl Harvest of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'HARVEST'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Harvest',
            description: "Make hay while the moon shines.",
            icon: 'fa-wheat-awn',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Moonrock',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Harvest.tasks(1), metadata: metadata,
        }
    }
}

pub impl Jackpot of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'JACKPOT'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Jackpot',
            description: "Three cherries on the lunar reel.",
            icon: 'fa-coins',
            points: 40,
            hidden: false,
            index: 1,
            group: 'Moonrock',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Jackpot.tasks(1), metadata: metadata,
        }
    }
}

pub impl InOrbit of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'IN_ORBIT'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'In Orbit',
            description: "Caught in the gravity of the win.",
            icon: 'fa-satellite',
            points: 20,
            hidden: false,
            index: 2,
            group: 'Moonrock',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Lunarian.tasks(25), metadata: metadata,
        }
    }
}

pub impl Lunatic of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'LUNATIC'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Lunatic',
            description: "Mad about the moon, and proud of it.",
            icon: 'fa-moon',
            points: 60,
            hidden: false,
            index: 3,
            group: 'Moonrock',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Lunarian.tasks(100), metadata: metadata,
        }
    }
}

pub impl Moonshot of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'MOONSHOT'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Moonshot',
            description: "One small pull, one giant payday.",
            icon: 'fa-meteor',
            points: 20,
            hidden: false,
            index: 4,
            group: 'Moonrock',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Moonshot.tasks(1), metadata: metadata,
        }
    }
}

pub impl LunarEclipse of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'LUNAR_ECLIPSE'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Lunar Eclipse',
            description: "Total alignment, total payout.",
            icon: 'fa-circle-half-stroke',
            points: 40,
            hidden: false,
            index: 5,
            group: 'Moonrock',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::LunarEclipse.tasks(1), metadata: metadata,
        }
    }
}

pub impl Supernova of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'SUPERNOVA'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Supernova',
            description: "Outshone the whole sky on the way out.",
            icon: 'fa-explosion',
            points: 60,
            hidden: false,
            index: 6,
            group: 'Moonrock',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Supernova.tasks(1), metadata: metadata,
        }
    }
}

pub impl InfiniteGlitch of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'INFINITE_GLITCH'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Infinite Glitch',
            description: "Broke the simulation, kept the loot.",
            icon: 'fa-infinity',
            points: 100,
            hidden: false,
            index: 7,
            group: 'Moonrock',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::InfiniteGlitch.tasks(1), metadata: metadata,
        }
    }
}
