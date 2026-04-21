pub use quest::types::metadata::{QuestMetadata, QuestMetadataTrait};
pub use quest::types::reward::QuestReward;
pub use quest::types::task::Task as QuestTask;
use starknet::ContractAddress;
use crate::elements::quests;
pub use crate::elements::quests::interface::QuestTrait;
pub use crate::elements::tasks::index::{Task, TaskTrait};

// Constants

pub const QUEST_COUNT: u8 = 59;

pub const ONE_DAY: u64 = 24 * 60 * 60;

// Prime-sized daily lists. Each quest in a list has a unique start offset
// (0, 1, 2, ... size-1 days) and shares the list's interval. With daily
// rotation, each list surfaces exactly one quest per day. All five primes
// are distinct, guaranteeing maximum quest-combination variety.
//
//   Easy One   — 5 quests  rotating every 5 days
//   Easy Two   — 11 quests rotating every 11 days
//   Medium One — 17 quests rotating every 17 days
//   Medium Two — 19 quests rotating every 19 days
//   Hard       — 7 quests  rotating every 7 days
//
// Combined, the (Easy, Medium, Hard) triple repeats every LCM(5,7,11,17,19)
// = 124 355 days (~340 years).

pub const INTERVAL_EASY_ONE: u64 = 5 * ONE_DAY;
pub const INTERVAL_EASY_TWO: u64 = 11 * ONE_DAY;
pub const INTERVAL_MEDIUM_ONE: u64 = 17 * ONE_DAY;
pub const INTERVAL_MEDIUM_TWO: u64 = 19 * ONE_DAY;
pub const INTERVAL_HARD: u64 = 7 * ONE_DAY;

// Types

#[derive(Copy, Drop)]
pub enum QuestType {
    None,
    // Easy One (5 quests, interval 5 days)
    TripleTake,
    Connoisseur,
    SharpShot,
    Mileage,
    PowerUp,
    // Easy Two (11 quests, interval 11 days)
    PointHunter,
    WarmingUp,
    SmallSpender,
    DeepDive,
    QuickExit,
    FirstAid,
    BombSquad,
    Untouched,
    TripleThreat,
    Prospector,
    FirstSteps,
    // Medium One (17 quests, interval 17 days)
    Speedrunner,
    Roadrunner,
    ChainReaction,
    BigSpender,
    Bankroll,
    Quadruple,
    Cliffhanger,
    PocketFull,
    ComfortZone,
    CashGrab,
    Staircase,
    FifthGear,
    Regular,
    Midrange,
    TwinPeaks,
    Moonwalker,
    Minesweeper,
    // Medium Two (19 quests, interval 19 days)
    Hoarder,
    HighScorer,
    FiveOfAKind,
    Workaholic,
    Marathon,
    HairTrigger,
    TierClimber,
    LongHaul,
    AnteUp,
    FifthFloor,
    Frugal,
    Overachiever,
    LightningRound,
    FullHouse,
    SafetyNet,
    Jammed,
    Blitz,
    BulkOrder,
    BigPocket,
    // Hard (7 quests, interval 7 days)
    GoldenParachute,
    FieldMedic,
    FatWallet,
    Ironlung,
    Summit,
    Minefield,
    GoldRush,
}

#[derive(Clone, Drop, Serde)]
pub struct QuestProps {
    pub id: felt252,
    pub start: u64,
    pub end: u64,
    pub duration: u64,
    pub interval: u64,
    pub tasks: Array<QuestTask>,
    pub conditions: Array<felt252>,
    pub metadata: QuestMetadata,
}

