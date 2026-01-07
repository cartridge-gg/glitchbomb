use core::num::traits::Pow;
use crate::helpers::deck::{Deck, DeckTrait};
use crate::helpers::packer::Packer;
use crate::types::orb::Orb;

pub type Orbs = Array<Orb>;

const ORB_SIZE: u128 = 2_u128.pow(5);

#[generate_trait]
pub impl OrbsImpl of OrbsTrait {
    #[inline]
    fn initial() -> felt252 {
        array![
            Orb::Bomb1, Orb::Bomb1, Orb::Bomb2, Orb::Bomb3, Orb::Point5, Orb::Point5, Orb::Point5,
            Orb::Multiplier100, Orb::PointOrb1, Orb::PointBomb4, Orb::Health1,
        ]
            .pack()
        // TODO: return the packed value directly
    }

    #[inline]
    fn commons() -> Orbs {
        array![
            Orb::Point5, Orb::Chips15, Orb::PointBomb4, Orb::Point7, Orb::Moonrock15,
            Orb::Multiplier50, Orb::Health1,
        ]
    }

    #[inline]
    fn rares() -> Orbs {
        array![Orb::Point8, Orb::Point9, Orb::Multiplier100, Orb::Multiplier150]
    }

    #[inline]
    fn cosmics() -> Orbs {
        array![Orb::Moonrock40, Orb::Health3]
    }

    #[inline]
    fn shop(seed: felt252) -> Orbs {
        // [Compute] Generate the shop
        let mut orbs: Orbs = array![];
        // [Info] Draw 3 unique common orbs using Deck (draw without replacement)
        let commons: Orbs = Self::commons();
        let mut common_deck: Deck = DeckTrait::new(seed, commons.len());
        let index = common_deck.draw() - 1;
        orbs.append(*commons.at(index.into()));
        let index = common_deck.draw() - 1;
        orbs.append(*commons.at(index.into()));
        let index = common_deck.draw() - 1;
        orbs.append(*commons.at(index.into()));
        // [Info] Draw 2 unique rare orbs using Deck
        let rares: Orbs = Self::rares();
        let mut rare_deck: Deck = DeckTrait::new(seed, rares.len());
        let index = rare_deck.draw() - 1;
        orbs.append(*rares.at(index.into()));
        let index = rare_deck.draw() - 1;
        orbs.append(*rares.at(index.into()));
        // [Info] Draw 1 cosmic orb
        let cosmics: Orbs = Self::cosmics();
        let mut cosmic_deck: Deck = DeckTrait::new(seed, cosmics.len());
        let index = cosmic_deck.draw() - 1;
        orbs.append(*cosmics.at(index.into()));
        // [Compute] Shuffle the orbs
        let mut deck: Deck = DeckTrait::new(seed, orbs.len());
        let mut shop: Orbs = array![];
        while deck.remaining > 0 {
            let index = deck.draw() - 1;
            shop.append(*orbs.at(index.into()));
        }
        // [Return] The shop orbs
        shop
    }

    #[inline]
    fn pack(self: Orbs) -> felt252 {
        let packed: u256 = Packer::pack(self, ORB_SIZE);
        packed.try_into().unwrap()
    }

    #[inline]
    fn unpack(packed: felt252) -> Orbs {
        let packed: u256 = packed.into();
        Packer::unpack(packed, ORB_SIZE)
    }
}
