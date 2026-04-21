import { cva, type VariantProps } from "class-variance-authority";
import {
  ReferralPayments,
  type ReferralPaymentsProps,
} from "@/components/containers/referral-payments";
import { Close } from "@/components/elements/close";
import { ReferralLink } from "@/components/elements/referral-link";
import { ReferralStat } from "@/components/elements/referral-stat";
import { GlitchText } from "@/components/ui/glitch-text";

const referralSceneVariants = cva(
  "relative flex flex-col gap-6 overflow-hidden rounded-lg bg-[#040603] p-6 outline outline-4 -outline-offset-4 outline-green-600 md:p-8",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ReferralSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof referralSceneVariants> {
  players: string;
  games: string;
  totalEarned: string;
  payments: ReferralPaymentsProps["payments"];
  onCopy?: () => void;
  onClose?: () => void;
  description?: string;
}

const defaultDescription =
  "Invite new players with your referral link and earn a referral fee for each GLITCHBOMB game that they play.";

export const ReferralScene = ({
  players,
  games,
  totalEarned,
  payments,
  onCopy,
  onClose,
  description = defaultDescription,
  variant,
  className,
  ...props
}: ReferralSceneProps) => {
  return (
    <div className={referralSceneVariants({ variant, className })} {...props}>
      {onClose ? (
        <Close size="md" className="absolute top-3 right-3" onClick={onClose} />
      ) : null}

      <h2 className="pr-12 text-2xl/8 uppercase tracking-tight text-green-100 md:text-[2.5rem]">
        <GlitchText
          text="Referrals"
          style={{
            textShadow:
              "2px 2px 0px rgba(255, 0, 0, 0.25), -2px -2px 0px rgba(0, 0, 255, 0.25)",
          }}
        />
      </h2>

      <p>
        <span className="font-secondary text-xl/[15px] text-green-400">
          {description}
        </span>
      </p>

      <ReferralLink onCopy={onCopy} className="self-start" />

      <div className="flex min-h-0 flex-1 flex-col gap-6 md:flex-row md:gap-6">
        <div className="flex flex-col gap-3 md:flex-1 md:gap-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <ReferralStat label="Players" value={players} />
            <ReferralStat label="Games" value={games} />
          </div>
          <ReferralStat label="Total Earned" value={totalEarned} />
        </div>

        <div className="flex min-h-0 flex-col md:flex-1">
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-white-900 p-3">
            <ReferralPayments
              payments={payments}
              className="max-h-[360px] md:h-full md:max-h-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
