import { cva, type VariantProps } from "class-variance-authority";
import { Quests, type QuestsProps } from "@/components/containers/quests";
import { Close } from "@/components/elements/close";
import { QuestCount } from "@/components/elements/quest-count";
import { QuestGift } from "@/components/elements/quest-gift";
import { QuestRefresh } from "@/components/elements/quest-refresh";
import { GlitchText } from "@/components/ui/glitch-text";

const questSceneVariants = cva(
  "relative flex flex-col gap-6 overflow-hidden rounded-lg bg-[#040603] p-6 outline outline-4 -outline-offset-4 outline-green-600 md:p-8 md:items-center",
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

export interface QuestSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questSceneVariants> {
  questsProps: QuestsProps;
  onClose?: () => void;
}

export const QuestScene = ({
  questsProps,
  onClose,
  variant,
  className,
  ...props
}: QuestSceneProps) => {
  const completedCount = questsProps.quests.filter(
    (quest) => quest.count >= quest.total,
  ).length;

  return (
    <div className={questSceneVariants({ variant, className })} {...props}>
      {onClose ? (
        <Close size="md" className="absolute top-4 right-4" onClick={onClose} />
      ) : null}

      <div className="h-full w-full max-w-[720px] self-center overflow-hidden flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div className="pr-12 text-green-100 uppercase">
            <h2 className="text-2xl/8 tracking-tight md:text-[2.5rem]">
              <GlitchText
                text="Quests"
                style={{
                  textShadow:
                    "2px 2px 0px rgba(255, 0, 0, 0.25), -2px -2px 0px rgba(0, 0, 255, 0.25)",
                }}
              />
            </h2>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <QuestCount
                count={completedCount}
                total={questsProps.quests.length}
              />
              <QuestGift direction="left" />
            </div>

            <QuestRefresh expiration={questsProps.expiration} />
          </div>
        </div>

        <Quests {...questsProps} className="min-h-0 flex-1" />
      </div>
    </div>
  );
};
