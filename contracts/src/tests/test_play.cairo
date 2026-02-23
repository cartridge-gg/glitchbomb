use starknet::testing::{set_contract_address, set_transaction_hash};
use starterpack::interface::IStarterpackImplementationDispatcherTrait;
use crate::interfaces::erc20::IERC20DispatcherTrait;
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
    // [Action] Start the game
    let game_id: u64 = 1;
    set_contract_address(context.player);
    systems.play.start(game_id);
    // [Action] Pull orbs
    set_transaction_hash(0x0);
    systems.play.pull(game_id); // Orb: Bomb 1
    systems.play.pull(game_id); // Orb: Bomb 1
    systems.play.pull(game_id); // Orb: Point 5
    systems.play.pull(game_id); // Orb: Point 5
    systems.play.pull(game_id); // Orb: Bomb 2
    systems.play.pull(game_id); // Orb: Point Bomb 4
    // [Assert] Stage completed
    let store = StoreTrait::new(world);
    let game = store.game(game_id);
    game.assert_is_completed();
    // [Action] Enter shop (shop now generates unique orbs per rarity)
    systems.play.enter(game_id);
    // [Action] Buy one orb from shop (index 0)
    systems.play.buy(game_id, [0].span());
    // [Action] Exit shop
    systems.play.exit(game_id);
    // [Action] Pull orbs
    set_transaction_hash(0x0);
    systems.play.pull(game_id); // Orb: Health1
    systems.play.pull(game_id); // Orb: Point Bomb 4
    systems.play.pull(game_id); // Orb: Point 5
    systems.play.pull(game_id); // Orb: Bomb 3
    systems.play.pull(game_id); // Orb: Point Orb 1
}

#[test]
fn test_play_cash_out_mints_moonrocks() {
    // [Setup] Mint one token
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 0, 1);

    // [Action] Start the game and make deterministic pulls
    let game_id: u64 = 1;
    set_contract_address(context.player);
    systems.play.start(game_id);
    set_transaction_hash(0x0);
    systems.play.pull(game_id); // Orb: Bomb 1
    systems.play.pull(game_id); // Orb: Bomb 1
    systems.play.pull(game_id); // Orb: Point 5
    systems.play.pull(game_id); // Orb: Point 5

    // [Assert] We have points to cash out and no minted balance yet
    let store = StoreTrait::new(world);
    let game_before = store.game(game_id);
    assert(game_before.points == 10, 'Game: expected 10 points');
    let balance_before = systems.token.balance_of(context.player);
    assert(balance_before == 0_u8.into(), 'Token: unexpected balance');

    // [Action] Cash out
    systems.play.cash_out(game_id);

    // [Assert] Points are converted and minted to the caller
    let game_after = store.game(game_id);
    game_after.assert_is_over();
    assert(game_after.points == 0, 'Game: points not reset');

    // Reward curve: score=10 with supply=0, target=1M yields MIN_REWARD=1
    // Game: 100 (initial) - 10 (level cost) + 1 (reward) = 91
    assert(game_after.moonrocks == 91, 'Game: wrong moonrocks');

    let balance_after = systems.token.balance_of(context.player);
    assert(balance_after == 1_u16.into(), 'Token: wrong minted amount');
}

#[test]
fn test_play_stake_set_from_starterpack_tier() {
    // [Setup] Mint games from different starterpack tiers
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    // Tier 0 (multiplier=1), tier 4 (multiplier=5), tier 9 (multiplier=10)
    systems.starterpack.on_issue(context.player, 0, 1); // game_id=1
    systems.starterpack.on_issue(context.player, 4, 1); // game_id=2
    systems.starterpack.on_issue(context.player, 9, 1); // game_id=3

    // [Assert] Each game's stake matches the starterpack multiplier
    let store = StoreTrait::new(world);
    let game1 = store.game(1);
    let game2 = store.game(2);
    let game3 = store.game(3);
    assert(game1.stake == 1, 'Tier 0: stake should be 1');
    assert(game2.stake == 5, 'Tier 4: stake should be 5');
    assert(game3.stake == 10, 'Tier 9: stake should be 10');
}

#[test]
fn test_play_cash_out_reward_scales_with_stake() {
    // [Setup] Mint games from tier 0 (stake=1) and tier 4 (stake=5)
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 0, 1); // game_id=1, stake=1
    systems.starterpack.on_issue(context.player, 4, 1); // game_id=2, stake=5

    set_contract_address(context.player);

    // [Action] Play game 1 (stake=1): start + 4 pulls → 10 points, then cash out
    systems.play.start(1);
    set_transaction_hash(0x0);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.cash_out(1);

    // [Action] Play game 2 (stake=5): same pulls → same 10 points, then cash out
    systems.play.start(2);
    set_transaction_hash(0x0);
    systems.play.pull(2);
    systems.play.pull(2);
    systems.play.pull(2);
    systems.play.pull(2);
    systems.play.cash_out(2);

    // [Assert] Both games scored the same points but reward differs by stake
    let store = StoreTrait::new(world);
    let game1 = store.game(1);
    let game2 = store.game(2);

    // Reward curve: score=10, supply=0, target=1M → base_reward=1
    // Game 1: 100 - 10 (level cost) + 1*1 (reward) = 91
    // Game 2: 100 - 10 (level cost) + 1*5 (reward) = 95
    assert(game1.moonrocks == 91, 'Stake 1: moonrocks == 91');
    assert(game2.moonrocks == 95, 'Stake 5: moonrocks == 95');

    // [Assert] Minted token amounts reflect the stake multiplier
    // Game 1 minted 1, game 2 minted 5, total = 6
    let balance = systems.token.balance_of(context.player);
    assert(balance == 6_u16.into(), 'Token: total minted == 6');
}

#[test]
fn test_play_cash_out_max_stake() {
    // [Setup] Mint a game from tier 9 (stake=10)
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 9, 1); // game_id=1, stake=10

    set_contract_address(context.player);

    // [Action] Start + 4 pulls → 10 points, then cash out
    systems.play.start(1);
    set_transaction_hash(0x0);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.cash_out(1);

    // [Assert] Reward is multiplied by 10
    let store = StoreTrait::new(world);
    let game = store.game(1);

    // Reward curve: score=10, supply=0, target=1M → base_reward=1
    // Game: 100 - 10 (level cost) + 1*10 (reward) = 100
    assert(game.moonrocks == 100, 'Stake 10: moonrocks == 100');

    let balance = systems.token.balance_of(context.player);
    assert(balance == 10_u16.into(), 'Token: minted == 10');
}
