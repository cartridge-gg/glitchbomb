use crate::elements::powers;
use crate::models::game::Game;

#[derive(Drop, Copy)]
pub enum Power {
    None,
    Burn,
    Reroll,
}

#[generate_trait]
pub impl PowerImpl of PowerTrait {
    #[inline]
    fn apply(self: @Power, ref game: Game) {
        match self {
            Power::Burn => powers::burn::Burn::apply(ref game, 1),
            Power::Reroll => powers::reroll::Reroll::apply(ref game, 2),
            _ => {},
        }
    }
}

pub impl IntoPowerU8 of Into<Power, u8> {
    fn into(self: Power) -> u8 {
        match self {
            Power::Burn => 1,
            Power::Reroll => 2,
            _ => 0,
        }
    }
}

pub impl IntoU8Power of Into<u8, Power> {
    fn into(self: u8) -> Power {
        match self {
            1 => Power::Burn,
            2 => Power::Reroll,
            _ => Power::None,
        }
    }
}
