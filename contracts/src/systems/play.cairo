#[inline]
pub fn NAME() -> ByteArray {
    "Play"
}

#[starknet::interface]
pub trait IPlay<T> {
    fn new(ref self: T);
    fn start(ref self: T, pack_id: u64);
    fn pull(ref self: T, pack_id: u64, game_id: u8);
    fn cash_out(ref self: T, pack_id: u64, game_id: u8);
    fn enter(ref self: T, pack_id: u64, game_id: u8);
    fn buy(ref self: T, pack_id: u64, game_id: u8, indices: Span<u8>);
    fn exit(ref self: T, pack_id: u64, game_id: u8);
    fn refresh(ref self: T, pack_id: u64, game_id: u8);
    fn burn(ref self: T, pack_id: u64, game_id: u8, bag_index: u8);
}

#[dojo::contract]
pub mod Play {
    use quest::interfaces::IQuestRewarder;
    use starknet::ContractAddress;
    use starterpack::interface::IStarterpackImplementation as IStarterpack;
    use crate::components::playable::PlayableComponent;
    use crate::constants::NAMESPACE;
    use super::*;

    // Components

    component!(path: PlayableComponent, storage: playable, event: PlayableEvent);
    impl PlayableInternalImpl = PlayableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        playable: PlayableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        PlayableEvent: PlayableComponent::Event,
    }

    fn dojo_init(ref self: ContractState) { // TODO: initialize components
    }

    #[abi(embed_v0)]
    impl StarterpackImpl of IStarterpack<ContractState> {
        fn on_issue(
            ref self: ContractState, recipient: ContractAddress, starterpack_id: u32, quantity: u32,
        ) { // TODO: implement
        }

        fn supply(self: @ContractState, starterpack_id: u32) -> Option<u32> {
            Option::None
        }
    }

    #[abi(embed_v0)]
    impl QuestRewarderImpl of IQuestRewarder<ContractState> {
        fn on_quest_unlock(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {}

        fn on_quest_complete(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {}

        fn on_quest_claim(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {}
    }

    #[abi(embed_v0)]
    impl PlayImpl of IPlay<ContractState> {
        fn new(ref self: ContractState) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Initialize components
            self.playable.new(world)
        }

        fn start(ref self: ContractState, pack_id: u64) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Start game
            self.playable.start(world, pack_id)
        }

        fn pull(ref self: ContractState, pack_id: u64, game_id: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Pull game
            self.playable.pull(world, pack_id, game_id)
        }

        fn cash_out(ref self: ContractState, pack_id: u64, game_id: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Cash out game
            self.playable.cash_out(world, pack_id, game_id)
        }

        fn enter(ref self: ContractState, pack_id: u64, game_id: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Enter game
            self.playable.enter(world, pack_id, game_id)
        }

        fn buy(ref self: ContractState, pack_id: u64, game_id: u8, mut indices: Span<u8>) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Buy items
            self.playable.buy(world, pack_id, game_id, ref indices)
        }

        fn exit(ref self: ContractState, pack_id: u64, game_id: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Exit shop
            self.playable.exit(world, pack_id, game_id)
        }

        fn refresh(ref self: ContractState, pack_id: u64, game_id: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Refresh shop
            self.playable.refresh(world, pack_id, game_id)
        }

        fn burn(ref self: ContractState, pack_id: u64, game_id: u8, bag_index: u8) {
            // [Setup] World
            let world = self.world(@NAMESPACE());
            // [Effect] Burn orb from bag
            self.playable.burn(world, pack_id, game_id, bag_index)
        }
    }
}

