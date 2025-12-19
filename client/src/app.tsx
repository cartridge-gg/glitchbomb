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
import { chains, DEFAULT_CHAIN_ID } from "@/config";
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
  const policies: SessionPolicies = {};
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
  policies:
    DEFAULT_CHAIN_ID === shortString.encodeShortString("SN_MSEPOLIA")
      ? undefined
      : buildPolicies(),
  preset: "glitch-bomb",
  // namespace: "GLITCHBOMB",
  // slot: "glitchbomb",
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
        <Router />
      </StarknetConfig>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
