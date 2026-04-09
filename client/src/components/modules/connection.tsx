import { Connect, Profile } from "@/components/elements";
import { useControllerAuth } from "@/hooks/use-controller-auth";

export const Connection = () => {
  const { username, isLoggedIn, handleConnect, handleOpenProfile } =
    useControllerAuth();

  return isLoggedIn && username ? (
    <Profile username={username} onClick={handleOpenProfile} />
  ) : (
    <Connect highlight onClick={handleConnect} />
  );
};
