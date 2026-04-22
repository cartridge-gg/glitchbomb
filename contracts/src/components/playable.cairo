#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use achievement::component::Component as AchievementComponent;
    use achievement::component::Component::InternalImpl as AchievementInternalImpl;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use leaderboard::components::rankable::RankableComponent;
    use leaderboard::components::rankable::RankableComponent::InternalImpl as RankableInternalImpl;
    use openzeppelin::interfaces::token::erc721::{IERC721Dispatcher, IERC721DispatcherTrait};
    use quest::component::Component as QuestableComponent;
    use quest::component::Component::InternalImpl as QuestableInternalImpl;
    use starknet::ContractAddress;
    use crate::constants;

    use crate::elements::tasks::index::{Task, TaskTrait};
    use crate::helpers::random::RandomImpl;
    use crate::helpers::rewarder::Rewarder;
    use crate::models::config::ConfigTrait;
    use crate::models::game::{AssertTrait, BASE_MULTIPLIER, GameAssert, GameTrait};
    use crate::store::{StoreImpl, StoreTrait};
    use crate::systems::collection::NAME as COLLECTION;
    use crate::systems::token::{ITokenDispatcher, ITokenDispatcherTrait, NAME as TOKEN};

    // Constants

    const LEADERBOARD_ID: felt252 = 1;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Achievement: AchievementComponent::HasComponent<TContractState>,
        impl AchievementImpl: AchievementComponent::AchievementTrait<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
        impl QuestImpl: QuestableComponent::QuestTrait<TContractState>,
        impl Rankable: RankableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        /// Create a new game. It ensures the game is valid and not already created.
        fn create(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            player: ContractAddress,
            game_id: u64,
            multiplier: u128,
            supply: u256,
            price: u256,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Effect] Create game with starterpack stake
            let mut game = GameTrait::new(id: game_id, stake: multiplier);

            // [Effect] Start the game immediately (fill bag)
            let cost = game.start();

            // [Event] Emit PLDataPoint at baseline (initial moonrocks)
            store.pl_data_point(0, @game, game.moonrocks, 0);

            // [Effect] Spend moonrocks for entry
            game.spend_moonrocks(cost);
            store.set_game(@game);

            // [Effect] Progressions
            // Achievements (Loyalty): Hacker, Hardwired, Jailbroken, SysAdmin, RootAccess
            // Quests (Loyalty): WarmingUp (x3), Regular (x8), Workaholic (x5)
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let mut quest = get_dep_component_mut!(ref self, Quest);
            achievement.progress(world, player.into(), Task::Loyalty.identifier(), 1, true);
            quest.progress(world, player.into(), Task::Loyalty.identifier(), 1, true);
        }

        fn pull(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_has_started();
            game.assert_not_over();
            game.assert_not_expired();

            // [Effect] Pull orb(s) - may be 2 if DoubleDraw curse is active
            let mut rng = RandomImpl::new_vrf(store.vrf_disp());
            let (orbs, earnings, remaining, earned_points) = game.pull(rng.next_seed());

            // Calculate potential moonrocks and PL id base
            let potential_moonrocks = game.moonrocks + game.points;
            let pl_base_id: u32 = 1 + (game.pull_count.into() - orbs.len()) * 2;

            // [Event] Emit OrbPulled and PLDataPoint for each orb (max 2 with DoubleDraw)
            store.orb_pulled(@game, orbs.get(0), 0);
            store.orb_pulled(@game, orbs.get(1), 1);

            if let Option::Some(orb) = orbs.get(0) {
                let orb_type: u8 = (*orb.unbox()).into();
                store.pl_data_point(pl_base_id, @game, potential_moonrocks, orb_type);
            }
            if let Option::Some(orb) = orbs.get(1) {
                let orb_type: u8 = (*orb.unbox()).into();
                store.pl_data_point(pl_base_id + 1, @game, potential_moonrocks, orb_type);
            }

            // [Effect] Update game earnings if exists
            game.earn_moonrocks(earnings);
            store.set_game(@game);

            // [Effect] Progressions
            // Achievements:
            //   WhatNow, Surge, Overload, SkyHigh, ToTheMoon, Harvest, Jackpot,
            //   Armageddon (x6), Immortal, FullyTorqued, Cursed (streak 4),
            //   WraithForm (streak 5), Defused, Flatline
            // Quests:
            //   TripleTake (Climber3), Quadruple (Climber4),
            //   GoldRush (Harvest80), SharpShot (Surge20),
            //   HighScorer (LevelScorer45),
            //   DeepDive/Marathon/Ironlung (Bottomless15/25/40),
            //   TripleThreat (Armageddon3), Minefield (GameBombs15),
            //   FieldMedic (Immortal5), ChainReaction (BombStreak3)
            let player = self.owner(world, game_id);
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let game_counters = game.counters();
            let level_counters = game.level_counters();

            // -- Bag state --
            if remaining == 0 {
                achievement.progress(world, player.into(), Task::WhatNow.identifier(), 1, true);
            }
            if game.pullable_bombs_count() == 0 {
                achievement.progress(world, player.into(), Task::Defused.identifier(), 1, true);
            }
            if game.pullable_points_count() == 0 {
                achievement.progress(world, player.into(), Task::Flatline.identifier(), 1, true);
            }

            // -- Single-pull points (Surge20 → SharpShot quest, Surge/Overload → achievements)
            // --
            if earned_points >= 20 {
                quest.progress(world, player.into(), Task::Surge20.identifier(), 1, true);
            }
            if earned_points >= 70 {
                achievement.progress(world, player.into(), Task::Surge.identifier(), 1, true);
            }
            if earned_points >= 100 {
                achievement.progress(world, player.into(), Task::Overload.identifier(), 1, true);
            }

            // -- Multiplier (Climber3/4 → TripleTake/Quadruple quests, SkyHigh/ToTheMoon →
            // achievements) --
            if game.multiplier >= 3 * BASE_MULTIPLIER {
                quest.progress(world, player.into(), Task::Climber3.identifier(), 1, true);
            }
            if game.multiplier >= 4 * BASE_MULTIPLIER {
                quest.progress(world, player.into(), Task::Climber4.identifier(), 1, true);
            }
            if game.multiplier >= 7 * BASE_MULTIPLIER {
                achievement.progress(world, player.into(), Task::SkyHigh.identifier(), 1, true);
            }
            if game.multiplier >= 10 * BASE_MULTIPLIER {
                achievement.progress(world, player.into(), Task::ToTheMoon.identifier(), 1, true);
            }

            // -- Moonrocks per level (GoldRush quest, Harvest/Jackpot achievements) --
            if level_counters.moonrock_amount >= 80 {
                quest.progress(world, player.into(), Task::Harvest80.identifier(), 1, true);
            }
            if level_counters.moonrock_amount >= 200 {
                achievement.progress(world, player.into(), Task::Harvest.identifier(), 1, true);
            }
            if level_counters.moonrock_amount >= 320 {
                achievement.progress(world, player.into(), Task::Jackpot.identifier(), 1, true);
            }

            // -- Level points (HighScorer quest) --
            if level_counters.point_amount >= 45 {
                quest.progress(world, player.into(), Task::LevelScorer45.identifier(), 1, true);
            }

            // -- Pull count (DeepDive/Marathon/Ironlung quests) --
            if game_counters.pull_count >= 15 {
                quest.progress(world, player.into(), Task::Bottomless15.identifier(), 1, true);
            }
            if game_counters.pull_count >= 25 {
                quest.progress(world, player.into(), Task::Bottomless25.identifier(), 1, true);
            }
            if game_counters.pull_count >= 40 {
                quest.progress(world, player.into(), Task::Bottomless40.identifier(), 1, true);
            }

            // -- Bombs (TripleThreat/Minefield quests, Armageddon6 achievement) --
            if game_counters.bomb3_count >= 3 {
                quest.progress(world, player.into(), Task::Armageddon3.identifier(), 1, true);
            }
            if game_counters.bomb3_count == 6 {
                achievement.progress(world, player.into(), Task::Armageddon6.identifier(), 1, true);
            }
            if game_counters.bomb_count >= 15 {
                quest.progress(world, player.into(), Task::GameBombs15.identifier(), 1, true);
            }

            // -- Health (Immortal5 → FieldMedic quest, Immortal → achievement) --
            if level_counters.health_amount >= 5 {
                quest.progress(world, player.into(), Task::Immortal5.identifier(), 1, true);
            }
            if level_counters.health_amount >= 12 {
                achievement.progress(world, player.into(), Task::Immortal.identifier(), 1, true);
            }

            // -- Streak multipliers --
            if game_counters.streak_multipliers == 5 {
                achievement
                    .progress(world, player.into(), Task::FullyTorqued.identifier(), 1, true);
            }

            // -- Streak bombs (ChainReaction → quest, Cursed/WraithForm → achievements) --
            if game_counters.streak_bombs == 3 {
                quest.progress(world, player.into(), Task::BombStreak3.identifier(), 1, true);
            }
            if game_counters.streak_bombs == 4 {
                achievement.progress(world, player.into(), Task::BombStreak4.identifier(), 1, true);
            }
            if game_counters.streak_bombs == 5 {
                achievement.progress(world, player.into(), Task::BombStreak5.identifier(), 1, true);
            }

            // [Check] Skip if the game is not over
            if game.over == 0 {
                return;
            }
            // [Effect] Finish the game
            self.finish(world, game_id);
        }

        fn cash_out(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_has_started();
            game.assert_not_over();
            game.assert_not_expired();

            // [Effect] If level completed (at milestone), convert points to moonrocks
            if game.is_completed() {
                game.moonrocks += game.points;
            }

            // [Effect] Cash out (marks over, clears points)
            game.cash_out();
            store.set_game(@game);

            // [Effect] Progressions
            // Quests: QuickExit (125), Bankroll (150), GoldenParachute (180),
            //         HairTrigger (Survivor1)
            // Achievements: InOrbit/Lunatic (Lunarian), Moonshot, LunarEclipse,
            //               Supernova, InfiniteGlitch
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let player = self.owner(world, game_id);
            if game.moonrocks >= 125 {
                quest.progress(world, player.into(), Task::CashOut125.identifier(), 1, true);
            }
            if game.moonrocks >= 150 {
                quest.progress(world, player.into(), Task::CashOut150.identifier(), 1, true);
            }
            if game.moonrocks >= 180 {
                quest.progress(world, player.into(), Task::CashOut180.identifier(), 1, true);
            }
            if game.moonrocks >= 200 {
                achievement.progress(world, player.into(), Task::Lunarian.identifier(), 1, true);
            }
            if game.moonrocks >= 300 {
                achievement.progress(world, player.into(), Task::Moonshot.identifier(), 1, true);
            }
            if game.moonrocks >= 500 {
                achievement
                    .progress(world, player.into(), Task::LunarEclipse.identifier(), 1, true);
            }
            if game.moonrocks >= 600 {
                achievement.progress(world, player.into(), Task::Supernova.identifier(), 1, true);
            }
            if game.moonrocks >= 700 {
                achievement
                    .progress(world, player.into(), Task::InfiniteGlitch.identifier(), 1, true);
            }

            // [Q] HairTrigger (Survivor1) — cash out at 1 health
            if game.health == 1 {
                quest.progress(world, player.into(), Task::Survivor1.identifier(), 1, true);
            }

            // [Effect] Finish the game
            self.finish(world, game_id);
        }

        fn enter(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_has_started();
            game.assert_not_over();
            game.assert_not_expired();

            // [Effect] Enter shop
            // [Note] game.enter() no longer resets level_counters so that the
            // end-of-level progressions below can read bomb_count (WhatBombs)
            // and moonrock/health amounts. The reset is performed manually
            // after the checks.
            let mut rng = RandomImpl::new_vrf(store.vrf_disp());
            game.enter(rng.next_seed());
            store.set_game(@game);

            // [Event] Emit PLDataPoint for ante cost
            let pl_id: u32 = 1 + (game.pull_count.into() * 2) + game.level.into();
            let potential = game.moonrocks + game.points;
            store.pl_data_point(pl_id, @game, potential, 0);

            // [Effect] Progressions (end-of-level — before level_counters reset)
            // Achievements: Victory/Elite/Royalty (Conqueror), Flawless,
            //               NeverSurrender, WhatBombs, DiamondHands
            // Quests: Untouched (LevelFlawless), Cliffhanger (LevelCritical),
            //         Speedrunner (QuickFinish4)
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let player = self.owner(world, game_id);
            let game_counters = game.counters();
            let level_counters = game.level_counters();
            if game.level == 7 {
                achievement.progress(world, player.into(), Task::Conqueror.identifier(), 1, true);
            }
            if game.level == 7 && game.is_full_health() {
                achievement.progress(world, player.into(), Task::Flawless.identifier(), 1, true);
            }
            if game.level == 7 && game.health == 1 {
                achievement
                    .progress(world, player.into(), Task::NeverSurrender.identifier(), 1, true);
            }
            if game.level == 7 && level_counters.bomb_count == 0 {
                achievement.progress(world, player.into(), Task::WhatBombs.identifier(), 1, true);
            }
            if game_counters.streak_save == 3 {
                achievement
                    .progress(world, player.into(), Task::DiamondHands.identifier(), 1, true);
            }
            // -- Quest: Untouched — beat any level at full health
            if game.is_full_health() {
                quest.progress(world, player.into(), Task::LevelFlawless.identifier(), 1, true);
            }
            // -- Quest: Cliffhanger — beat any level with 1 health
            if game.health == 1 {
                quest.progress(world, player.into(), Task::LevelCritical.identifier(), 1, true);
            }
            // -- Quest: Speedrunner — beat level in ≤4 pulls
            if level_counters.pull_count <= 4 {
                quest.progress(world, player.into(), Task::QuickFinish4.identifier(), 1, true);
            }

            // [Effect] Reset level counters after end-of-level progressions.
            game.level_counters = 0;
            store.set_game(@game);
        }

        fn buy(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            game_id: u64,
            ref indices: Span<u8>,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_has_started();
            game.assert_not_over();
            game.assert_not_expired();

            // [Effect] Buy orbs
            game.buy(ref indices);
            store.set_game(@game);

            // [Effect] Progressions
            // Achievements: Shopaholic (Shopper10), SoldOut (Shopper15)
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let player = self.owner(world, game_id);
            let level_counters = game.level_counters();
            if level_counters.buy_count >= 10 {
                achievement.progress(world, player.into(), Task::Shopper10.identifier(), 1, true);
            }
            if level_counters.buy_count >= 15 {
                achievement.progress(world, player.into(), Task::Shopper15.identifier(), 1, true);
            }
        }

        fn exit(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_has_started();
            game.assert_not_over();
            game.assert_not_expired();

            // [Effect] Exit shop (applies level-based curse and advances to next level)
            game.exit();
            store.set_game(@game);

            // [Effect] Progressions (start-of-next-level — after level_up + curses)
            // Achievements (bag composition): Linear, Exponential, Metagamer, Medic
            // Quests: TierClimber (LevelReacher4), Summit (LevelReacher6)
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let player = self.owner(world, game_id);
            let (_bombs, points, specials, multipliers, healths, total) = game.counts();
            if 100 * points / total >= 80 {
                achievement.progress(world, player.into(), Task::Linear.identifier(), 1, true);
            }
            if 100 * multipliers / total >= 50 {
                achievement.progress(world, player.into(), Task::Exponential.identifier(), 1, true);
            }
            if 100 * specials / total >= 40 {
                achievement.progress(world, player.into(), Task::Metagamer.identifier(), 1, true);
            }
            if 100 * healths / total >= 25 {
                achievement.progress(world, player.into(), Task::Medic.identifier(), 1, true);
            }
            if game.level >= 4 {
                quest.progress(world, player.into(), Task::LevelReacher4.identifier(), 1, true);
            }
            if game.level >= 6 {
                quest.progress(world, player.into(), Task::LevelReacher6.identifier(), 1, true);
            }
        }

        fn burn(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            game_id: u64,
            bag_index: u8,
        ) {
            // [Check] Feature disabled
            assert(false, 'Burn is disabled');

            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_has_started();
            game.assert_not_over();
            game.assert_not_expired();

            // [Effect] Burn orb from bag (costs 4 chips, can only do once)
            game.burn(bag_index);
            store.set_game(@game);
        }

        fn finish(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Game state
            let mut game = store.game(game_id);
            game.assert_is_over();
            game.assert_not_expired();

            // [Effect] Claim game
            let reward: u128 = game.claim().try_into().expect('Game: reward conversion failed');
            let base_reward: u128 = reward / constants::TEN_POW_18;
            store.set_game(@game);

            // [Effect] Update average score
            let mut config = store.config();
            let weight: u16 = (game.stake / constants::MULTIPLIER_PRECISION).try_into().unwrap();
            config.push(game.moonrocks.into(), weight, constants::EMA_MIN_SCORE.into());
            store.set_config(@config);

            // [Effect] Update leaderboard score
            let player = self.owner(world, game_id);
            let time = starknet::get_block_timestamp();
            let mut rankable = get_dep_component_mut!(ref self, Rankable);
            rankable
                .submit(
                    world: world,
                    leaderboard_id: LEADERBOARD_ID,
                    game_id: game.id,
                    player_id: player.into(),
                    score: game.level.into(),
                    time: time,
                    to_store: false,
                );

            // [Effect] Achievements
            // - Bottomless
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let game_counters = game.counters();
            if game_counters.pull_count >= 80 {
                achievement.progress(world, player.into(), Task::Bottomless.identifier(), 1, true);
            }

            // [Interaction] Pay user reward
            let (token_address, _) = world.dns(@TOKEN()).expect('Token not found!');
            let token = ITokenDispatcher { contract_address: token_address };
            token.reward(player, reward.into());

            // [Event] Emit claimed event
            store.claimed(player.into(), game_id, base_reward);
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        fn owner(
            self: @ComponentState<TContractState>, world: WorldStorage, game_id: u64,
        ) -> ContractAddress {
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            let collection = IERC721Dispatcher { contract_address: collection_address };
            collection.owner_of(game_id.into())
        }
    }
}
