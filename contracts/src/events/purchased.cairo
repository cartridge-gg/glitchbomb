pub use crate::events::index::Purchased;

#[generate_trait]
pub impl PurchasedImpl of PurchasedTrait {
    fn new(
        player_id: felt252,
        starterpack_id: u32,
        score: u16,
        quantity: u32,
        multiplier: u128,
        price: u256,
        burn: u256,
        supply: u256,
    ) -> Purchased {
        Purchased {
            player_id: player_id,
            starterpack_id: starterpack_id,
            score: score,
            quantity: quantity,
            multiplier: multiplier,
            price: price,
            burn: burn,
            supply: supply,
            time: starknet::get_block_timestamp(),
        }
    }
}
