use crate::store::StoreTrait;
use crate::tests::setup::setup::spawn_game;

#[test]
fn test_setup() {
    let (world, _, _) = spawn_game();
    let store = StoreTrait::new(world);
    let config = store.config();
    assert(config.entry_price == 2000000, 'Config: wrong entry price');
}