#[generate_trait]
pub impl QuestImpl of IQuest {
    fn identifier(self: QuestType) -> felt252 {
        match self {
            QuestType::None => 0,
            QuestType::TripleTake => quests::multiplier::TripleTake::identifier(),
            QuestType::Connoisseur => quests::orb::Connoisseur::identifier(),
            QuestType::SharpShot => quests::points::SharpShot::identifier(),
            QuestType::Mileage => quests::orb::Mileage::identifier(),
            QuestType::PowerUp => quests::orb::PowerUp::identifier(),
            QuestType::PointHunter => quests::orb::PointHunter::identifier(),
            QuestType::WarmingUp => quests::session::WarmingUp::identifier(),
            QuestType::SmallSpender => quests::shop::SmallSpender::identifier(),
            QuestType::DeepDive => quests::orb::DeepDive::identifier(),
            QuestType::QuickExit => quests::moonrock::QuickExit::identifier(),
            QuestType::FirstAid => quests::orb::FirstAid::identifier(),
            QuestType::BombSquad => quests::orb::BombSquad::identifier(),
            QuestType::Untouched => quests::level::Untouched::identifier(),
            QuestType::TripleThreat => quests::bomb::TripleThreat::identifier(),
            QuestType::Prospector => quests::moonrock::Prospector::identifier(),
            QuestType::FirstSteps => quests::level::FirstSteps::identifier(),
            QuestType::Speedrunner => quests::points::Speedrunner::identifier(),
            QuestType::Roadrunner => quests::orb::Roadrunner::identifier(),
            QuestType::ChainReaction => quests::bomb::ChainReaction::identifier(),
            QuestType::BigSpender => quests::shop::BigSpender::identifier(),
            QuestType::Bankroll => quests::moonrock::Bankroll::identifier(),
            QuestType::Quadruple => quests::multiplier::Quadruple::identifier(),
            QuestType::Cliffhanger => quests::level::Cliffhanger::identifier(),
            QuestType::PocketFull => quests::orb::PocketFull::identifier(),
            QuestType::ComfortZone => quests::bag::ComfortZone::identifier(),
            QuestType::CashGrab => quests::moonrock::CashGrab::identifier(),
            QuestType::Staircase => quests::level::Staircase::identifier(),
            QuestType::FifthGear => quests::multiplier::FifthGear::identifier(),
            QuestType::Regular => quests::session::Regular::identifier(),
            QuestType::Midrange => quests::points::Midrange::identifier(),
            QuestType::TwinPeaks => quests::bag::TwinPeaks::identifier(),
            QuestType::Moonwalker => quests::moonrock::Moonwalker::identifier(),
            QuestType::Minesweeper => quests::bomb::Minesweeper::identifier(),
            QuestType::Hoarder => quests::bag::Hoarder::identifier(),
            QuestType::HighScorer => quests::points::HighScorer::identifier(),
            QuestType::FiveOfAKind => quests::bag::FiveOfAKind::identifier(),
            QuestType::Workaholic => quests::session::Workaholic::identifier(),
            QuestType::Marathon => quests::orb::Marathon::identifier(),
            QuestType::HairTrigger => quests::moonrock::HairTrigger::identifier(),
            QuestType::TierClimber => quests::level::TierClimber::identifier(),
            QuestType::LongHaul => quests::orb::LongHaul::identifier(),
            QuestType::AnteUp => quests::moonrock::AnteUp::identifier(),
            QuestType::FifthFloor => quests::level::FifthFloor::identifier(),
            QuestType::Frugal => quests::shop::Frugal::identifier(),
            QuestType::Overachiever => quests::points::Overachiever::identifier(),
            QuestType::LightningRound => quests::points::LightningRound::identifier(),
            QuestType::FullHouse => quests::bag::FullHouse::identifier(),
            QuestType::SafetyNet => quests::moonrock::SafetyNet::identifier(),
            QuestType::Jammed => quests::bomb::Jammed::identifier(),
            QuestType::Blitz => quests::orb::Blitz::identifier(),
            QuestType::BulkOrder => quests::shop::BulkOrder::identifier(),
            QuestType::BigPocket => quests::orb::BigPocket::identifier(),
            QuestType::GoldenParachute => quests::moonrock::GoldenParachute::identifier(),
            QuestType::FieldMedic => quests::health::FieldMedic::identifier(),
            QuestType::FatWallet => quests::shop::FatWallet::identifier(),
            QuestType::Ironlung => quests::orb::Ironlung::identifier(),
            QuestType::Summit => quests::level::Summit::identifier(),
            QuestType::Minefield => quests::bomb::Minefield::identifier(),
            QuestType::GoldRush => quests::moonrock::GoldRush::identifier(),
        }
    }

