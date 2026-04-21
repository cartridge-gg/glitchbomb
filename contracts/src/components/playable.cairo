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
    use crate::elements::achievements::index::{ACHIEVEMENT_COUNT, AchievementType, IAchievement};
    use crate::elements::quests::index::{IQuest, QUEST_COUNT, QuestProps, QuestType};
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
        /// Initializes the components.
        fn initialize(ref self: ComponentState<TContractState>, mut world: WorldStorage) {
            // [Event] Initialize all Achievements
            let mut achievement_id: u8 = ACHIEVEMENT_COUNT;
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            while achievement_id > 0 {
                let achievement_type: AchievementType = achievement_id.into();
                let props = achievement_type.props();
                achievement
                    .create(
                        world,
                        id: props.id,
                        start: 0,
                        end: 0,
                        tasks: props.tasks,
                        metadata: props.metadata,
                        to_store: true,
                    );
                achievement_id -= 1;
            }
            // [Event] Initialize all Quests
            let mut quest_id: u8 = QUEST_COUNT;
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let registry = starknet::get_contract_address();
            while quest_id > 0 {
                let quest_type: QuestType = quest_id.into();
                let props: QuestProps = quest_type.props(registry);
                quest
                    .create(
                        world: world,
                        id: props.id,
                        start: props.start,
                        end: props.end,
                        duration: props.duration,
                        interval: props.interval,
                        tasks: props.tasks.span(),
                        conditions: props.conditions.span(),
                        metadata: props.metadata,
                        to_store: true,
                    );
                quest_id -= 1;
            };
        }

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

            // [Effect] Achievements
            // - Hacker
            // - Hardwired
            // - Jailbroken
            // - SysAdmin
            // - Root Access
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            achievement.progress(world, player.into(), Task::Loyalty.identifier(), 1, true);
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
            // - [A] What Now?
            // - [A] Surge
            // - [A] Overload
            // - [A] Sky High
            // - [A] To The Moon
            // - [Q] Climber 3
            // - [Q] Climber 4
            // - [Q] Climber 5
            // - [Q] Harver 5
            // - [Q] Harver 40
            // - [Q] Harver 80
            // - [A] Harvest
            // - [A] Jackpot
            // - [A] Armageddon 3
            // - [A] Armageddon 4
            let player = self.owner(world, game_id);
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let game_counters = game.counters();
            let level_counters = game.level_counters();
            if remaining == 0 {
                achievement.progress(world, player.into(), Task::WhatNow.identifier(), 1, true);
            }
            if earned_points >= 70 {
                achievement.progress(world, player.into(), Task::Surge.identifier(), 1, true);
            }
            if earned_points >= 100 {
                achievement.progress(world, player.into(), Task::Overload.identifier(), 1, true);
            }
            if game.multiplier >= 3 * BASE_MULTIPLIER {
                quest.progress(world, player.into(), Task::Climber3.identifier(), 1, true);
            }
            if game.multiplier >= 4 * BASE_MULTIPLIER {
                quest.progress(world, player.into(), Task::Climber4.identifier(), 1, true);
            }
            if game.multiplier >= 5 * BASE_MULTIPLIER {
                quest.progress(world, player.into(), Task::Climber5.identifier(), 1, true);
            }
            if game.multiplier >= 7 * BASE_MULTIPLIER {
                achievement.progress(world, player.into(), Task::SkyHigh.identifier(), 1, true);
            }
            if game.multiplier >= 10 * BASE_MULTIPLIER {
                achievement.progress(world, player.into(), Task::ToTheMoon.identifier(), 1, true);
            }
            if level_counters.moonrock_amount >= 5 {
                achievement.progress(world, player.into(), Task::Harvest5.identifier(), 1, true);
            }
            if level_counters.moonrock_amount >= 40 {
                achievement.progress(world, player.into(), Task::Harvest40.identifier(), 1, true);
            }
            if level_counters.moonrock_amount >= 80 {
                achievement.progress(world, player.into(), Task::Harvest80.identifier(), 1, true);
            }
            if level_counters.moonrock_amount >= 200 {
                achievement.progress(world, player.into(), Task::Harvest.identifier(), 1, true);
            }
            if level_counters.moonrock_amount >= 500 {
                achievement.progress(world, player.into(), Task::Jackpot.identifier(), 1, true);
            }
            if game_counters.bomb3_count == 3 {
                achievement.progress(world, player.into(), Task::Armageddon3.identifier(), 1, true);
            }
            if game_counters.bomb3_count == 4 {
                achievement.progress(world, player.into(), Task::Armageddon4.identifier(), 1, true);
            }
            if level_counters.health_amount >= 12 {
                achievement.progress(world, player.into(), Task::Immortal.identifier(), 1, true);
            }
            if game_counters.streak_multipliers == 5 {
                achievement
                    .progress(world, player.into(), Task::FullyTorqued.identifier(), 1, true);
            }
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
            // - [Q] Cash Out 125
            // - [Q] Cash Out 135
            // - [Q] Cash Out 150
            // - [Q] Cash Out 160
            // - [Q] Cash Out 180
            // - [A] Cash Out 200
            // - [A] Cash Out 300
            // - [A] Cash Out 400
            // - [A] Cash Out 500
            // - [A] Cash Out 600
            // - [A] Cash Out 700
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let player = self.owner(world, game_id);
            if game.moonrocks >= 125 {
                quest.progress(world, player.into(), Task::CashOut125.identifier(), 1, true);
            }
            if game.moonrocks >= 135 {
                quest.progress(world, player.into(), Task::CashOut135.identifier(), 1, true);
            }
            if game.moonrocks >= 150 {
                quest.progress(world, player.into(), Task::CashOut150.identifier(), 1, true);
            }
            if game.moonrocks >= 160 {
                quest.progress(world, player.into(), Task::CashOut160.identifier(), 1, true);
            }
            if game.moonrocks >= 180 {
                quest.progress(world, player.into(), Task::CashOut180.identifier(), 1, true);
            }
            if game.moonrocks >= 200 {
                achievement.progress(world, player.into(), Task::CashOut200.identifier(), 1, true);
            }
            if game.moonrocks >= 300 {
                achievement.progress(world, player.into(), Task::CashOut300.identifier(), 1, true);
            }
            if game.moonrocks >= 400 {
                achievement.progress(world, player.into(), Task::CashOut400.identifier(), 1, true);
            }
            if game.moonrocks >= 500 {
                achievement.progress(world, player.into(), Task::CashOut500.identifier(), 1, true);
            }
            if game.moonrocks >= 600 {
                achievement.progress(world, player.into(), Task::CashOut600.identifier(), 1, true);
            }
            if game.moonrocks >= 700 {
                achievement.progress(world, player.into(), Task::CashOut700.identifier(), 1, true);
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
            let mut rng = RandomImpl::new_vrf(store.vrf_disp());
            game.enter(rng.next_seed());
            store.set_game(@game);

            // [Event] Emit PLDataPoint for ante cost
            let pl_id: u32 = 1 + (game.pull_count.into() * 2) + game.level.into();
            let potential = game.moonrocks + game.points;
            store.pl_data_point(pl_id, @game, potential, 0);

            // [Effect] Progressions
            // - [A] Linear
            // - [A] Exponential
            // - [A] Metagamer
            // - [A] Medic
            // - [A] Diamond Hands
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let player = self.owner(world, game_id);
            let game_counters = game.counters();
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
            if game_counters.streak_save == 3 {
                achievement
                    .progress(world, player.into(), Task::DiamondHands.identifier(), 1, true);
            }
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
            // - [Q] BulkOrder
            // - [A] Shopaholic
            // - [A] Sold Out
            let mut quest = get_dep_component_mut!(ref self, Quest);
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let player = self.owner(world, game_id);
            let level_counters = game.level_counters();
            if level_counters.buy_count >= 6 {
                quest.progress(world, player.into(), Task::Shopper6.identifier(), 1, true);
            }
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

            // [Effect] Progressions
            // - [A] Victory
            // - [A] Elite
            // - [A] Royalty
            // - [A] Flawless
            // - [A] Never Surrender
            // - [A] What Bombs
            let mut achievement = get_dep_component_mut!(ref self, Achievement);
            let player = self.owner(world, game_id);
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
            if game.level == 7 && game.pulled_bombs_count() == 0 {
                achievement.progress(world, player.into(), Task::WhatBombs.identifier(), 1, true);
            }

            // [Effect] Exit shop (applies level-based curse)
            game.exit();
            store.set_game(@game);
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
