import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CashOutConfirmation,
  GameHeader,
  GameOver,
  GameScene,
  GameShop,
  GameStash,
  MilestoneReached,
} from "@/components/containers";
import {
  GameGraph,
  HeartsDisplay,
  Multiplier,
  PointsProgress,
} from "@/components/elements";
import { BagIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts";
import { toDecimal, usePulls, useTokens } from "@/hooks";
import { useActions } from "@/hooks/actions";

export const Game = () => {
  const [searchParams] = useSearchParams();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const { pack, game, config, setPackId, setGameId } = useEntitiesContext();
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [stashOpen, setStashOpen] = useState(false);
  const [cashOutOpen, setCashOutOpen] = useState(false);
  const [username, setUsername] = useState<string>();

  // Fetch username
  useEffect(() => {
    if (!connector) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((name) => setUsername(name));
  }, [connector]);

  // Use token address from Config (blockchain state) if available, fallback to manifest
  const tokenAddress = config?.token || getTokenAddress(chain.id);

  // Token balance for moonrocks
  const { tokenContracts, tokenBalances } = useTokens({
    contractAddresses: tokenAddress ? [tokenAddress] : [],
    accountAddresses: account?.address ? [account.address] : [],
  });

  const moonrocks = useMemo(() => {
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

  // Pulls data for graph display
  const { pulls } = usePulls({
    packId: pack?.id ?? 0,
    gameId: game?.id ?? 0,
  });

  useEffect(() => {
    const packId = searchParams.get("pack");
    const gameId = searchParams.get("game");
    if (!packId || !gameId) return;
    setPackId(Number(packId));
    setGameId(Number(gameId));
  }, [setPackId, setGameId, searchParams]);

  useEffect(() => {
    if (game && game.points >= game.milestone && !game.over) {
      setMilestoneOpen(true);
    }
  }, [game]);

  if (!pack || !game) return null;

  // Game over screen
  if (game.over) {
    return <GameOver points={game.points} level={game.level} />;
  }

  // Shop view
  if (game.shop.length !== 0) {
    return (
      <div className="absolute inset-0 flex flex-col gap-8 max-w-[420px] m-auto py-6">
        <GameShop
          balance={game.chips}
          orbs={game.shop}
          bag={game.bag}
          onConfirm={(indices: number[]) =>
            buyAndExit(pack.id, game.id, indices)
          }
        />
      </div>
    );
  }

  // Milestone reached screen
  if (milestoneOpen) {
    return (
      <MilestoneReached
        milestone={game.milestone}
        onCashOut={() => {
          cashOut(pack.id, game.id)
            .then(() => setMilestoneOpen(false))
            .catch((error) => {
              console.error(error);
              setMilestoneOpen(false);
            });
        }}
        onEnterShop={() => {
          enter(pack.id, game.id)
            .then(() => setMilestoneOpen(false))
            .catch((error) => {
              console.error(error);
              setMilestoneOpen(false);
            });
        }}
      />
    );
  }

  // Stash view
  if (stashOpen) {
    return (
      <GameStash
        orbs={game.bag}
        chips={game.chips}
        onClose={() => setStashOpen(false)}
      />
    );
  }

  // Cash out confirmation
  if (cashOutOpen) {
    return (
      <CashOutConfirmation
        points={game.points}
        onConfirm={() => {
          cashOut(pack.id, game.id)
            .then(() => setCashOutOpen(false))
            .catch((error) => {
              console.error(error);
              setCashOutOpen(false);
            });
        }}
        onCancel={() => setCashOutOpen(false)}
      />
    );
  }

  return (
    <>
      {/* Full-width header */}
      <GameHeader
        moonrocks={moonrocks}
        chips={game.chips}
        username={username}
      />

      <div className="absolute inset-0 flex flex-col gap-4 max-w-[420px] m-auto py-6 px-4 pt-24">
        {/* Points & Goal Progress */}
        <PointsProgress points={game.points} milestone={game.milestone} />

        {/* Pull History Graph */}
        <GameGraph pulls={pulls} className="mt-8" />

        {/* Game Scene */}
        <GameScene
          className="grow"
          lives={game.health}
          bombs={game.distribution().bombs}
          orbs={game.pullables.length}
          values={game.distribution()}
          onPull={() => pull(pack.id, game.id)}
        />

        {/* Hearts (left) | Multiplier (right) */}
        <div className="flex items-center justify-between">
          <HeartsDisplay health={game.health} />
          <Multiplier count={game.multiplier} className="h-12 w-20" />
        </div>

        {/* Bottom row: Stash button | Cash Out button */}
        <div className="flex items-stretch gap-3">
          <Button
            variant="secondary"
            className="min-h-14 min-w-16"
            onClick={() => setStashOpen(true)}
          >
            <BagIcon className="w-6 h-6 text-green-400" />
          </Button>
          <button
            type="button"
            className="flex-1 min-h-14 font-secondary text-sm tracking-widest rounded-lg transition-all duration-200 hover:brightness-125 hover:shadow-[0_0_20px_rgba(128,0,128,0.5)]"
            style={{
              background: "linear-gradient(180deg, #4A1A6B 0%, #2D1052 100%)",
              border: "2px solid rgba(138, 43, 226, 0.4)",
              color: "#FF80FF",
            }}
            onClick={() => setCashOutOpen(true)}
          >
            CASH OUT
          </button>
        </div>
      </div>
    </>
  );
};