    fn props(self: QuestType, registry: ContractAddress) -> QuestProps {
        match self {
            QuestType::TripleTake => quests::multiplier::TripleTake::props(registry),
            QuestType::Connoisseur => quests::orb::Connoisseur::props(registry),
            QuestType::SharpShot => quests::points::SharpShot::props(registry),
            QuestType::Mileage => quests::orb::Mileage::props(registry),
            QuestType::PowerUp => quests::orb::PowerUp::props(registry),
            QuestType::PointHunter => quests::orb::PointHunter::props(registry),
            QuestType::WarmingUp => quests::session::WarmingUp::props(registry),
            QuestType::SmallSpender => quests::shop::SmallSpender::props(registry),
            QuestType::DeepDive => quests::orb::DeepDive::props(registry),
            QuestType::QuickExit => quests::moonrock::QuickExit::props(registry),
            QuestType::FirstAid => quests::orb::FirstAid::props(registry),
            QuestType::BombSquad => quests::orb::BombSquad::props(registry),
            QuestType::Untouched => quests::level::Untouched::props(registry),
            QuestType::TripleThreat => quests::bomb::TripleThreat::props(registry),
            QuestType::Prospector => quests::moonrock::Prospector::props(registry),
            QuestType::FirstSteps => quests::level::FirstSteps::props(registry),
            QuestType::Speedrunner => quests::points::Speedrunner::props(registry),
            QuestType::Roadrunner => quests::orb::Roadrunner::props(registry),
            QuestType::ChainReaction => quests::bomb::ChainReaction::props(registry),
            QuestType::BigSpender => quests::shop::BigSpender::props(registry),
            QuestType::Bankroll => quests::moonrock::Bankroll::props(registry),
            QuestType::Quadruple => quests::multiplier::Quadruple::props(registry),
            QuestType::Cliffhanger => quests::level::Cliffhanger::props(registry),
            QuestType::PocketFull => quests::orb::PocketFull::props(registry),
            QuestType::ComfortZone => quests::bag::ComfortZone::props(registry),
            QuestType::CashGrab => quests::moonrock::CashGrab::props(registry),
            QuestType::Staircase => quests::level::Staircase::props(registry),
            QuestType::FifthGear => quests::multiplier::FifthGear::props(registry),
            QuestType::Regular => quests::session::Regular::props(registry),
            QuestType::Midrange => quests::points::Midrange::props(registry),
            QuestType::TwinPeaks => quests::bag::TwinPeaks::props(registry),
            QuestType::Moonwalker => quests::moonrock::Moonwalker::props(registry),
            QuestType::Minesweeper => quests::bomb::Minesweeper::props(registry),
            QuestType::Hoarder => quests::bag::Hoarder::props(registry),
            QuestType::HighScorer => quests::points::HighScorer::props(registry),
            QuestType::FiveOfAKind => quests::bag::FiveOfAKind::props(registry),
            QuestType::Workaholic => quests::session::Workaholic::props(registry),
            QuestType::Marathon => quests::orb::Marathon::props(registry),
            QuestType::HairTrigger => quests::moonrock::HairTrigger::props(registry),
            QuestType::TierClimber => quests::level::TierClimber::props(registry),
            QuestType::LongHaul => quests::orb::LongHaul::props(registry),
            QuestType::AnteUp => quests::moonrock::AnteUp::props(registry),
            QuestType::FifthFloor => quests::level::FifthFloor::props(registry),
            QuestType::Frugal => quests::shop::Frugal::props(registry),
            QuestType::Overachiever => quests::points::Overachiever::props(registry),
            QuestType::LightningRound => quests::points::LightningRound::props(registry),
            QuestType::FullHouse => quests::bag::FullHouse::props(registry),
            QuestType::SafetyNet => quests::moonrock::SafetyNet::props(registry),
            QuestType::Jammed => quests::bomb::Jammed::props(registry),
            QuestType::Blitz => quests::orb::Blitz::props(registry),
            QuestType::BulkOrder => quests::shop::BulkOrder::props(registry),
            QuestType::BigPocket => quests::orb::BigPocket::props(registry),
            QuestType::GoldenParachute => quests::moonrock::GoldenParachute::props(registry),
            QuestType::FieldMedic => quests::health::FieldMedic::props(registry),
            QuestType::FatWallet => quests::shop::FatWallet::props(registry),
            QuestType::Ironlung => quests::orb::Ironlung::props(registry),
            QuestType::Summit => quests::level::Summit::props(registry),
            QuestType::Minefield => quests::bomb::Minefield::props(registry),
            QuestType::GoldRush => quests::moonrock::GoldRush::props(registry),
            _ => Default::default(),
        }
    }

