use achievement::types::metadata::{AchievementMetadata, MetadataTrait};
use achievement::types::task::Task as AchievementTask;
use crate::elements::achievements;
pub use crate::elements::achievements::interface::AchievementTrait;

// Constants

pub const ACHIEVEMENT_COUNT: u8 = 39;

// Types

#[derive(Drop)]
pub struct AchievementProps {
    pub id: felt252,
    pub tasks: Span<AchievementTask>,
    pub metadata: AchievementMetadata,
}

#[derive(Copy, Drop)]
pub enum AchievementType {
    None,
    // Conqueror
    Victory,
    Elite,
    Royalty,
    Flawless,
    NeverSurrender,
    WhatBombs,
    // Scorer
    Surge,
    Overload,
    Bottomless,
    // Multiplier
    SkyHigh,
    ToTheMoon,
    // Shopper
    Shopaholic,
    SoldOut,
    DiamondHands,
    // Moonrock
    Harvest,
    Jackpot,
    InOrbit,
    Lunatic,
    Moonshot,
    LunarEclipse,
    Supernova,
    InfiniteGlitch,
    // Composer
    Linear,
    Exponential,
    Metagamer,
    Medic,
    Immortal,
    // Sequencer
    FullyTorqued,
    Cursed,
    WraithForm,
    Armageddon,
    // Brinker
    Defused,
    Flatline,
    WhatNow,
    // Loyalty
    Hacker,
    Hardwired,
    Jailbroken,
    SysAdmin,
    RootAccess,
}

#[generate_trait]
pub impl AchievementImpl of IAchievement {
    #[inline]
    fn identifier(self: AchievementType) -> felt252 {
        match self {
            AchievementType::None => 0,
            AchievementType::Victory => achievements::conqueror::Victory::identifier(),
            AchievementType::Elite => achievements::conqueror::Elite::identifier(),
            AchievementType::Royalty => achievements::conqueror::Royalty::identifier(),
            AchievementType::Flawless => achievements::conqueror::Flawless::identifier(),
            AchievementType::NeverSurrender => achievements::conqueror::NeverSurrender::identifier(),
            AchievementType::WhatBombs => achievements::conqueror::WhatBombs::identifier(),
            AchievementType::Surge => achievements::scorer::Surge::identifier(),
            AchievementType::Overload => achievements::scorer::Overload::identifier(),
            AchievementType::Bottomless => achievements::scorer::Bottomless::identifier(),
            AchievementType::SkyHigh => achievements::multiplier::SkyHigh::identifier(),
            AchievementType::ToTheMoon => achievements::multiplier::ToTheMoon::identifier(),
            AchievementType::Shopaholic => achievements::shopper::Shopaholic::identifier(),
            AchievementType::SoldOut => achievements::shopper::SoldOut::identifier(),
            AchievementType::DiamondHands => achievements::shopper::DiamondHands::identifier(),
            AchievementType::Harvest => achievements::moonrock::Harvest::identifier(),
            AchievementType::Jackpot => achievements::moonrock::Jackpot::identifier(),
            AchievementType::InOrbit => achievements::moonrock::InOrbit::identifier(),
            AchievementType::Lunatic => achievements::moonrock::Lunatic::identifier(),
            AchievementType::Moonshot => achievements::moonrock::Moonshot::identifier(),
            AchievementType::LunarEclipse => achievements::moonrock::LunarEclipse::identifier(),
            AchievementType::Supernova => achievements::moonrock::Supernova::identifier(),
            AchievementType::InfiniteGlitch => achievements::moonrock::InfiniteGlitch::identifier(),
            AchievementType::Linear => achievements::composer::Linear::identifier(),
            AchievementType::Exponential => achievements::composer::Exponential::identifier(),
            AchievementType::Metagamer => achievements::composer::Metagamer::identifier(),
            AchievementType::Medic => achievements::composer::Medic::identifier(),
            AchievementType::Immortal => achievements::composer::Immortal::identifier(),
            AchievementType::FullyTorqued => achievements::sequencer::FullyTorqued::identifier(),
            AchievementType::Cursed => achievements::sequencer::Cursed::identifier(),
            AchievementType::WraithForm => achievements::sequencer::WraithForm::identifier(),
            AchievementType::Armageddon => achievements::sequencer::Armageddon::identifier(),
            AchievementType::Defused => achievements::brinker::Defused::identifier(),
            AchievementType::Flatline => achievements::brinker::Flatline::identifier(),
            AchievementType::WhatNow => achievements::brinker::WhatNow::identifier(),
            AchievementType::Hacker => achievements::loyalty::Hacker::identifier(),
            AchievementType::Hardwired => achievements::loyalty::Hardwired::identifier(),
            AchievementType::Jailbroken => achievements::loyalty::Jailbroken::identifier(),
            AchievementType::SysAdmin => achievements::loyalty::SysAdmin::identifier(),
            AchievementType::RootAccess => achievements::loyalty::RootAccess::identifier(),
        }
    }

