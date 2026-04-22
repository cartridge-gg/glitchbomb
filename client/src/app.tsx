import ControllerConnector from "@cartridge/connector/controller";
import type { ControllerOptions, SessionPolicies } from "@cartridge/controller";
import { type Chain, mainnet, sepolia } from "@starknet-react/chains";
import {
  type Connector,
  jsonRpcProvider,
  StarknetConfig,
  voyager,
} from "@starknet-react/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { LoadingScreen } from "@/components/elements/loading-screen";
import { GameStartedNotifier } from "@/components/modules/game-started-notifier";
import {
  chains,
  DEFAULT_CHAIN_ID,
  getGameAddress,
  getTokenAddress,
  getVrfAddress,
} from "@/config";
import { EntitiesProvider } from "@/contexts";
import { AchievementsProvider } from "@/contexts/achievements-provider";
import { AppDataProvider } from "@/contexts/app-data-provider";
import { LoadingProvider } from "@/contexts/loading-context";
import { QuestsProvider } from "@/contexts/quests-provider";
import Router from "@/routes";
import { isMobile } from "@/utils/mobile";

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
          {
            entrypoint: "request_random",
            description: "Request random number",
          },
        ],
      },
      [tokenAddress]: {
        methods: [{ entrypoint: "mint", description: "Mint tokens" }],
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
  ...(isMobile ? {} : { policies: buildPolicies() }),
  preset: isMobile ? "glitch-bomb-mobile" : "glitch-bomb",
  // namespace: "GLITCHBOMB",
  slot: "glitchbomb",
};

const connectors = [new ControllerConnector(options) as never as Connector];

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <StarknetConfig
          autoConnect
          chains={[chains[DEFAULT_CHAIN_ID]]}
          connectors={connectors}
          explorer={voyager}
          provider={provider}
        >
          <LoadingProvider>
            <EntitiesProvider>
              <AppDataProvider>
                <QuestsProvider>
                  <AchievementsProvider>
                    <LoadingScreen />
                    <GameStartedNotifier />
                    <Router />
                  </AchievementsProvider>
                </QuestsProvider>
              </AppDataProvider>
            </EntitiesProvider>
          </LoadingProvider>
        </StarknetConfig>
      </QueryClientProvider>
      <Toaster
        position="top-left"
        duration={3000}
        expand
        visibleToasts={4}
        gap={8}
        offset={80}
        richColors
      />
    </>
  );
}

export default App;