    fn reward(self: QuestType) -> bool {
        false
    }
}

impl IntoQuestU8 of core::traits::Into<QuestType, u8> {
    fn into(self: QuestType) -> u8 {
        match self {
            QuestType::None => 0,
            QuestType::TripleTake => 1,
            QuestType::Connoisseur => 2,
            QuestType::SharpShot => 3,
            QuestType::Mileage => 4,
            QuestType::PowerUp => 5,
            QuestType::PointHunter => 6,
            QuestType::WarmingUp => 7,
            QuestType::SmallSpender => 8,
            QuestType::DeepDive => 9,
            QuestType::QuickExit => 10,
            QuestType::FirstAid => 11,
            QuestType::BombSquad => 12,
            QuestType::Untouched => 13,
            QuestType::TripleThreat => 14,
            QuestType::Prospector => 15,
            QuestType::FirstSteps => 16,
            QuestType::Speedrunner => 17,
            QuestType::Roadrunner => 18,
            QuestType::ChainReaction => 19,
            QuestType::BigSpender => 20,
            QuestType::Bankroll => 21,
            QuestType::Quadruple => 22,
            QuestType::Cliffhanger => 23,
            QuestType::PocketFull => 24,
            QuestType::ComfortZone => 25,
            QuestType::CashGrab => 26,
            QuestType::Staircase => 27,
            QuestType::FifthGear => 28,
            QuestType::Regular => 29,
            QuestType::Midrange => 30,
            QuestType::TwinPeaks => 31,
            QuestType::Moonwalker => 32,
            QuestType::Minesweeper => 33,
            QuestType::Hoarder => 34,
            QuestType::HighScorer => 35,
            QuestType::FiveOfAKind => 36,
            QuestType::Workaholic => 37,
            QuestType::Marathon => 38,
            QuestType::HairTrigger => 39,
            QuestType::TierClimber => 40,
            QuestType::LongHaul => 41,
            QuestType::AnteUp => 42,
            QuestType::FifthFloor => 43,
            QuestType::Frugal => 44,
            QuestType::Overachiever => 45,
            QuestType::LightningRound => 46,
            QuestType::FullHouse => 47,
            QuestType::SafetyNet => 48,
            QuestType::Jammed => 49,
            QuestType::Blitz => 50,
            QuestType::BulkOrder => 51,
            QuestType::BigPocket => 52,
            QuestType::GoldenParachute => 53,
            QuestType::FieldMedic => 54,
            QuestType::FatWallet => 55,
            QuestType::Ironlung => 56,
            QuestType::Summit => 57,
            QuestType::Minefield => 58,
            QuestType::GoldRush => 59,
        }
    }
}

