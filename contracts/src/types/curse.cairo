use crate::elements::curses;
use crate::models::game::{Game, GameTrait};
use crate::types::orb::Orb;

// Number of available curses (excluding None)
pub const NUM_CURSES: u8 = 6;

#[derive(Drop, Copy)]
pub enum Curse {
    None,
    // Passive curses (rules that pervade gameplay)
    Demultiplier,
    DoubleDraw,
    // Bag curses (add curse orbs to the bag)
    DoubleBomb, // Adds Bomb2 to bag
    NormalBomb, // Adds Bomb1 to bag
    ScoreDecrease, // Adds CurseScoreDecrease to bag
    StickyBomb // Adds StickyBomb to bag
}

#[generate_trait]
pub impl CurseImpl of CurseTrait {
    #[inline]
    fn apply(self: @Curse, ref game: Game) {
        match self {
            // Passive curses - set bits in game.curses
            Curse::Demultiplier => curses::demultiplier::Demultiplier::apply(ref game, 1),
            Curse::DoubleDraw => curses::double_draw::DoubleDraw::apply(ref game, 2),
            // Bag curses - add orbs to the bag
            Curse::DoubleBomb => game.add(Orb::Bomb2),
            Curse::NormalBomb => game.add(Orb::Bomb1),
            Curse::ScoreDecrease => game.add(Orb::CurseScoreDecrease),
            Curse::StickyBomb => game.add(Orb::StickyBomb),
            _ => {},
        }
    }

    /// Returns true if this curse adds an orb to the bag
    #[inline]
    fn is_bag_curse(self: @Curse) -> bool {
        match self {
            Curse::DoubleBomb => true,
            Curse::NormalBomb => true,
            Curse::ScoreDecrease => true,
            Curse::StickyBomb => true,
            _ => false,
        }
    }
}

pub impl IntoCurseU8 of Into<Curse, u8> {
    fn into(self: Curse) -> u8 {
        match self {
            Curse::Demultiplier => 1,
            Curse::DoubleDraw => 2,
            Curse::DoubleBomb => 3,
            Curse::NormalBomb => 4,
            Curse::ScoreDecrease => 5,
            Curse::StickyBomb => 6,
            _ => 0,
        }
    }
}

pub impl IntoU8Curse of Into<u8, Curse> {
    fn into(self: u8) -> Curse {
        match self {
            1 => Curse::Demultiplier,
            2 => Curse::DoubleDraw,
            3 => Curse::DoubleBomb,
            4 => Curse::NormalBomb,
            5 => Curse::ScoreDecrease,
            6 => Curse::StickyBomb,
            _ => Curse::None,
        }
    }
}
