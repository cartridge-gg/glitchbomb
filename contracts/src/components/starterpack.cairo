#[starknet::component]
pub mod StarterpackComponent {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use crate::constants::{COST_TIER_PRICES, NUM_TIERS};
    use crate::interfaces::registry::IStarterpackRegistryDispatcherTrait;
    use crate::models::config::{ConfigAssert, ConfigTrait};
    use crate::models::starterpack::{StarterpackAssert, StarterpackTrait};
    use crate::store::StoreTrait;
    use crate::systems::play::{IPlayDispatcher, NAME as PLAY};

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        #[inline]
        fn initialize(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let mut store = StoreTrait::new(world);
            let config = store.config();
            let registry = config.registry();
            let payment_token = config.token().contract_address;
            let play_address = self.play(world).contract_address;
            let reissuable = true;
            let referral_percentage: u8 = 0;
            let metadata = StarterpackTrait::metadata(payment_token);

            // [Interaction] Register one starterpack per cost tier
            let prices = COST_TIER_PRICES();
            let mut i: u32 = 0;
            while i < NUM_TIERS {
                let price: u256 = *prices.span().at(i);
                let sp_id = registry
                    .register(
                        implementation: play_address,
                        referral_percentage: 0,
                        reissuable: reissuable,
                        price: price,
                        payment_token: payment_token,
                        payment_receiver: None,
                        metadata: metadata.clone(),
                    );
                let sp = StarterpackTrait::new(
                    sp_id, reissuable, referral_percentage, price, payment_token,
                );
                store.set_starterpack(@sp);
                i += 1;
            };
        }

        fn update_metadata(
            ref self: ComponentState<TContractState>, world: WorldStorage, starterpack_id: u32,
        ) {
            // [Setup] Store
            let mut store = StoreTrait::new(world);

            // [Check] Caller is allowed
            let config = store.config();
            config.assert_is_owner(starknet::get_caller_address());

            // [Check] Starterpack does exist
            store.starterpack(starterpack_id).assert_does_exist();

            // [Interaction] Update metadata
            let payment_token = config.token().contract_address;
            let registry = config.registry();
            registry.update_metadata(starterpack_id, StarterpackTrait::metadata(payment_token));
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        fn play(ref self: ComponentState<TContractState>, world: WorldStorage) -> IPlayDispatcher {
            let (play_address, _) = world.dns(@PLAY()).expect('Play not found!');
            IPlayDispatcher { contract_address: play_address }
        }
    }
}
