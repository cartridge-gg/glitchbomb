use crate::types::orb::Orb;

#[generate_trait]
pub impl Bag of BagTrait {
    #[inline]
    fn initial() -> Array<Orb> {
        array![
            Orb::Bomb1, Orb::Bomb1, Orb::Bomb2, Orb::Bomb2, Orb::Bomb3, Orb::Point5, Orb::Point5,
            Orb::Point5, Orb::Multiplier100, Orb::PointOrb1, Orb::PointBomb4, Orb::Health1,
        ]
    }

    #[inline]
    fn commons() -> Array<Orb> {
        array![
            Orb::Point5, Orb::Cheddah15, Orb::PointBomb4, Orb::Point7, Orb::Moonrock15,
            Orb::Multiplier50, Orb::Health1,
        ]
    }

    #[inline]
    fn rares() -> Array<Orb> {
        array![Orb::Point8, Orb::Point9, Orb::Multiplier100, Orb::Multiplier150]
    }

    #[inline]
    fn cosmics() -> Array<Orb> {
        array![Orb::Moonrock40, Orb::Health3]
    }
}
