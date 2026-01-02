import { createDojoConfig } from "@dojoengine/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { addAddressPadding, shortString } from "starknet";
import manifestSepolia from "../../manifest_sepolia.json";
// import manifestMainnet from "../../manifest_mainnet.json";
import { NAMESPACE } from "./constants";

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
  [SEPOLIA_CHAIN_ID]: manifestSepolia,
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

export const getContractAddress = (
  chainId: bigint,
  namespace: string,
  contractName: string,
) => {
  const chainIdHex = `0x${chainId.toString(16)}`;

  const manifest = manifests[chainIdHex];
  const contract = manifest.contracts.find(
    (i) => i.tag === `${namespace}-${contractName}`,
  );
  return contract?.address || addAddressPadding("0x0");
};

export const getVrfAddress = (chainId: bigint) => {
  const decodedChainId = shortString.decodeShortString(
    `0x${chainId.toString(16)}`,
  );
  const fromEnv: string = import.meta.env[`VITE_${decodedChainId}_VRF`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv;
  return getContractAddress(chainId, NAMESPACE, "VRF");
};

export const getTokenAddress = (chainId: bigint) => {
  const decodedChainId = shortString.decodeShortString(
    `0x${chainId.toString(16)}`,
  );
  const fromEnv = import.meta.env[`VITE_${decodedChainId}_TOKEN`];
  if (fromEnv && BigInt(fromEnv) !== 0n) return fromEnv as string;
  return getContractAddress(chainId, NAMESPACE, "Token");
};

export const getCollectionAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Collection");
};

export const getGameAddress = (chainId: bigint) => {
  return getContractAddress(chainId, NAMESPACE, "Play");
};
