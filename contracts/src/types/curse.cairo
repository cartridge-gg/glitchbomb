use crate::elements::curses;
use crate::models::game::Game;

#[derive(Drop, Copy)]
pub enum Curse {
    None,
    Demultiplier,
    DoubleDraw,
}

#[generate_trait]
pub impl CurseImpl of CurseTrait {
    #[inline]
    fn apply(self: @Curse, ref game: Game) {
        match self {
            Curse::Demultiplier => curses::demultiplier::Demultiplier::apply(ref game, 1),
            Curse::DoubleDraw => curses::double_draw::DoubleDraw::apply(ref game, 2),
            _ => {},
        }
    }
}

pub impl IntoCurseU8 of Into<Curse, u8> {
    fn into(self: Curse) -> u8 {
        match self {
            Curse::Demultiplier => 1,
            Curse::DoubleDraw => 2,
            _ => 0,
        }
    }
}

pub impl IntoU8Curse of Into<u8, Curse> {
    fn into(self: u8) -> Curse {
        match self {
            1 => Curse::Demultiplier,
            2 => Curse::DoubleDraw,
            _ => Curse::None,
        }
    }
}
