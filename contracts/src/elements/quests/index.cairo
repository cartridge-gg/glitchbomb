pub use quest::types::metadata::{QuestMetadata, QuestMetadataTrait};
pub use quest::types::reward::QuestReward;
pub use quest::types::task::Task as QuestTask;
use starknet::ContractAddress;
use crate::elements::quests;
pub use crate::elements::quests::interface::QuestTrait;
pub use crate::elements::tasks::index::{Task, TaskTrait};

// Constants

pub const QUEST_COUNT: u8 = 37;

pub const ONE_DAY: u64 = 24 * 60 * 60;

// Weekly quest rotation.
// Five lists (Easy One, Easy Two, Medium One, Medium Two, Hard) each contain
// 7 quests with unique start offsets (0–6 days) and share a 7-day interval.
// Each day surfaces exactly one quest per list, so 5 quests are active per
// day: 2 Easy + 2 Medium + 1 Hard. The full 7-day schedule repeats weekly.
//
// In addition, two "finisher" meta-quests (DailyFinisherThree and
// DailyFinisherFive) are always active and reward the player with a free
// game when 3 and 5 daily quests are completed respectively.

pub const INTERVAL_EASY_ONE: u64 = 7 * ONE_DAY;
pub const INTERVAL_EASY_TWO: u64 = 7 * ONE_DAY;
pub const INTERVAL_MEDIUM_ONE: u64 = 7 * ONE_DAY;
pub const INTERVAL_MEDIUM_TWO: u64 = 7 * ONE_DAY;
pub const INTERVAL_HARD: u64 = 7 * ONE_DAY;

// Types

