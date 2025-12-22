use starknet::testing::{set_contract_address, set_transaction_hash};
use starterpack::interface::IStarterpackImplementationDispatcherTrait;
use crate::models::game::AssertTrait;
use crate::store::StoreTrait;
use crate::systems::play::IPlayDispatcherTrait;
use crate::tests::setup::setup::spawn_game;

#[test]
fn test_play_start() {
    // [Setup] Mint one token
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 0, 1);
    // [Action] Open the pack
    let pack_id: u64 = 1;
    set_contract_address(context.player);
    systems.play.start(pack_id);
    // [Action] Pull orbs
    let game_id: u8 = 1;
    set_transaction_hash(0x0);
    systems.play.pull(pack_id, game_id); // Orb: Bomb 1
    systems.play.pull(pack_id, game_id); // Orb: Bomb 1
    systems.play.pull(pack_id, game_id); // Orb: Point 5
    systems.play.pull(pack_id, game_id); // Orb: Point 5
    systems.play.pull(pack_id, game_id); // Orb: Bomb 2
    systems.play.pull(pack_id, game_id); // Orb: Point Bomb 4
    // [Assert] Stage completed
    let store = StoreTrait::new(world);
    let game = store.game(pack_id, game_id);
    game.assert_is_completed();
    // [Action] Enter shop
    // [Orb::PointBomb4, Orb::Point9, Orb::PointBomb4, Orb::Point5, Orb::Moonrock40, Orb::Point8]
    systems.play.enter(pack_id, game_id);
    // [Action] Buy orbs from shop
    // [Orb::PointBomb4, Orb::Point5, Orb::Point8]
    systems.play.buy(pack_id, game_id, [0, 3, 5].span());
    // [Action] Exit shop
    systems.play.exit(pack_id, game_id);
    // [Action] Pull orbs
    set_transaction_hash(0x0);
    systems.play.pull(pack_id, game_id); // Orb: Health1
    systems.play.pull(pack_id, game_id); // Orb: Point Bomb 4
    systems.play.pull(pack_id, game_id); // Orb: Point 5
    systems.play.pull(pack_id, game_id); // Orb: Bomb 3
    systems.play.pull(pack_id, game_id); // Orb: Point Orb 1
}
