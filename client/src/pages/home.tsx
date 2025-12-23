import { useEffect } from "react";
import { useEntitiesContext } from "@/contexts";

export const Home = () => {
  const { config, starterpack, pack, game, setPackId, setGameId } =
    useEntitiesContext();

  useEffect(() => {
    setPackId(1);
    setGameId(1);
  }, [setPackId, setGameId]);

  console.log({ config, starterpack, pack, game });
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-primary-100">Home!</h1>
    </div>
  );
};