#[derive(Copy, Drop)]
pub enum QuestType {
    None,
    // Easy One (Day 1–7)
    TripleTake,
    WarmingUp,
    PointHunter,
    QuickExit,
    SharpShot,
    Mileage,
    TripleThreat,
    // Easy Two (Day 1–7)
    Connoisseur,
    SmallSpender,
    DeepDive,
    FirstAid,
    BombSquad,
    Untouched,
    PowerUp,
    // Medium One (Day 1–7)
    Speedrunner,
    HighScorer,
    FiveOfAKind,
    Workaholic,
    Marathon,
    TierClimber,
    Quadruple,
    // Medium Two (Day 1–7)
    Hoarder,
    Roadrunner,
    ChainReaction,
    BigSpender,
    HairTrigger,
    Bankroll,
    Cliffhanger,
    // Hard (Day 1–7)
    GoldenParachute,
    FieldMedic,
    FatWallet,
    Ironlung,
    Summit,
    Minefield,
    GoldRush,
    // Finisher meta-quests (always active, reward a free game)
    DailyFinisherThree,
    DailyFinisherFive,
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
            QuestType::WarmingUp => quests::session::WarmingUp::identifier(),
            QuestType::PointHunter => quests::orb::PointHunter::identifier(),
            QuestType::QuickExit => quests::moonrock::QuickExit::identifier(),
            QuestType::SharpShot => quests::points::SharpShot::identifier(),
            QuestType::Mileage => quests::orb::Mileage::identifier(),
            QuestType::TripleThreat => quests::bomb::TripleThreat::identifier(),
            QuestType::Connoisseur => quests::orb::Connoisseur::identifier(),
            QuestType::SmallSpender => quests::shop::SmallSpender::identifier(),
            QuestType::DeepDive => quests::orb::DeepDive::identifier(),
            QuestType::FirstAid => quests::orb::FirstAid::identifier(),
            QuestType::BombSquad => quests::orb::BombSquad::identifier(),
            QuestType::Untouched => quests::level::Untouched::identifier(),
            QuestType::PowerUp => quests::orb::PowerUp::identifier(),
            QuestType::Speedrunner => quests::points::Speedrunner::identifier(),
            QuestType::HighScorer => quests::points::HighScorer::identifier(),
            QuestType::FiveOfAKind => quests::bag::FiveOfAKind::identifier(),
            QuestType::Workaholic => quests::session::Workaholic::identifier(),
            QuestType::Marathon => quests::orb::Marathon::identifier(),
            QuestType::TierClimber => quests::level::TierClimber::identifier(),
            QuestType::Quadruple => quests::multiplier::Quadruple::identifier(),
            QuestType::Hoarder => quests::bag::Hoarder::identifier(),
            QuestType::Roadrunner => quests::orb::Roadrunner::identifier(),
            QuestType::ChainReaction => quests::bomb::ChainReaction::identifier(),
            QuestType::BigSpender => quests::shop::BigSpender::identifier(),
            QuestType::HairTrigger => quests::moonrock::HairTrigger::identifier(),
            QuestType::Bankroll => quests::moonrock::Bankroll::identifier(),
            QuestType::Cliffhanger => quests::level::Cliffhanger::identifier(),
            QuestType::GoldenParachute => quests::moonrock::GoldenParachute::identifier(),
            QuestType::FieldMedic => quests::health::FieldMedic::identifier(),
            QuestType::FatWallet => quests::shop::FatWallet::identifier(),
            QuestType::Ironlung => quests::orb::Ironlung::identifier(),
            QuestType::Summit => quests::level::Summit::identifier(),
            QuestType::Minefield => quests::bomb::Minefield::identifier(),
            QuestType::GoldRush => quests::moonrock::GoldRush::identifier(),
            QuestType::DailyFinisherThree => quests::finisher::DailyFinisherThree::identifier(),
            QuestType::DailyFinisherFive => quests::finisher::DailyFinisherFive::identifier(),
        }
    }

    fn props(self: QuestType, registry: ContractAddress) -> QuestProps {
        match self {
            QuestType::TripleTake => quests::multiplier::TripleTake::props(registry),
            QuestType::WarmingUp => quests::session::WarmingUp::props(registry),
            QuestType::PointHunter => quests::orb::PointHunter::props(registry),
            QuestType::QuickExit => quests::moonrock::QuickExit::props(registry),
            QuestType::SharpShot => quests::points::SharpShot::props(registry),
            QuestType::Mileage => quests::orb::Mileage::props(registry),
            QuestType::TripleThreat => quests::bomb::TripleThreat::props(registry),
            QuestType::Connoisseur => quests::orb::Connoisseur::props(registry),
            QuestType::SmallSpender => quests::shop::SmallSpender::props(registry),
            QuestType::DeepDive => quests::orb::DeepDive::props(registry),
            QuestType::FirstAid => quests::orb::FirstAid::props(registry),
            QuestType::BombSquad => quests::orb::BombSquad::props(registry),
            QuestType::Untouched => quests::level::Untouched::props(registry),
            QuestType::PowerUp => quests::orb::PowerUp::props(registry),
            QuestType::Speedrunner => quests::points::Speedrunner::props(registry),
            QuestType::HighScorer => quests::points::HighScorer::props(registry),
            QuestType::FiveOfAKind => quests::bag::FiveOfAKind::props(registry),
            QuestType::Workaholic => quests::session::Workaholic::props(registry),
            QuestType::Marathon => quests::orb::Marathon::props(registry),
            QuestType::TierClimber => quests::level::TierClimber::props(registry),
            QuestType::Quadruple => quests::multiplier::Quadruple::props(registry),
            QuestType::Hoarder => quests::bag::Hoarder::props(registry),
            QuestType::Roadrunner => quests::orb::Roadrunner::props(registry),
            QuestType::ChainReaction => quests::bomb::ChainReaction::props(registry),
            QuestType::BigSpender => quests::shop::BigSpender::props(registry),
            QuestType::HairTrigger => quests::moonrock::HairTrigger::props(registry),
            QuestType::Bankroll => quests::moonrock::Bankroll::props(registry),
            QuestType::Cliffhanger => quests::level::Cliffhanger::props(registry),
            QuestType::GoldenParachute => quests::moonrock::GoldenParachute::props(registry),
            QuestType::FieldMedic => quests::health::FieldMedic::props(registry),
            QuestType::FatWallet => quests::shop::FatWallet::props(registry),
            QuestType::Ironlung => quests::orb::Ironlung::props(registry),
            QuestType::Summit => quests::level::Summit::props(registry),
            QuestType::Minefield => quests::bomb::Minefield::props(registry),
            QuestType::GoldRush => quests::moonrock::GoldRush::props(registry),
            QuestType::DailyFinisherThree => quests::finisher::DailyFinisherThree::props(registry),
            QuestType::DailyFinisherFive => quests::finisher::DailyFinisherFive::props(registry),
            _ => Default::default(),
        }
    }

    fn reward(self: QuestType) -> bool {
        match self {
            QuestType::DailyFinisherThree => true,
            QuestType::DailyFinisherFive => true,
            _ => false,
        }
    }
}

impl IntoQuestU8 of core::traits::Into<QuestType, u8> {
    fn into(self: QuestType) -> u8 {
        match self {
            QuestType::None => 0,
            QuestType::TripleTake => 1,
            QuestType::WarmingUp => 2,
            QuestType::PointHunter => 3,
            QuestType::QuickExit => 4,
            QuestType::SharpShot => 5,
            QuestType::Mileage => 6,
            QuestType::TripleThreat => 7,
            QuestType::Connoisseur => 8,
            QuestType::SmallSpender => 9,
            QuestType::DeepDive => 10,
            QuestType::FirstAid => 11,
            QuestType::BombSquad => 12,
            QuestType::Untouched => 13,
            QuestType::PowerUp => 14,
            QuestType::Speedrunner => 15,
            QuestType::HighScorer => 16,
            QuestType::FiveOfAKind => 17,
            QuestType::Workaholic => 18,
            QuestType::Marathon => 19,
            QuestType::TierClimber => 20,
            QuestType::Quadruple => 21,
            QuestType::Hoarder => 22,
            QuestType::Roadrunner => 23,
            QuestType::ChainReaction => 24,
            QuestType::BigSpender => 25,
            QuestType::HairTrigger => 26,
            QuestType::Bankroll => 27,
            QuestType::Cliffhanger => 28,
            QuestType::GoldenParachute => 29,
            QuestType::FieldMedic => 30,
            QuestType::FatWallet => 31,
            QuestType::Ironlung => 32,
            QuestType::Summit => 33,
            QuestType::Minefield => 34,
            QuestType::GoldRush => 35,
            QuestType::DailyFinisherThree => 36,
            QuestType::DailyFinisherFive => 37,
        }
    }
}

