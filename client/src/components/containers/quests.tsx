import { cva, type VariantProps } from "class-variance-authority";
import {
  QuestCard,
  type QuestCardProps,
} from "@/components/elements/quest-card";

const questsVariants = cva(
  "flex h-full w-full min-h-0 flex-col overflow-hidden",
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

export interface QuestsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questsVariants> {
  quests: (QuestCardProps & { id: string })[];
}

export const Quests = ({
  quests,
  variant,
  className,
  ...props
}: QuestsProps) => {
  const completed = quests.filter((quest) => quest.count >= quest.total);
  const remaining = quests.filter((quest) => quest.count < quest.total);

  return (
    <div className={questsVariants({ variant, className })} {...props}>
      {quests.length === 0 ? (
        <div className="flex h-full items-center justify-center rounded-lg bg-white-900 px-6 py-12">
          <p className="text-center text-white-400">
            <span className="font-secondary text-2xl/6">
              No quests available yet
            </span>
          </p>
        </div>
      ) : (
        <div
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1"
          style={{ scrollbarWidth: "none" }}
        >
          {remaining.length > 0 ? (
            <QuestSection title="Remaining">
              {remaining.map(({ id, ...quest }) => (
                <QuestCard key={id} {...quest} variant="default" />
              ))}
            </QuestSection>
          ) : null}

          {completed.length > 0 ? (
            <QuestSection title="Completed">
              {completed.map(({ id, ...quest }) => (
                <QuestCard key={id} {...quest} variant="complete" />
              ))}
            </QuestSection>
          ) : null}
        </div>
      )}
    </div>
  );
};

const QuestSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="flex flex-col gap-4">
      <h3>
        <span className="font-secondary text-2xl/6 text-white-400">
          {title}
        </span>
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
};
