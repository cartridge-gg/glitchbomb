import {
  GameChoice,
  type gameChoiceProps,
} from "@/components/elements/game-choice";
import { cn } from "@/lib/utils";

export interface GameChoicesProps extends React.HTMLAttributes<HTMLDivElement> {
  continue: gameChoiceProps;
  cashOut: gameChoiceProps;
}

export const GameChoices = ({
  continue: continueProps,
  cashOut,
  className,
  ...props
}: GameChoicesProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:gap-4 items-stretch w-full",
        className,
      )}
      {...props}
    >
      <GameChoice variant="default" className="flex-1" {...continueProps} />
      <GameChoice variant="secondary" className="flex-1" {...cashOut} />
    </div>
  );
};