    #[inline]
    fn props(self: AchievementType) -> AchievementProps {
        match self {
            AchievementType::Victory => achievements::conqueror::Victory::props(),
            AchievementType::Elite => achievements::conqueror::Elite::props(),
            AchievementType::Royalty => achievements::conqueror::Royalty::props(),
            AchievementType::Flawless => achievements::conqueror::Flawless::props(),
            AchievementType::NeverSurrender => achievements::conqueror::NeverSurrender::props(),
            AchievementType::WhatBombs => achievements::conqueror::WhatBombs::props(),
            AchievementType::Surge => achievements::scorer::Surge::props(),
            AchievementType::Overload => achievements::scorer::Overload::props(),
            AchievementType::Bottomless => achievements::scorer::Bottomless::props(),
            AchievementType::SkyHigh => achievements::multiplier::SkyHigh::props(),
            AchievementType::ToTheMoon => achievements::multiplier::ToTheMoon::props(),
            AchievementType::Shopaholic => achievements::shopper::Shopaholic::props(),
            AchievementType::SoldOut => achievements::shopper::SoldOut::props(),
            AchievementType::DiamondHands => achievements::shopper::DiamondHands::props(),
            AchievementType::Harvest => achievements::moonrock::Harvest::props(),
            AchievementType::Jackpot => achievements::moonrock::Jackpot::props(),
            AchievementType::InOrbit => achievements::moonrock::InOrbit::props(),
            AchievementType::Lunatic => achievements::moonrock::Lunatic::props(),
            AchievementType::Moonshot => achievements::moonrock::Moonshot::props(),
            AchievementType::LunarEclipse => achievements::moonrock::LunarEclipse::props(),
            AchievementType::Supernova => achievements::moonrock::Supernova::props(),
            AchievementType::InfiniteGlitch => achievements::moonrock::InfiniteGlitch::props(),
            AchievementType::Linear => achievements::composer::Linear::props(),
            AchievementType::Exponential => achievements::composer::Exponential::props(),
            AchievementType::Metagamer => achievements::composer::Metagamer::props(),
            AchievementType::Medic => achievements::composer::Medic::props(),
            AchievementType::Immortal => achievements::composer::Immortal::props(),
            AchievementType::FullyTorqued => achievements::sequencer::FullyTorqued::props(),
            AchievementType::Cursed => achievements::sequencer::Cursed::props(),
            AchievementType::WraithForm => achievements::sequencer::WraithForm::props(),
            AchievementType::Armageddon => achievements::sequencer::Armageddon::props(),
            AchievementType::Defused => achievements::brinker::Defused::props(),
            AchievementType::Flatline => achievements::brinker::Flatline::props(),
            AchievementType::WhatNow => achievements::brinker::WhatNow::props(),
            AchievementType::Hacker => achievements::loyalty::Hacker::props(),
            AchievementType::Hardwired => achievements::loyalty::Hardwired::props(),
            AchievementType::Jailbroken => achievements::loyalty::Jailbroken::props(),
            AchievementType::SysAdmin => achievements::loyalty::SysAdmin::props(),
            AchievementType::RootAccess => achievements::loyalty::RootAccess::props(),
            _ => Default::default(),
        }
    }
}