impl IntoU8Quest of core::traits::Into<u8, QuestType> {
    fn into(self: u8) -> QuestType {
        match self {
            0 => QuestType::None,
            1 => QuestType::TripleTake,
            2 => QuestType::Connoisseur,
            3 => QuestType::SharpShot,
            4 => QuestType::Mileage,
            5 => QuestType::PowerUp,
            6 => QuestType::PointHunter,
            7 => QuestType::WarmingUp,
            8 => QuestType::SmallSpender,
            9 => QuestType::DeepDive,
            10 => QuestType::QuickExit,
            11 => QuestType::FirstAid,
            12 => QuestType::BombSquad,
            13 => QuestType::Untouched,
            14 => QuestType::TripleThreat,
            15 => QuestType::Prospector,
            16 => QuestType::FirstSteps,
            17 => QuestType::Speedrunner,
            18 => QuestType::Roadrunner,
            19 => QuestType::ChainReaction,
            20 => QuestType::BigSpender,
            21 => QuestType::Bankroll,
            22 => QuestType::Quadruple,
            23 => QuestType::Cliffhanger,
            24 => QuestType::PocketFull,
            25 => QuestType::ComfortZone,
            26 => QuestType::CashGrab,
            27 => QuestType::Staircase,
            28 => QuestType::FifthGear,
            29 => QuestType::Regular,
            30 => QuestType::Midrange,
            31 => QuestType::TwinPeaks,
            32 => QuestType::Moonwalker,
            33 => QuestType::Minesweeper,
            34 => QuestType::Hoarder,
            35 => QuestType::HighScorer,
            36 => QuestType::FiveOfAKind,
            37 => QuestType::Workaholic,
            38 => QuestType::Marathon,
            39 => QuestType::HairTrigger,
            40 => QuestType::TierClimber,
            41 => QuestType::LongHaul,
            42 => QuestType::AnteUp,
            43 => QuestType::FifthFloor,
            44 => QuestType::Frugal,
            45 => QuestType::Overachiever,
            46 => QuestType::LightningRound,
            47 => QuestType::FullHouse,
            48 => QuestType::SafetyNet,
            49 => QuestType::Jammed,
            50 => QuestType::Blitz,
            51 => QuestType::BulkOrder,
            52 => QuestType::BigPocket,
            53 => QuestType::GoldenParachute,
            54 => QuestType::FieldMedic,
            55 => QuestType::FatWallet,
            56 => QuestType::Ironlung,
            57 => QuestType::Summit,
            58 => QuestType::Minefield,
            59 => QuestType::GoldRush,
            _ => QuestType::None,
        }
    }
}

