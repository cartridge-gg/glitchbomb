use starknet::ContractAddress;
use crate::interfaces::erc20::IERC20Dispatcher;
use crate::interfaces::registry::IStarterpackRegistryDispatcher;
pub use crate::models::index::Config;

pub mod errors {
    pub const CONFIG_CALLER_NOT_OWNER: felt252 = 'Config: caller not owner';
    pub const CONFIG_CALLER_NOT_REGISTRY: felt252 = 'Config: caller not registry';
}

#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    #[inline]
    fn new(
        id: felt252,
        token: ContractAddress,
        vrf: ContractAddress,
        registry: ContractAddress,
        owner: ContractAddress,
        fee_receiver: ContractAddress,
        entry_price: felt252,
    ) -> Config {
        Config {
            id: id,
            token: token,
            vrf: vrf,
            registry: registry,
            owner: owner,
            fee_receiver: fee_receiver,
            entry_price: entry_price,
        }
    }

    #[inline]
    fn registry(self: @Config) -> IStarterpackRegistryDispatcher {
        IStarterpackRegistryDispatcher { contract_address: *self.registry }
    }

    #[inline]
    fn token(self: @Config) -> IERC20Dispatcher {
        IERC20Dispatcher { contract_address: *self.token }
    }
}

#[generate_trait]
pub impl ConfigAssert of AssertTrait {
    fn assert_is_owner(self: @Config, caller: ContractAddress) {
        assert(caller == *self.owner, errors::CONFIG_CALLER_NOT_OWNER);
    }

    fn assert_is_registry(self: @Config, registry: ContractAddress) {
        assert(registry == *self.registry, errors::CONFIG_CALLER_NOT_REGISTRY);
    }
}