impl IntoAchievementU8 of core::traits::Into<AchievementType, u8> {
    #[inline]
    fn into(self: AchievementType) -> u8 {
        match self {
            AchievementType::None => 0,
            AchievementType::Victory => 1,
            AchievementType::Elite => 2,
            AchievementType::Royalty => 3,
            AchievementType::Flawless => 4,
            AchievementType::NeverSurrender => 5,
            AchievementType::WhatBombs => 6,
            AchievementType::Surge => 7,
            AchievementType::Overload => 8,
            AchievementType::Bottomless => 9,
            AchievementType::SkyHigh => 10,
            AchievementType::ToTheMoon => 11,
            AchievementType::Shopaholic => 12,
            AchievementType::SoldOut => 13,
            AchievementType::DiamondHands => 14,
            AchievementType::Harvest => 15,
            AchievementType::Jackpot => 16,
            AchievementType::InOrbit => 17,
            AchievementType::Lunatic => 18,
            AchievementType::Moonshot => 19,
            AchievementType::LunarEclipse => 20,
            AchievementType::Supernova => 21,
            AchievementType::InfiniteGlitch => 22,
            AchievementType::Linear => 23,
            AchievementType::Exponential => 24,
            AchievementType::Metagamer => 25,
            AchievementType::Medic => 26,
            AchievementType::Immortal => 27,
            AchievementType::FullyTorqued => 28,
            AchievementType::Cursed => 29,
            AchievementType::WraithForm => 30,
            AchievementType::Armageddon => 31,
            AchievementType::Defused => 32,
            AchievementType::Flatline => 33,
            AchievementType::WhatNow => 34,
            AchievementType::Hacker => 35,
            AchievementType::Hardwired => 36,
            AchievementType::Jailbroken => 37,
            AchievementType::SysAdmin => 38,
            AchievementType::RootAccess => 39,
        }
    }
}

impl IntoU8Achievement of core::traits::Into<u8, AchievementType> {
    #[inline]
    fn into(self: u8) -> AchievementType {
        let card: felt252 = self.into();
        match card {
            0 => AchievementType::None,
            1 => AchievementType::Victory,
            2 => AchievementType::Elite,
            3 => AchievementType::Royalty,
            4 => AchievementType::Flawless,
            5 => AchievementType::NeverSurrender,
            6 => AchievementType::WhatBombs,
            7 => AchievementType::Surge,
            8 => AchievementType::Overload,
            9 => AchievementType::Bottomless,
            10 => AchievementType::SkyHigh,
            11 => AchievementType::ToTheMoon,
            12 => AchievementType::Shopaholic,
            13 => AchievementType::SoldOut,
            14 => AchievementType::DiamondHands,
            15 => AchievementType::Harvest,
            16 => AchievementType::Jackpot,
            17 => AchievementType::InOrbit,
            18 => AchievementType::Lunatic,
            19 => AchievementType::Moonshot,
            20 => AchievementType::LunarEclipse,
            21 => AchievementType::Supernova,
            22 => AchievementType::InfiniteGlitch,
            23 => AchievementType::Linear,
            24 => AchievementType::Exponential,
            25 => AchievementType::Metagamer,
            26 => AchievementType::Medic,
            27 => AchievementType::Immortal,
            28 => AchievementType::FullyTorqued,
            29 => AchievementType::Cursed,
            30 => AchievementType::WraithForm,
            31 => AchievementType::Armageddon,
            32 => AchievementType::Defused,
            33 => AchievementType::Flatline,
            34 => AchievementType::WhatNow,
            35 => AchievementType::Hacker,
            36 => AchievementType::Hardwired,
            37 => AchievementType::Jailbroken,
            38 => AchievementType::SysAdmin,
            39 => AchievementType::RootAccess,
            _ => AchievementType::None,
        }
    }
}

pub impl AchievementPropsDefault of core::traits::Default<AchievementProps> {
    #[inline]
    fn default() -> AchievementProps {
        AchievementProps {
            id: 0,
            tasks: [].span(),
            metadata: MetadataTrait::new(
                title: '',
                description: "",
                icon: '',
                points: 0,
                hidden: false,
                index: 0,
                group: '',
                rewards: [].span(),
                data: "",
            ),
        }
    }
}
