import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { Connect } from "@/components/elements";
import { Button } from "@/components/ui/button";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts/use-entities-context";
import { useActions } from "@/hooks/actions";
import { toDecimal, useTokens } from "@/hooks/tokens";

export const Home = () => {
  const { mint } = useActions();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { config } = useEntitiesContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>();

  // Use token address from Config (blockchain state) if available, fallback to manifest
  const tokenAddress = config?.token || getTokenAddress(chain.id);

  const { tokenBalances, tokenContracts } = useTokens({
    accountAddresses: account?.address ? [account?.address] : [],
    contractAddresses: [tokenAddress],
  });

  const balance = useMemo(() => {
    if (!tokenAddress) return 0;
    const tokenContract = tokenContracts.find(
      (contract) => BigInt(contract.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenContract) return 0;
    const tokenBalance = tokenBalances.find(
      (balance) => BigInt(balance.contract_address) === BigInt(tokenAddress),
    );
    if (!tokenBalance) return 0;
    return toDecimal(tokenContract, tokenBalance);
  }, [tokenContracts, tokenBalances, tokenAddress]);
  const onProfileClick = useCallback(() => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
  }, [connector]);

  const onConnectClick = useCallback(async () => {
    await connectAsync({ connector: connectors[0] });
  }, [connectAsync, connectors]);

  // Fetch username
  useEffect(() => {
    if (!connector) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((name) => setUsername(name));
  }, [connector]);

  const isLoggedIn = !!account && !!username;

  return (
    <div className="absolute inset-0">
      {/* Header overlay so hero stays centered to full viewport */}
      {isLoggedIn && (
        <div className="absolute inset-x-0 top-0 z-10">
          <AppHeader
            moonrocks={balance}
            username={username}
            showBack={false}
            onMint={() => mint(tokenAddress)}
            onProfileClick={onProfileClick}
          />
        </div>
      )}

      {/* Main content - centered */}
      <div className="flex h-full flex-col items-center justify-center px-4">
        <div className="flex w-full flex-col items-center gap-8">
          <h1 className="m-0 text-center uppercase leading-[0.9]">
            <strong className="block text-green-400 text-6xl sm:text-7xl md:text-8xl font-glitch font-thin tracking-tight">
              Glitch
            </strong>
            <span className="block text-white text-7xl sm:text-8xl md:text-9xl tracking-tight">
              Bomb
            </span>
          </h1>

          {isLoggedIn ? (
            <Button
              variant="default"
              className="h-12 min-w-44 px-10 font-secondary uppercase text-sm tracking-widest"
              onClick={() => navigate("/games")}
            >
              PLAY
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Connect
                highlight
                className="h-12 min-w-44 w-auto px-10"
                onClick={onConnectClick}
              />
              <Button
                variant="secondary"
                className="h-11 min-w-44 px-10 font-secondary uppercase text-sm tracking-widest"
                disabled
              >
                Play
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