impl IntoU8Quest of core::traits::Into<u8, QuestType> {
    fn into(self: u8) -> QuestType {
        match self {
            0 => QuestType::None,
            1 => QuestType::TripleTake,
            2 => QuestType::WarmingUp,
            3 => QuestType::PointHunter,
            4 => QuestType::QuickExit,
            5 => QuestType::SharpShot,
            6 => QuestType::Mileage,
            7 => QuestType::TripleThreat,
            8 => QuestType::Connoisseur,
            9 => QuestType::SmallSpender,
            10 => QuestType::DeepDive,
            11 => QuestType::FirstAid,
            12 => QuestType::BombSquad,
            13 => QuestType::Untouched,
            14 => QuestType::PowerUp,
            15 => QuestType::Speedrunner,
            16 => QuestType::HighScorer,
            17 => QuestType::FiveOfAKind,
            18 => QuestType::Workaholic,
            19 => QuestType::Marathon,
            20 => QuestType::TierClimber,
            21 => QuestType::Quadruple,
            22 => QuestType::Hoarder,
            23 => QuestType::Roadrunner,
            24 => QuestType::ChainReaction,
            25 => QuestType::BigSpender,
            26 => QuestType::HairTrigger,
            27 => QuestType::Bankroll,
            28 => QuestType::Cliffhanger,
            29 => QuestType::GoldenParachute,
            30 => QuestType::FieldMedic,
            31 => QuestType::FatWallet,
            32 => QuestType::Ironlung,
            33 => QuestType::Summit,
            34 => QuestType::Minefield,
            35 => QuestType::GoldRush,
            36 => QuestType::DailyFinisherThree,
            37 => QuestType::DailyFinisherFive,
            _ => QuestType::None,
        }
    }
}

impl IntoFelt252Quest of core::traits::Into<felt252, QuestType> {
    fn into(self: felt252) -> QuestType {
        if self == quests::multiplier::TripleTake::identifier() {
            return QuestType::TripleTake;
        } else if self == quests::session::WarmingUp::identifier() {
            return QuestType::WarmingUp;
        } else if self == quests::orb::PointHunter::identifier() {
            return QuestType::PointHunter;
        } else if self == quests::moonrock::QuickExit::identifier() {
            return QuestType::QuickExit;
        } else if self == quests::points::SharpShot::identifier() {
            return QuestType::SharpShot;
        } else if self == quests::orb::Mileage::identifier() {
            return QuestType::Mileage;
        } else if self == quests::bomb::TripleThreat::identifier() {
            return QuestType::TripleThreat;
        } else if self == quests::orb::Connoisseur::identifier() {
            return QuestType::Connoisseur;
        } else if self == quests::shop::SmallSpender::identifier() {
            return QuestType::SmallSpender;
        } else if self == quests::orb::DeepDive::identifier() {
            return QuestType::DeepDive;
        } else if self == quests::orb::FirstAid::identifier() {
            return QuestType::FirstAid;
        } else if self == quests::orb::BombSquad::identifier() {
            return QuestType::BombSquad;
        } else if self == quests::level::Untouched::identifier() {
            return QuestType::Untouched;
        } else if self == quests::orb::PowerUp::identifier() {
            return QuestType::PowerUp;
        } else if self == quests::points::Speedrunner::identifier() {
            return QuestType::Speedrunner;
        } else if self == quests::points::HighScorer::identifier() {
            return QuestType::HighScorer;
        } else if self == quests::bag::FiveOfAKind::identifier() {
            return QuestType::FiveOfAKind;
        } else if self == quests::session::Workaholic::identifier() {
            return QuestType::Workaholic;
        } else if self == quests::orb::Marathon::identifier() {
            return QuestType::Marathon;
        } else if self == quests::level::TierClimber::identifier() {
            return QuestType::TierClimber;
        } else if self == quests::multiplier::Quadruple::identifier() {
            return QuestType::Quadruple;
        } else if self == quests::bag::Hoarder::identifier() {
            return QuestType::Hoarder;
        } else if self == quests::orb::Roadrunner::identifier() {
            return QuestType::Roadrunner;
        } else if self == quests::bomb::ChainReaction::identifier() {
            return QuestType::ChainReaction;
        } else if self == quests::shop::BigSpender::identifier() {
            return QuestType::BigSpender;
        } else if self == quests::moonrock::HairTrigger::identifier() {
            return QuestType::HairTrigger;
        } else if self == quests::moonrock::Bankroll::identifier() {
            return QuestType::Bankroll;
        } else if self == quests::level::Cliffhanger::identifier() {
            return QuestType::Cliffhanger;
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
        } else if self == quests::finisher::DailyFinisherThree::identifier() {
            return QuestType::DailyFinisherThree;
        } else if self == quests::finisher::DailyFinisherFive::identifier() {
            return QuestType::DailyFinisherFive;
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
