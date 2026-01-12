import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GameScene, GameShop } from "@/components/containers";
import {
  GameGraph,
  Multiplier,
  OrbDisplay,
  Profile,
} from "@/components/elements";
import {
  BagIcon,
  BombIcon,
  ChipIcon,
  HeartIcon,
  HomeIcon,
  MoonrockIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTokenAddress } from "@/config";
import { useEntitiesContext } from "@/contexts";
import { toDecimal, usePulls, useTokens } from "@/hooks";
import { useActions } from "@/hooks/actions";

export const Game = () => {
  const [searchParams] = useSearchParams();
  const { chain } = useNetwork();
  const { account, connector } = useAccount();
  const { cashOut, pull, enter, buyAndExit } = useActions();
  const navigate = useNavigate();
  const { pack, game, config, setPackId, setGameId } = useEntitiesContext();
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [stashOpen, setStashOpen] = useState(false);
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
      setMilestoneDialogOpen(true);
    }
  }, [game]);

  if (!pack || !game) return null;

  // Game over screen
  if (game.over) {
    return (
      <div className="absolute inset-0 flex flex-col gap-8 max-w-[420px] m-auto py-6 px-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
          <BombIcon className="w-24 h-24 text-red-400" />
          <div className="flex flex-col gap-3">
            <h1 className="text-white uppercase text-3xl font-glitch">
              GAME OVER
            </h1>
            <p className="text-green-600 font-secondary text-sm tracking-wide max-w-xs">
              You ran out of health! Your final score was{" "}
              <span className="text-white font-bold">{game.points}</span> points
              on level {game.level}.
            </p>
          </div>
        </div>

        <div className="flex items-stretch gap-3 w-full pt-2">
          <Button
            variant="secondary"
            className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
            onClick={() => navigate("/games")}
          >
            ← GAMES
          </Button>
          <Button
            variant="default"
            className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
            onClick={() => navigate("/")}
          >
            HOME
          </Button>
        </div>
      </div>
    );
  }

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

  // Stash view - shows player's orbs
  if (stashOpen) {
    // Filter out bombs and empty orbs for display
    const displayOrbs = game.bag.filter((orb) => !orb.isBomb() && !orb.isNone());
    
    return (
      <div className="absolute inset-0 flex flex-col gap-4 max-w-[420px] m-auto py-6 px-4">
        {/* Header - same style as ORB SHOP */}
        <div className="flex items-center justify-between">
          <h1 className="text-white uppercase text-3xl font-primary">YOUR ORBS</h1>
          <div
            className="flex items-center gap-1 px-4 py-2 rounded"
            style={{ backgroundColor: "rgba(100, 50, 0, 0.3)" }}
          >
            <ChipIcon size="sm" className="text-orange-100" />
            <span className="text-orange-100 font-secondary text-lg">
              {game.chips}
            </span>
          </div>
        </div>

        {/* Subtitle - same style as shop */}
        <p className="text-green-600 font-secondary text-sm tracking-wide">
          Orbs in your bag that can be pulled
        </p>

        {/* Orbs grid */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {displayOrbs.length > 0 ? (
            <div className="grid grid-cols-3 gap-6 py-4 justify-items-center">
              {displayOrbs.map((orb, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <OrbDisplay orb={orb} size="lg" />
                  <p className="text-green-500 text-xs font-secondary uppercase tracking-wide">
                    {orb.name()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <p className="text-green-600 text-center font-secondary text-sm tracking-wide">
                No orbs in your bag yet
              </p>
            </div>
          )}
        </div>

        {/* Action button - same style as shop */}
        <div className="flex items-stretch gap-3 w-full pt-2">
          <Button
            variant="secondary"
            className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
            onClick={() => setStashOpen(false)}
          >
            ← BACK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full-width header */}
      <div className="absolute top-0 left-0 right-0 py-4 px-4">
        {/* Home button (left) */}
        <Button
          variant="secondary"
          className="h-12 w-12 p-0 absolute left-4 top-4"
          onClick={() => navigate("/")}
        >
          <HomeIcon size="sm" className="text-green-400" />
        </Button>

        {/* Center: Moonrocks + Chips - aligned with game content */}
        <div className="flex items-stretch gap-3 max-w-[420px] mx-auto px-4">
          {/* Moonrocks (blue) */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 min-h-12 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#0D2530]"
          >
            <MoonrockIcon className="w-5 h-5 text-blue-400" />
            <span className="font-secondary text-sm tracking-widest text-blue-400">
              {Math.floor(moonrocks).toLocaleString()}
            </span>
          </button>
          {/* Chips (orange) */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 min-h-12 rounded-lg transition-all duration-200 hover:brightness-110 bg-[#302510]"
          >
            <ChipIcon className="w-5 h-5 text-orange-400" />
            <span className="font-secondary text-sm tracking-widest text-orange-400">
              {game.chips.toLocaleString()}
            </span>
          </button>
        </div>

        {/* Profile (right) */}
        <Profile
          username={username || "..."}
          className="w-auto px-4 absolute right-4 top-4"
        />
      </div>

      <div className="absolute inset-0 flex flex-col gap-4 max-w-[420px] m-auto py-6 px-4 pt-24">
        {/* Points & Goal Progress */}
        <div className="flex items-center gap-6">
          {/* Current Points */}
          <span
            className="text-green-400 text-5xl font-glitch"
            style={{ textShadow: "0 0 20px rgba(74, 222, 128, 0.3)" }}
          >
            {game.points}
          </span>
          {/* Goal Progress */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-secondary text-sm tracking-wider">
                Goal
              </span>
              <span className="text-green-400 font-secondary text-sm tracking-widest">
                {game.milestone}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-5 bg-green-950 rounded-sm overflow-hidden">
              <div
                className="h-full bg-green-700 rounded-l-sm transition-all duration-300"
                style={{
                  width: `${Math.min((game.points / game.milestone) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

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
          {/* Hearts */}
          <div className="flex items-center gap-0.5 border border-green-900 rounded-lg px-2 py-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <HeartIcon
                key={i}
                className="w-6 h-6"
                style={
                  i < game.health
                    ? {
                        color: "#FF0080",
                        filter: "drop-shadow(0 0 4px #FF0080)",
                      }
                    : {
                        color: "rgba(20, 83, 45, 0.3)",
                      }
                }
              />
            ))}
          </div>
          {/* Multiplier */}
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
            onClick={() => cashOut(pack.id, game.id)}
          >
            CASH OUT
          </button>
        </div>
      </div>

      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="bg-green-gradient-100 border-green-700 rounded-xl max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="text-white tracking-wide">
              Milestone Reached!
            </DialogTitle>
            <DialogDescription className="text-white/50 text-sm font-secondary">
              Congratulations! You've reached {game.milestone} points. Do you
              want to cash out or continue playing?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 font-secondary text-sm tracking-widest"
              onClick={() => {
                cashOut(pack.id, game.id)
                  .then(() => {
                    setMilestoneDialogOpen(false);
                  })
                  .catch((error) => {
                    console.error(error);
                    setMilestoneDialogOpen(false);
                  });
              }}
            >
              Cash Out
            </Button>
            <Button
              variant="secondary"
              className="flex-1 font-secondary text-sm tracking-widest"
              onClick={() => {
                enter(pack.id, game.id)
                  .then(() => {
                    setMilestoneDialogOpen(false);
                  })
                  .catch((error) => {
                    console.error(error);
                    setMilestoneDialogOpen(false);
                  });
              }}
            >
              Enter Shop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