impl IntoFelt252Quest of core::traits::Into<felt252, QuestType> {
    fn into(self: felt252) -> QuestType {
        if self == quests::multiplier::TripleTake::identifier() {
            return QuestType::TripleTake;
        } else if self == quests::orb::Connoisseur::identifier() {
            return QuestType::Connoisseur;
        } else if self == quests::points::SharpShot::identifier() {
            return QuestType::SharpShot;
        } else if self == quests::orb::Mileage::identifier() {
            return QuestType::Mileage;
        } else if self == quests::orb::PowerUp::identifier() {
            return QuestType::PowerUp;
        } else if self == quests::orb::PointHunter::identifier() {
            return QuestType::PointHunter;
        } else if self == quests::session::WarmingUp::identifier() {
            return QuestType::WarmingUp;
        } else if self == quests::shop::SmallSpender::identifier() {
            return QuestType::SmallSpender;
        } else if self == quests::orb::DeepDive::identifier() {
            return QuestType::DeepDive;
        } else if self == quests::moonrock::QuickExit::identifier() {
            return QuestType::QuickExit;
        } else if self == quests::orb::FirstAid::identifier() {
            return QuestType::FirstAid;
        } else if self == quests::orb::BombSquad::identifier() {
            return QuestType::BombSquad;
        } else if self == quests::level::Untouched::identifier() {
            return QuestType::Untouched;
        } else if self == quests::bomb::TripleThreat::identifier() {
            return QuestType::TripleThreat;
        } else if self == quests::moonrock::Prospector::identifier() {
            return QuestType::Prospector;
        } else if self == quests::level::FirstSteps::identifier() {
            return QuestType::FirstSteps;
        } else if self == quests::points::Speedrunner::identifier() {
            return QuestType::Speedrunner;
        } else if self == quests::orb::Roadrunner::identifier() {
            return QuestType::Roadrunner;
        } else if self == quests::bomb::ChainReaction::identifier() {
            return QuestType::ChainReaction;
        } else if self == quests::shop::BigSpender::identifier() {
            return QuestType::BigSpender;
        } else if self == quests::moonrock::Bankroll::identifier() {
            return QuestType::Bankroll;
        } else if self == quests::multiplier::Quadruple::identifier() {
            return QuestType::Quadruple;
        } else if self == quests::level::Cliffhanger::identifier() {
            return QuestType::Cliffhanger;
        } else if self == quests::orb::PocketFull::identifier() {
            return QuestType::PocketFull;
        } else if self == quests::bag::ComfortZone::identifier() {
            return QuestType::ComfortZone;
        } else if self == quests::moonrock::CashGrab::identifier() {
            return QuestType::CashGrab;
        } else if self == quests::level::Staircase::identifier() {
            return QuestType::Staircase;
        } else if self == quests::multiplier::FifthGear::identifier() {
            return QuestType::FifthGear;
        } else if self == quests::session::Regular::identifier() {
            return QuestType::Regular;
        } else if self == quests::points::Midrange::identifier() {
            return QuestType::Midrange;
        } else if self == quests::bag::TwinPeaks::identifier() {
            return QuestType::TwinPeaks;
        } else if self == quests::moonrock::Moonwalker::identifier() {
            return QuestType::Moonwalker;
        } else if self == quests::bomb::Minesweeper::identifier() {
            return QuestType::Minesweeper;
        } else if self == quests::bag::Hoarder::identifier() {
            return QuestType::Hoarder;
        } else if self == quests::points::HighScorer::identifier() {
            return QuestType::HighScorer;
        } else if self == quests::bag::FiveOfAKind::identifier() {
            return QuestType::FiveOfAKind;
        } else if self == quests::session::Workaholic::identifier() {
            return QuestType::Workaholic;
        } else if self == quests::orb::Marathon::identifier() {
            return QuestType::Marathon;
        } else if self == quests::moonrock::HairTrigger::identifier() {
            return QuestType::HairTrigger;
        } else if self == quests::level::TierClimber::identifier() {
            return QuestType::TierClimber;
        } else if self == quests::orb::LongHaul::identifier() {
            return QuestType::LongHaul;
        } else if self == quests::moonrock::AnteUp::identifier() {
            return QuestType::AnteUp;
        } else if self == quests::level::FifthFloor::identifier() {
            return QuestType::FifthFloor;
        } else if self == quests::shop::Frugal::identifier() {
            return QuestType::Frugal;
        } else if self == quests::points::Overachiever::identifier() {
            return QuestType::Overachiever;
        } else if self == quests::points::LightningRound::identifier() {
            return QuestType::LightningRound;
        } else if self == quests::bag::FullHouse::identifier() {
            return QuestType::FullHouse;
        } else if self == quests::moonrock::SafetyNet::identifier() {
            return QuestType::SafetyNet;
        } else if self == quests::bomb::Jammed::identifier() {
            return QuestType::Jammed;
        } else if self == quests::orb::Blitz::identifier() {
            return QuestType::Blitz;
        } else if self == quests::shop::BulkOrder::identifier() {
            return QuestType::BulkOrder;
        } else if self == quests::orb::BigPocket::identifier() {
            return QuestType::BigPocket;
        } else if self == quests::moonrock::GoldenParachute::identifier() {
            return QuestType::GoldenParachute;
        } else if self == quests::health::FieldMedic::identifier() {
            return QuestType::FieldMedic;
        } else if self == quests::shop::FatWallet::identifier() {
            return QuestType::FatWallet;
        } else if self == quests::orb::Ironlung::identifier() {
            return QuestType::Ironlung;
        } else if self == quests::level::Summit::identifier() {
            return QuestType::Summit;
        } else if self == quests::bomb::Minefield::identifier() {
            return QuestType::Minefield;
        } else if self == quests::moonrock::GoldRush::identifier() {
            return QuestType::GoldRush;
        }
        return QuestType::None;
    }
}

pub impl QuestPropsDefault of core::traits::Default<QuestProps> {
    fn default() -> QuestProps {
        QuestProps {
            id: 0,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: array![],
            conditions: array![],
            metadata: QuestMetadata {
                name: "",
                description: "",
                icon: "",
                registry: 0.try_into().unwrap(),
                rewards: array![].span(),
            },
        }
    }
}
