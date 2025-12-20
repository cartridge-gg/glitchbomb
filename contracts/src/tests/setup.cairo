pub mod setup {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait, world};
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, WorldStorageTestTrait,
        spawn_test_world,
    };
    use starknet::ContractAddress;
    use starknet::testing::{set_account_contract_address, set_contract_address};
    use crate::constants::NAMESPACE;
    use crate::interfaces::erc20::IERC20Dispatcher;
    use crate::interfaces::registry::IStarterpackRegistryDispatcher;
    use crate::interfaces::vrf::IVrfProviderDispatcher;
    use crate::mocks::registry::{NAME as REGISTRY, Registry};
    use crate::mocks::token::{NAME as TOKEN, Token};
    use crate::mocks::vrf::{NAME as VRF, Vrf};
    use crate::models::index as models;
    use crate::systems::collection::{Collection, ICollectionDispatcher, NAME as COLLECTION_NAME};
    use crate::systems::play::{IPlayDispatcher, NAME as PLAY_NAME, Play};
    use crate::systems::setup::{ISetupDispatcher, NAME as SETUP_NAME, Setup};

    // Constant

    pub fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    pub fn PLAYER() -> ContractAddress {
        'PLAYER'.try_into().unwrap()
    }

    #[derive(Copy, Drop)]
    pub struct Systems {
        pub play: IPlayDispatcher,
        pub collection: ICollectionDispatcher,
        pub setup: ISetupDispatcher,
        pub token: IERC20Dispatcher,
        pub vrf: IVrfProviderDispatcher,
        pub registry: IStarterpackRegistryDispatcher,
    }

    #[derive(Copy, Drop)]
    pub struct Context {
        pub player_id: felt252,
    }

    #[inline]
    fn setup_namespace() -> NamespaceDef {
        NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(models::m_Pack::TEST_CLASS_HASH),
                TestResource::Model(models::m_Game::TEST_CLASS_HASH),
                TestResource::Model(models::m_Starterpack::TEST_CLASS_HASH),
                TestResource::Model(models::m_Config::TEST_CLASS_HASH),
                TestResource::Contract(Collection::TEST_CLASS_HASH),
                TestResource::Contract(Play::TEST_CLASS_HASH),
                TestResource::Contract(Setup::TEST_CLASS_HASH),
                TestResource::Contract(Token::TEST_CLASS_HASH),
                TestResource::Contract(Vrf::TEST_CLASS_HASH),
                TestResource::Contract(Registry::TEST_CLASS_HASH),
            ]
                .span(),
        }
    }

    #[inline]
    fn setup_contracts() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@NAMESPACE(), @SETUP_NAME())
                .with_owner_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(
                    array![0, 0, 0, OWNER().into(), OWNER().into(), 1000000].span(),
                ),
            ContractDefTrait::new(@NAMESPACE(), @PLAY_NAME())
                .with_writer_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(array![].span()),
            ContractDefTrait::new(@NAMESPACE(), @COLLECTION_NAME())
                .with_owner_of([dojo::utils::bytearray_hash(@NAMESPACE())].span())
                .with_init_calldata(array![].span()),
        ]
            .span()
    }

    #[inline]
    pub fn spawn_game() -> (WorldStorage, Systems, Context) {
        // [Setup] World
        set_contract_address(OWNER());
        set_account_contract_address(OWNER());
        let namespace_def = setup_namespace();
        let world = spawn_test_world(world::TEST_CLASS_HASH, [namespace_def].span());
        world.sync_perms_and_inits(setup_contracts());
        // [Setup] Systems
        let (play_address, _) = world.dns(@PLAY_NAME()).expect('Play not found');
        let (collection_address, _) = world.dns(@COLLECTION_NAME()).expect('Collection not found');
        let (setup_address, _) = world.dns(@SETUP_NAME()).expect('Setup not found');
        let (token_address, _) = world.dns(@TOKEN()).expect('Token not found');
        let (vrf_address, _) = world.dns(@VRF()).expect('Vrf not found');
        let (registry_address, _) = world.dns(@REGISTRY()).expect('Registry not found');
        let systems = Systems {
            play: IPlayDispatcher { contract_address: play_address },
            collection: ICollectionDispatcher { contract_address: collection_address },
            setup: ISetupDispatcher { contract_address: setup_address },
            token: IERC20Dispatcher { contract_address: token_address },
            vrf: IVrfProviderDispatcher { contract_address: vrf_address },
            registry: IStarterpackRegistryDispatcher { contract_address: registry_address },
        };

        // [Setup] Context
        let context = Context { player_id: PLAYER().into() };

        // [Return]
        (world, systems, context)
    }
}
