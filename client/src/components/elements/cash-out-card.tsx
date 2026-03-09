import { MoonrockIcon } from "@/components/icons";
import { CardDivider } from "./card-divider";
import { InfoCard } from "./info-card";

const rewardValueClass =
  "font-secondary text-[clamp(0.9rem,3svh,1.5rem)] leading-none";
const rewardLabelClass =
  "font-secondary text-[clamp(0.5rem,1.1svh,0.7rem)] tracking-wider";
const rewardIconClass = "w-[clamp(18px,4svh,24px)] h-[clamp(18px,4svh,24px)]";

export interface CashOutCardProps {
  moonrocks: number;
  reward: number;
  cashOutValue?: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const CashOutCard = ({
  moonrocks,
  reward,
  cashOutValue,
  onClick,
  disabled = false,
  isLoading = false,
}: CashOutCardProps) => (
  <InfoCard
    variant="yellow"
    onClick={onClick}
    disabled={disabled}
    isLoading={isLoading}
    className="flex-1"
    contentClassName="p-[clamp(8px,2svh,12px)] gap-[clamp(8px,2.2svh,18px)]"
    labelClassName="text-[clamp(0.55rem,1.2svh,0.75rem)] tracking-[0.32em]"
    hideInner
  >
    {/* Custom header row: Cash Out label + Value pill */}
    <div className="flex items-center justify-between w-full">
      <span className="text-yellow-400 font-secondary text-sm tracking-[0.4em] uppercase text-[clamp(0.55rem,1.2svh,0.75rem)]">
        Cash Out
      </span>
      {cashOutValue && (
        <div
          className="flex items-center rounded-md overflow-hidden"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          <div
            className="flex items-center justify-center px-[clamp(6px,1.2svh,10px)] py-[clamp(2px,0.5svh,4px)]"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
          >
            <span className="text-yellow-400 font-secondary text-[clamp(0.45rem,0.9svh,0.6rem)] tracking-[0.25em] uppercase">
              Value
            </span>
          </div>
          <div className="w-px self-stretch bg-yellow-100 opacity-5" />
          <div className="flex items-center px-[clamp(6px,1.2svh,10px)] py-[clamp(2px,0.5svh,4px)]">
            <span className="text-yellow-400 font-secondary text-[clamp(0.55rem,1.1svh,0.75rem)] leading-none">
              {cashOutValue}
            </span>
          </div>
        </div>
      )}
    </div>

    <div className="flex gap-[clamp(8px,2.2svh,18px)] w-full h-full">
      {/* You Own Inner Card */}
      <div
        className="flex-1 flex flex-col rounded-lg overflow-hidden"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
      >
        <div className="py-[clamp(1px,0.4svh,3px)] px-[clamp(8px,1.6svh,12px)]">
          <span className="text-yellow-400/70 font-secondary text-[clamp(0.5rem,1.1svh,0.6rem)] tracking-[0.3em] uppercase">
            You Own
          </span>
        </div>
        <CardDivider className="bg-yellow-100" />
        <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(6px,2svh,18px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
          <div className="flex items-center justify-center gap-1">
            <MoonrockIcon className={`${rewardIconClass} text-yellow-400`} />
            <span className={`text-yellow-400 ${rewardValueClass}`}>
              {moonrocks}
            </span>
          </div>
          <span className={`text-yellow-400/70 ${rewardLabelClass}`}>
            Moon Rocks
          </span>
        </div>
      </div>

      {/* Reward Inner Card */}
      <div
        className="flex-1 flex flex-col rounded-lg overflow-hidden"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
      >
        <div className="py-[clamp(1px,0.4svh,3px)] px-[clamp(8px,1.6svh,12px)]">
          <span className="text-yellow-400 font-secondary text-[clamp(0.5rem,1.1svh,0.6rem)] tracking-[0.3em] uppercase">
            Reward
          </span>
        </div>
        <CardDivider className="bg-yellow-100" />
        <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(6px,2svh,18px)] py-[clamp(8px,2.2svh,16px)] px-[clamp(8px,2.2svh,14px)]">
          <div className="flex items-center justify-center gap-1">
            <MoonrockIcon className={`${rewardIconClass} text-yellow-400`} />
            <span className={`text-yellow-400 ${rewardValueClass}`}>
              +{reward}
            </span>
          </div>
          <span className={`text-yellow-400/70 ${rewardLabelClass}`}>
            Moon Rocks
          </span>
        </div>
      </div>
    </div>
  </InfoCard>
);
