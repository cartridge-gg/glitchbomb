import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useNetwork } from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { Connect } from "@/components/elements";
import { Button } from "@/components/ui/button";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts";
import { useActions } from "@/hooks/actions";
import { toDecimal, useTokens } from "@/hooks/tokens";
import { isOfflineMode } from "@/offline/mode";
import { selectTotalMoonrocks, useOfflineStore } from "@/offline/store";

export const Home = () => {
  const { mint } = useActions();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { config } = useEntitiesContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>();
  const offlineState = useOfflineStore();
  const offline = isOfflineMode();

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
  const offlineMoonrocks = useMemo(
    () => selectTotalMoonrocks(offlineState),
    [offlineState],
  );

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
    if (!connector || offline) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((name) => setUsername(name));
  }, [connector, offline]);

  const isLoggedIn = offline || (!!account && !!username);
  const displayUsername = offline ? "Offline" : username;
  const displayMoonrocks = offline ? offlineMoonrocks : balance;

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      {isLoggedIn && (
        <AppHeader
          moonrocks={displayMoonrocks}
          username={displayUsername}
          showBack={false}
          onMint={offline ? undefined : () => mint(tokenAddress)}
          onProfileClick={offline ? undefined : onProfileClick}
        />
      )}

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
        <div className="flex flex-col items-center gap-6">
          <h1 className="uppercase text-center">
            <strong className="text-green-400 text-5xl md:text-7xl font-glitch font-thin">
              Glitch
            </strong>
            <br />
            <span className="text-white text-6xl md:text-8xl">Bomb</span>
          </h1>

          {isLoggedIn ? (
            <Button
              variant="default"
              className="h-12 w-full font-secondary uppercase text-sm tracking-widest"
              onClick={() => navigate("/games")}
            >
              PLAY
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <Connect highlight onClick={onConnectClick} />
              <Button
                variant="secondary"
                className="h-10 w-full font-secondary uppercase text-sm tracking-widest"
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
