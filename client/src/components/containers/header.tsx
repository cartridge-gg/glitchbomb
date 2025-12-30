import { useAccount, useNetwork } from "@starknet-react/core";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "react-router-dom";
import { Balance } from "@/components/elements";
import { Connection } from "@/components/modules";
import { getTokenAddress } from "@/config";
import { useActions } from "@/hooks/actions";
import { useTokens } from "@/hooks/tokens";
import { cn } from "@/lib/utils";
import logo from "/assets/logo.svg";

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {}

const headerVariants = cva("", {
  variants: {
    variant: {
      default: "w-full py-4 px-4 flex justify-between items-center",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Header = ({ variant, className, ...props }: HeaderProps) => {
  const { mint } = useActions();
  const { chain } = useNetwork();
  const { account } = useAccount();
  const { balance } = useTokens({
    accountAddresses: account?.address ? [account?.address] : [],
    contractAddresses: [getTokenAddress(chain.id)],
  });

  return (
    <div className={headerVariants({ variant, className })} {...props}>
      <Link to="/">
        <img src={logo} alt="logo" className="size-10" />
      </Link>
      <div className="flex items-center gap-4">
        <Balance
          balance={balance}
          onClick={mint}
          className={cn(
            "transition-opacity duration-300",
            account ? "opacity-100" : "opacity-0",
          )}
        />
        <Connection />
      </div>
    </div>
  );
};
