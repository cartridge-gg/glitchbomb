import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { cva, type VariantProps } from "class-variance-authority";
import { useCallback } from "react";
import { Connect, Profile } from "@/components/elements";

export interface ConnectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof connectionVariants> {}

// eslint-disable-next-line react-refresh/only-export-components
export const connectionVariants = cva("", {
  variants: {
    variant: {
      default: "flex",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Connection = ({
  variant,
  className,
  ...props
}: ConnectionProps) => {
  const { account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();

  const onProfileClick = useCallback(async () => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
  }, [connector]);

  const onConnectClick = useCallback(async () => {
    console.log({ connectors });
    await connectAsync({ connector: connectors[0] });
  }, [connectAsync, connectors]);

  return (
    <div className={connectionVariants({ variant, className })} {...props}>
      {account ? (
        <Profile onClick={onProfileClick} />
      ) : (
        <Connect onClick={onConnectClick} />
      )}
    </div>
  );
};
