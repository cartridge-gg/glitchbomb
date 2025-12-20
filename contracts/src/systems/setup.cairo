use starknet::ContractAddress;

pub fn NAME() -> ByteArray {
    "Setup"
}

#[starknet::interface]
pub trait ISetup<T> {
    fn set_entry_price(ref self: T, entry_price: felt252);
    fn set_registry(ref self: T, registry_address: ContractAddress);
    fn set_token(ref self: T, token: ContractAddress);
    fn set_owner(ref self: T, owner: ContractAddress);
    fn set_fee_receiver(ref self: T, fee_receiver: ContractAddress);
}

#[dojo::contract]
pub mod Setup {
    use core::num::traits::Zero;
    use dojo::world::{IWorldDispatcherTrait, WorldStorageTrait};
    use starknet::ContractAddress;
    use crate::components::starterpack::StarterpackComponent;
    use crate::constants::{CONFIG_ID, NAMESPACE};
    use crate::mocks::registry::NAME as REGISTRY;
    use crate::mocks::token::NAME as TOKEN;
    use crate::mocks::vrf::NAME as VRF;
    use crate::models::config::{ConfigAssert, ConfigTrait};
    use crate::store::StoreTrait;
    use super::ISetup;

    // Components

    component!(path: StarterpackComponent, storage: starterpack, event: StarterpackEvent);
    impl StarterpackInternalImpl = StarterpackComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        starterpack: StarterpackComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        StarterpackEvent: StarterpackComponent::Event,
    }

    fn dojo_init(
        ref self: ContractState,
        token: ContractAddress,
        vrf: ContractAddress,
        registry: ContractAddress,
        owner: ContractAddress,
        fee_receiver: ContractAddress,
        entry_price: felt252,
    ) {
        // [Setup] World and Store
        let mut world = self.world(@NAMESPACE());
        let store = StoreTrait::new(world);
        // [Effect] Create config
        let token = if token.is_non_zero() {
            token
        } else {
            world.dns_address(@TOKEN()).expect('Token not found!')
        };
        let vrf = if vrf.is_non_zero() {
            vrf
        } else {
            world.dns_address(@VRF()).expect('VRF not found!')
        };
        let registry = if registry.is_non_zero() {
            registry
        } else {
            world.dns_address(@REGISTRY()).expect('Registry not found!')
        };
        let config = ConfigTrait::new(
            id: CONFIG_ID,
            token: token,
            vrf: vrf,
            registry: registry,
            owner: owner,
            fee_receiver: fee_receiver,
            entry_price: entry_price,
        );
        store.set_config(@config);

        // [Event] Emit a new registered contract for torii to index
        let instance_name: felt252 = token.into();
        world
            .dispatcher
            .register_external_contract(
                namespace: NAMESPACE(),
                contract_name: "ERC20",
                instance_name: format!("{}", instance_name),
                contract_address: token,
                block_number: 1,
            );

        // [Effect] Initialize components
        self.starterpack.initialize(world);
    }

    #[abi(embed_v0)]
    impl SetupImpl of ISetup<ContractState> {
        fn set_entry_price(ref self: ContractState, entry_price: felt252) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let caller = starknet::get_caller_address();
            let mut config = store.config();
            config.assert_is_owner(caller);
            // [Effect] Update config
            config.entry_price = entry_price;
            store.set_config(@config);
        }

        fn set_registry(ref self: ContractState, registry_address: ContractAddress) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let mut config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_owner(caller);
            // [Effect] Update config
            config.registry = registry_address;
            store.set_config(@config);
        }

        fn set_token(ref self: ContractState, token: ContractAddress) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let mut config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_owner(caller);
            // [Effect] Update config
            config.token = token;
            store.set_config(@config);
        }

        fn set_owner(ref self: ContractState, owner: ContractAddress) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let mut config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_owner(caller);
            // [Effect] Update config
            config.owner = owner;
            store.set_config(@config);
        }

        fn set_fee_receiver(ref self: ContractState, fee_receiver: ContractAddress) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let mut config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_owner(caller);
            // [Effect] Update config
            config.fee_receiver = fee_receiver;
            store.set_config(@config);
        }
    }
}
