#[derive(Drop, Copy)]
pub enum Rarity {
    None,
    Common,
    Rare,
    Cosmic,
}

#[generate_trait]
pub impl RarityImpl of RarityTrait {}
