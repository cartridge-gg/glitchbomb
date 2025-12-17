use core::pedersen::pedersen;
use starknet::{ContractAddress, get_contract_address};
use crate::interfaces::vrf::{IVrfProviderDispatcher, IVrfProviderDispatcherTrait, Source};

#[derive(Copy, Drop, Serde)]
pub struct Random {
    pub seed: felt252,
    pub nonce: usize,
}

#[generate_trait]
pub impl RandomImpl of RandomTrait {
    fn new() -> Random {
        Random { seed: seed(get_contract_address()), nonce: 0 }
    }

    // https://docs.cartridge.gg/vrf/overview
    fn new_vrf(vrf_provider_disp: IVrfProviderDispatcher) -> Random {
        let seed = vrf_provider_disp.consume_random(Source::Nonce(get_contract_address()));
        Random { seed, nonce: 0 }
    }

    fn next_seed(ref self: Random) -> felt252 {
        self.nonce += 1;
        self.seed = pedersen(self.seed, self.nonce.into());
        self.seed
    }

    fn felt(ref self: Random) -> felt252 {
        let tx_hash = starknet::get_tx_info().unbox().transaction_hash;
        let seed = self.next_seed();
        pedersen(tx_hash, seed)
    }
}

fn seed(salt: ContractAddress) -> felt252 {
    pedersen(starknet::get_tx_info().unbox().transaction_hash, salt.into())
}
