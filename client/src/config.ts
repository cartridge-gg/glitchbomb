import { createDojoConfig } from "@dojoengine/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { shortString } from "starknet";
// import manifestMainnet from "../../manifest_mainnet.json";
// import manifestSepolia from "../../manifest_sepolia.json";

export const DEFAULT_CHAIN = import.meta.env.VITE_DEFAULT_CHAIN;
export const DEFAULT_CHAIN_ID = shortString.encodeShortString(
  import.meta.env.VITE_DEFAULT_CHAIN,
);

export const SEPOLIA_CHAIN_ID = shortString.encodeShortString("SN_SEPOLIA");
export const MAINNET_CHAIN_ID = shortString.encodeShortString("SN_MAIN");

export const chainName = {
  [SEPOLIA_CHAIN_ID]: "Starknet Sepolia",
  [MAINNET_CHAIN_ID]: "Starknet Mainnet",
};

export const manifests = {
  // [SEPOLIA_CHAIN_ID]: manifestSepolia,
  // [MAINNET_CHAIN_ID]: manifestMainnet,
};

export const chains = {
  [SEPOLIA_CHAIN_ID]: sepolia,
  [MAINNET_CHAIN_ID]: mainnet,
};

const dojoConfigSepolia = createDojoConfig({
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
  toriiUrl: import.meta.env.VITE_SEPOLIA_TORII_URL,
  manifest: {},
});

const dojoConfigMainnet = createDojoConfig({
  rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL,
  toriiUrl: import.meta.env.VITE_MAINNET_TORII_URL,
  manifest: {},
});

export const dojoConfigs = {
  [SEPOLIA_CHAIN_ID]: dojoConfigSepolia,
  [MAINNET_CHAIN_ID]: dojoConfigMainnet,
};