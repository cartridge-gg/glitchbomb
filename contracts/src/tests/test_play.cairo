use starknet::testing::{set_contract_address, set_transaction_hash};
use starterpack::interface::IStarterpackImplementationDispatcherTrait;
use crate::interfaces::erc20::IERC20DispatcherTrait;
use crate::models::game::{AssertTrait, GameTrait};
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
    // [Action] Enter shop (shop now generates unique orbs per rarity)
    systems.play.enter(pack_id, game_id);
    // [Action] Buy one orb from shop (index 0)
    systems.play.buy(pack_id, game_id, [0].span());
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

#[test]
fn test_play_cash_out_mints_moonrocks() {
    // [Setup] Mint one token
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 0, 1);

    // [Action] Open the pack and make deterministic pulls
    let pack_id: u64 = 1;
    let game_id: u8 = 1;
    set_contract_address(context.player);
    systems.play.start(pack_id);
    set_transaction_hash(0x0);
    systems.play.pull(pack_id, game_id); // Orb: Bomb 1
    systems.play.pull(pack_id, game_id); // Orb: Bomb 1
    systems.play.pull(pack_id, game_id); // Orb: Point 5
    systems.play.pull(pack_id, game_id); // Orb: Point 5

    // [Assert] We have points to cash out and no minted balance yet
    let store = StoreTrait::new(world);
    let game_before = store.game(pack_id, game_id);
    assert(game_before.points == 10, 'Game: expected 10 points');
    let balance_before = systems.token.balance_of(context.player);
    assert(balance_before == 0_u8.into(), 'Token: unexpected balance');

    // [Action] Cash out
    systems.play.cash_out(pack_id, game_id);

    // [Assert] Points are converted and minted to the caller
    let game_after = store.game(pack_id, game_id);
    game_after.assert_is_over();
    assert(game_after.points == 0, 'Game: points not reset');

    let pack_after = store.pack(pack_id);
    assert(pack_after.moonrocks == 100, 'Pack: wrong moonrocks');

    let balance_after = systems.token.balance_of(context.player);
    assert(balance_after == 10_u16.into(), 'Token: wrong minted amount');
}

#[test]
fn test_play_cash_out_applies_curve() {
    // [Setup] Mint one token
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 0, 1);

    // [Action] Open pack
    let pack_id: u64 = 1;
    let game_id: u8 = 1;
    set_contract_address(context.player);
    systems.play.start(pack_id);

    // [Setup] Force deterministic points directly in game state
    let store = StoreTrait::new(world);
    let mut game = store.game(pack_id, game_id);
    game.earn_points(120);
    set_contract_address(systems.play.contract_address);
    store.set_game(@game);
    set_contract_address(context.player);

    // [Action] Cash out
    systems.play.cash_out(pack_id, game_id);

    // [Assert] Curve payout is applied (120 points -> 111 moonrocks)
    let pack_after = store.pack(pack_id);
    assert(pack_after.moonrocks == 201, 'Pack: wrong moonrocks');
    let balance_after = systems.token.balance_of(context.player);
    assert(balance_after == 111_u16.into(), 'Token: wrong minted amount');
}
