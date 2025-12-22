use crate::elements::effects;
use crate::models::game::Game;

#[derive(Drop, Copy)]
pub enum Effect {
    None,
    Boost,
    Explode,
    Heal,
    Earn,
    Moonrock,
    Chips,
    Immune,
    Lose,
}

#[generate_trait]
pub impl EffectImpl of EffectTrait {
    fn apply(self: @Effect, ref game: Game, count: u8) -> u16 {
        match self {
            Effect::Boost => effects::boost::Boost::apply(ref game, count),
            Effect::Explode => effects::explode::Explode::apply(ref game, count),
            Effect::Heal => effects::heal::Heal::apply(ref game, count),
            Effect::Earn => effects::earn::Earn::apply(ref game, count),
            Effect::Moonrock => effects::moonrock::Moonrock::apply(ref game, count),
            Effect::Chips => effects::chips::Chips::apply(ref game, count),
            Effect::Immune => effects::immune::Immune::apply(ref game, count),
            Effect::Lose => effects::lose::Lose::apply(ref game, count),
            _ => 0,
        }
    }
}
