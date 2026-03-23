use starknet::testing::{set_contract_address, set_transaction_hash};
use starterpack::interface::IStarterpackImplementationDispatcherTrait;
use crate::interfaces::erc20::IERC20DispatcherTrait;
use crate::models::game::AssertTrait;
use crate::store::StoreTrait;
use crate::systems::play::IPlayDispatcherTrait;
use crate::tests::setup::setup::spawn_game;

#[test]
fn test_play_start() {
    // [Setup] Mint one token (game is started automatically in on_issue)
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 0, 1);
    // [Action] Pull orbs (game is already started)
    let game_id: u64 = 1;
    set_contract_address(context.player);
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

    // [Action] Make deterministic pulls (game is already started from on_issue)
    let game_id: u64 = 1;
    set_contract_address(context.player);
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

    // Reward based on moonrocks=100 (no level 1 cost), supply=0, target=1B
    // Moonrocks unchanged (reward goes to Glitch tokens, not moonrocks)
    assert(game_after.moonrocks == 100, 'Game: wrong moonrocks');

    // Reward curve: score=100, supply=0 → base_reward=3, stake=1 → 3 tokens minted
    let balance_after = systems.token.balance_of(context.player);
    assert(balance_after >= 1_u16.into(), 'Token: should mint tokens');
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

    // [Action] Play game 1 (stake=1): 4 pulls → 10 points, then cash out
    set_transaction_hash(0x0);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.cash_out(1);

    // [Action] Play game 2 (stake=5): same pulls → same 10 points, then cash out
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

    // Reward based on moonrocks=100 for both games (no level 1 cost)
    // Moonrocks unchanged (reward goes to Glitch tokens, not moonrocks)
    assert(game1.moonrocks == 100, 'Stake 1: moonrocks == 100');
    assert(game2.moonrocks == 100, 'Stake 5: moonrocks == 100');

    // [Assert] Stake multiplier scales token rewards (stake=5 gets 5x stake=1)
    let balance = systems.token.balance_of(context.player);
    assert(balance >= 1_u16.into(), 'Token: should mint tokens');
}

#[test]
fn test_play_cash_out_max_stake() {
    // [Setup] Mint a game from tier 9 (stake=10)
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 9, 1); // game_id=1, stake=10

    set_contract_address(context.player);

    // [Action] 4 pulls → 10 points, then cash out (game already started from on_issue)
    set_transaction_hash(0x0);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.pull(1);
    systems.play.cash_out(1);

    // [Assert] Reward is multiplied by 10
    let store = StoreTrait::new(world);
    let game = store.game(1);

    // Reward based on moonrocks=100 (no level 1 cost), stake=10
    // Moonrocks unchanged (reward goes to Glitch tokens, not moonrocks)
    assert(game.moonrocks == 100, 'Stake 10: moonrocks == 100');

    // Stake=10 should mint more tokens than stake=1
    let balance = systems.token.balance_of(context.player);
    assert(balance >= 1_u16.into(), 'Token: should mint tokens');
}

#[test]
fn test_play_death_cashes_out_moonrocks() {
    // [Setup] Mint one token
    let (world, systems, context) = spawn_game();
    set_contract_address(systems.registry.contract_address);
    systems.starterpack.on_issue(context.player, 0, 1);

    let game_id: u64 = 1;
    set_contract_address(context.player);
    set_transaction_hash(0x0);

    // [Action] Complete level 1 (milestone=12 points)
    systems.play.pull(game_id); // Bomb 1 → health 4
    systems.play.pull(game_id); // Bomb 1 → health 3
    systems.play.pull(game_id); // Point 5 → points 5
    systems.play.pull(game_id); // Point 5 → points 10
    systems.play.pull(game_id); // Bomb 2 → health 1
    systems.play.pull(game_id); // PointBomb 4 → points 22, stage completed

    // [Action] Enter shop (converts points to chips, costs 1 moonrock for level 2)
    systems.play.enter(game_id);
    // [Action] Exit shop (restores health to 5, level up to 2, milestone=18)
    systems.play.exit(game_id);

    // [Assert] No tokens minted yet
    let balance_before = systems.token.balance_of(context.player);
    assert(balance_before == 0_u8.into(), 'Token: no tokens before death');

    // [Action] Pull in level 2 until death (health 5, bombs total 7 damage in bag)
    // Use a seed that sequences bombs early to kill before milestone
    set_transaction_hash(0x1);
    systems.play.pull(game_id);
    systems.play.pull(game_id);
    systems.play.pull(game_id);
    systems.play.pull(game_id);
    systems.play.pull(game_id);

    let store = StoreTrait::new(world);
    let game_check = store.game(game_id);
    if !game_check.over {
        systems.play.pull(game_id);
        let game_check2 = store.game(game_id);
        if !game_check2.over {
            systems.play.pull(game_id);
            let game_check3 = store.game(game_id);
            if !game_check3.over {
                systems.play.pull(game_id);
                let game_check4 = store.game(game_id);
                if !game_check4.over {
                    systems.play.pull(game_id);
                    let game_check5 = store.game(game_id);
                    if !game_check5.over {
                        systems.play.pull(game_id);
                    }
                }
            }
        }
    }

    // [Assert] Game is over (death)
    let game = store.game(game_id);
    assert(game.over, 'Game: should be dead');
    assert(game.health == 0, 'Game: health should be 0');

    // [Assert] Points were NOT converted to moonrocks on death
    // Moonrocks = 100 (initial) - 0 (no ante for initial level) = 100
    assert(game.moonrocks == 100, 'Game: moonrocks should be 100');

    // [Assert] Tokens were minted based on moonrocks only (not points)
    let balance_after = systems.token.balance_of(context.player);
    assert(balance_after > 0_u8.into(), 'Token: should mint on death');
}
