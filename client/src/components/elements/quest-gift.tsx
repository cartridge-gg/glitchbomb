import { cva, type VariantProps } from "class-variance-authority";
import { GiftIcon } from "@/components/icons";

export interface QuestGiftProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questGiftVariants> {}

const questGiftVariants = cva(
  "flex size-10 items-center justify-center rounded-lg bg-green-700 text-green-100 cursor-pointer",
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

export const QuestGift = ({ variant, className, ...props }: QuestGiftProps) => {
  return (
    <div className={questGiftVariants({ variant, className })} {...props}>
      <GiftIcon size="sm" />
    </div>
  );
};
