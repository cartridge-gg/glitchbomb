use achievement::types::metadata::MetadataTrait;
use crate::elements::achievements::index::AchievementProps;
use crate::elements::achievements::interface::AchievementTrait;
use crate::elements::tasks::index::{Task, TaskTrait};

pub impl Hacker of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'HACKER'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Hacker',
            description: "First taste of the matrix.",
            icon: 'fa-user-secret',
            points: 20,
            hidden: false,
            index: 0,
            group: 'Loyalty',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Loyalty.tasks(500), metadata: metadata,
        }
    }
}

pub impl Hardwired of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'HARDWIRED'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Hardwired',
            description: "Built different. Soldered in.",
            icon: 'fa-microchip',
            points: 40,
            hidden: false,
            index: 1,
            group: 'Loyalty',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Loyalty.tasks(1_000), metadata: metadata,
        }
    }
}

pub impl Jailbroken of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'JAILBROKEN'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Jailbroken',
            description: "Walls were just a suggestion.",
            icon: 'fa-unlock-keyhole',
            points: 60,
            hidden: false,
            index: 2,
            group: 'Loyalty',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Loyalty.tasks(2_500), metadata: metadata,
        }
    }
}

pub impl SysAdmin of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'SYS_ADMIN'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'SysAdmin',
            description: "The ops never sleep.",
            icon: 'fa-terminal',
            points: 80,
            hidden: false,
            index: 3,
            group: 'Loyalty',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Loyalty.tasks(5_000), metadata: metadata,
        }
    }
}

pub impl RootAccess of AchievementTrait {
    #[inline]
    fn identifier() -> felt252 {
        'ROOT_ACCESS'
    }

    #[inline]
    fn props() -> AchievementProps {
        let metadata = MetadataTrait::new(
            title: 'Root Access',
            description: "Keys to the kernel. Run anything.",
            icon: 'fa-key',
            points: 100,
            hidden: false,
            index: 4,
            group: 'Loyalty',
            rewards: [].span(),
            data: "",
        );
        AchievementProps {
            id: Self::identifier(), tasks: Task::Loyalty.tasks(10_000), metadata: metadata,
        }
    }
}
