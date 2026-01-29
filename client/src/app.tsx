import ControllerConnector from "@cartridge/connector/controller";
import type { ControllerOptions, SessionPolicies } from "@cartridge/controller";
import { type Chain, mainnet, sepolia } from "@starknet-react/chains";
import {
  type Connector,
  jsonRpcProvider,
  StarknetConfig,
  voyager,
} from "@starknet-react/core";
import { Toaster } from "sonner";
import { shortString } from "starknet";
import {
  chains,
  DEFAULT_CHAIN_ID,
  getGameAddress,
  getVrfAddress,
  getTokenAddress,
} from "@/config";
import { EntitiesProvider } from "@/contexts";
import Router from "@/routes";

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: chain.rpcUrls.cartridge.http[0] };
      case sepolia:
        return { nodeUrl: chain.rpcUrls.cartridge.http[0] };
      default:
        throw new Error(`Unsupported chain: ${chain.network}`);
    }
  },
});

const buildPolicies = () => {
  const chainId = BigInt(DEFAULT_CHAIN_ID);
  const gameAddress = getGameAddress(chainId);
  const vrfAddress = getVrfAddress(chainId);
  const tokenAddress = getTokenAddress(chainId);

  const policies: SessionPolicies = {
    contracts: {
      [gameAddress]: {
        methods: [
          { entrypoint: "start", description: "Start a new game" },
          { entrypoint: "pull", description: "Pull an orb" },
          { entrypoint: "cash_out", description: "Cash out and end the game" },
          { entrypoint: "enter", description: "Enter the shop at milestone" },
          { entrypoint: "buy", description: "Buy items in the shop" },
          { entrypoint: "exit", description: "Exit the shop" },
          { entrypoint: "refresh", description: "Refresh shop items" },
          { entrypoint: "burn", description: "Burn an item from bag" },
        ],
      },
      [vrfAddress]: {
        methods: [
          { entrypoint: "request_random", description: "Request random number" },
        ],
      },
      [tokenAddress]: {
        methods: [
          { entrypoint: "mint", description: "Mint tokens" },
        ],
      },
    },
  };
  return policies;
};

const buildChains = () => {
  const chain = chains[DEFAULT_CHAIN_ID];
  switch (chain) {
    case mainnet:
      return [{ rpcUrl: chain.rpcUrls.cartridge.http[0] }];
    case sepolia:
      return [{ rpcUrl: chain.rpcUrls.cartridge.http[0] }];
    default:
      throw new Error(`Unsupported chain: ${chain.network}`);
  }
};

const options: ControllerOptions = {
  defaultChainId: DEFAULT_CHAIN_ID,
  chains: buildChains(),
  policies: buildPolicies(),
  preset: "glitch-bomb",
  // namespace: "GLITCHBOMB",
  slot: "gb-bal",
};

const connectors = [new ControllerConnector(options) as never as Connector];

function App() {
  return (
    <>
      <StarknetConfig
        autoConnect
        chains={[chains[DEFAULT_CHAIN_ID]]}
        connectors={connectors}
        explorer={voyager}
        provider={provider}
      >
        <EntitiesProvider>
          <Router />
        </EntitiesProvider>
      </StarknetConfig>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
