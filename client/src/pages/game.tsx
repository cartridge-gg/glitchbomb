import type ControllerConnector from "@cartridge/connector/controller";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { GameScene, GameShop } from "@/components/containers";
import { Multiplier, OrbDisplay, Profile } from "@/components/elements";
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
import { useEntitiesContext } from "@/contexts";
import { usePulls, useTokens, toDecimal } from "@/hooks";
import { useActions } from "@/hooks/actions";

export const Game = () => {
  const [searchParams] = useSearchParams();
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

  // Token balance for moonrocks
  const { tokenContracts, tokenBalances } = useTokens({
    contractAddresses: config?.token ? [config.token] : [],
    accountAddresses: account?.address ? [account.address] : [],
  });

  const tokenContract = tokenContracts?.[0];
  const tokenBalance = tokenBalances?.find(
    (b) =>
      tokenContract &&
      BigInt(b.contract_address) === BigInt(tokenContract.contract_address),
  );
  const moonrocks = tokenContract
    ? Math.floor(toDecimal(tokenContract, tokenBalance))
    : 0;

  // Pulls data for future use (e.g., pull history display)
  usePulls({
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
    return (
      <div className="absolute inset-0 flex flex-col gap-6 max-w-[420px] m-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-glitch text-2xl">YOUR ORBS</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStashOpen(false)}
          >
            ← BACK
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {game.bag.map((orb, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <OrbDisplay orb={orb} size="lg" />
                <p className="text-green-500 text-xs font-secondary uppercase">
                  {orb.name()}
                </p>
              </div>
            ))}
          </div>
          {game.bag.length === 0 && (
            <p className="text-green-600 text-center font-secondary">
              No orbs in your bag yet
            </p>
          )}
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
              {moonrocks.toLocaleString()}
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
        <Profile username={username || "..."} className="w-auto px-4 absolute right-4 top-4" />
      </div>

      <div className="absolute inset-0 flex flex-col gap-4 max-w-[420px] m-auto py-6 px-4 pt-24">
        {/* Points & Goal Progress */}
        <div className="flex items-center gap-4">
          {/* Current Points */}
          <span className="text-green-400 text-5xl font-glitch">
            {game.points}
          </span>
          {/* Goal Progress */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-green-500 font-secondary text-sm tracking-wider">
                Goal:
              </span>
              <span className="text-green-400 font-secondary text-sm tracking-widest">
                {game.milestone}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-green-950 rounded-full overflow-hidden border border-green-800">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((game.points / game.milestone) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

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
