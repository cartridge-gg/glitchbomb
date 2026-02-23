#[starknet::component]
pub mod StarterpackComponent {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use crate::constants::{PRICE_MULTIPLIER, STARTERPACK_COUNT};
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
            // [Interaction] Register starterpack tiers
            let registry = config.registry();
            let payment_token = config.token().contract_address;
            let play_address = self.play(world).contract_address;
            let reissuable = true;
            let referral_percentage = 0;
            let base_price: u256 = config.entry_price.into();
            let metadata = StarterpackTrait::metadata(payment_token);
            for index in 0..STARTERPACK_COUNT {
                let multiplier: u8 = index + 1;
                let stake: u256 = multiplier.into();
                let price: u256 = stake
                    * base_price
                    * (PRICE_MULTIPLIER - stake * PRICE_MULTIPLIER / 100)
                    / PRICE_MULTIPLIER;
                let id = registry
                    .register(
                        implementation: play_address,
                        referral_percentage: 0,
                        reissuable: reissuable,
                        price: price,
                        payment_token: payment_token,
                        payment_receiver: None,
                        metadata: metadata.clone(),
                    );
                let starterpack = StarterpackTrait::new(
                    id, reissuable, referral_percentage, multiplier, price, payment_token,
                );
                store.set_starterpack(@starterpack);
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
