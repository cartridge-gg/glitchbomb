import { cva, type VariantProps } from "class-variance-authority";
import { useState } from "react";
import {
	type ActivityFilter,
	Banners,
	GameActivities,
	type GameActivitiesProps,
	GameCards,
	type GameCardsProps,
} from "@/components/containers";
import type { BannerProps } from "@/components/elements";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/ui/glitch-text";
import { cn } from "@/lib/utils";
import { PlusIcon } from "../icons";

export interface HomeSceneProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPlay">,
		VariantProps<typeof homeSceneVariants> {
	gamesProps: GameCardsProps;
	allActivities: GameActivitiesProps;
	playerActivities: GameActivitiesProps;
	banners: BannerProps[];
	showDetails: boolean;
	onBuyGame: () => void;
	onShowDetailsChange: (show: boolean) => void;
	onLoadMoreActivities?: () => void;
	hasMoreActivities?: boolean;
	onRefreshActivities?: () => void;
}

const homeSceneVariants = cva("flex flex-col flex-1 min-h-0", {
	variants: {
		variant: {
			default: "",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export const HomeScene = ({
	gamesProps,
	allActivities,
	playerActivities,
	banners,
	showDetails,
	onBuyGame,
	onShowDetailsChange,
	onLoadMoreActivities,
	hasMoreActivities,
	onRefreshActivities,
	variant,
	className,
	...props
}: HomeSceneProps) => {
	const { gameId, onPlay, onNewGame, onPractice, requireLogin } = gamesProps;
	const [activityFilter, setActivityFilter] = useState<ActivityFilter>(
		playerActivities.activities.length > 0 ? "mine" : "all",
	);
	const activities =
		activityFilter === "all" ? allActivities : playerActivities;
	const isOnNewGameCard = !gameId;

	return (
		<div className={cn(homeSceneVariants({ variant, className }))} {...props}>
			<div className="flex-1 flex flex-col items-center px-2 pb-0 min-h-0 overflow-hidden">
				<div
					className={`flex flex-col gap-6 w-full max-w-[500px] min-h-0 flex-1`}
				>
					<Banners banners={banners} className="shrink-0" />

					<GameCards {...gamesProps} className="px-2" />

					<GameActivities
						{...activities}
						filter={activityFilter}
						onFilterChange={(filter) => {
							setActivityFilter(filter);
							if (filter === "all" && onRefreshActivities) {
								onRefreshActivities();
							}
						}}
						onLoadMore={
							activityFilter === "all" ? onLoadMoreActivities : undefined
						}
						hasMore={activityFilter === "all" ? hasMoreActivities : false}
						className="flex-1 overflow-hidden px-2"
					/>

					<div className="flex gap-4 px-2">
						<div className="flex-1" data-tutorial-id="practice-button">
							<Button
								variant="secondary"
								wrapperClassName="w-full"
								className="w-full h-12 font-secondary uppercase text-sm tracking-widest"
								onClick={
									showDetails
										? () => onShowDetailsChange(false)
										: () => requireLogin(onPractice)
								}
							>
								<GlitchText
									className="font-secondary text-2xl"
									text={showDetails ? "BACK" : "PRACTICE"}
								/>
							</Button>
						</div>

						<div className="flex-1">
							<Button
								variant={isOnNewGameCard ? "tertiary" : "secondary"}
								className={cn(
									"w-full h-12",
									!isOnNewGameCard && "bg-primary-600 hover:bg-primary-500",
								)}
								onClick={
									showDetails
										? onBuyGame
										: () =>
												requireLogin(() => {
													if (isOnNewGameCard) {
														onNewGame();
													} else if (gameId) {
														onPlay(gameId);
													}
												})
								}
							>
								<PlusIcon
									size="sm"
									className={isOnNewGameCard ? "" : "hidden"}
								/>
								<GlitchText
									className="font-secondary text-2xl"
									text={isOnNewGameCard ? "NEW GAME" : "CONTINUE"}
								/>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
