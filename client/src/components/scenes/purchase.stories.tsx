import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { MAX_SCORE, STARTERPACK_COUNT } from "@/helpers/payout";
import { PurchaseScene, type PurchaseSceneProps } from "./purchase";

const meta = {
  title: "Scenes/Purchase",
  component: PurchaseScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen w-full p-4 md:p-6">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof PurchaseScene>;

export default meta;
type Story = StoryObj<
  Omit<PurchaseSceneProps, "stakesProps"> & {
    initialStakeIndex?: number;
    stakesTotal?: number;
  }
>;

const ONE_TOKEN = 1_000_000_000_000_000_000n;
const TARGET_SUPPLY = 1_000_000n * ONE_TOKEN;
const CURRENT_SUPPLY = 250_000n * ONE_TOKEN;

const PurchaseSceneWrapper = ({
  initialStakeIndex = 1,
  stakesTotal = STARTERPACK_COUNT,
  ...args
}: Omit<PurchaseSceneProps, "stakesProps"> & {
  initialStakeIndex?: number;
  stakesTotal?: number;
}) => {
  const [stakeIndex, setStakeIndex] = useState(initialStakeIndex);
  return (
    <PurchaseScene
      {...args}
      stakesProps={{
        total: stakesTotal,
        index: stakeIndex,
        setIndex: setStakeIndex,
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={1} />,
  args: {
    slotCount: MAX_SCORE,
    basePrice: 2.0,
    playPrice: 1.96,
    tokenPrice: 0.0042,
    multiplier: 1,
    targetSupply: TARGET_SUPPLY,
    currentSupply: CURRENT_SUPPLY,
    stakesTotal: STARTERPACK_COUNT,
    className: "w-full",
    onClose: fn(),
    onPurchase: fn(),
  },
};

export const HighTier: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={5} />,
  args: {
    slotCount: MAX_SCORE,
    basePrice: 10.0,
    playPrice: 9.5,
    tokenPrice: 0.0042,
    multiplier: 5,
    targetSupply: TARGET_SUPPLY,
    currentSupply: CURRENT_SUPPLY,
    stakesTotal: STARTERPACK_COUNT,
    className: "w-full",
    onClose: fn(),
    onPurchase: fn(),
  },
};

export const MaxTier: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={10} />,
  args: {
    slotCount: MAX_SCORE,
    basePrice: 20.0,
    playPrice: 18.0,
    tokenPrice: 0.0042,
    multiplier: 10,
    targetSupply: TARGET_SUPPLY,
    currentSupply: CURRENT_SUPPLY,
    stakesTotal: STARTERPACK_COUNT,
    className: "w-full",
    onClose: fn(),
    onPurchase: fn(),
  },
};

export const NoPrice: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={1} />,
  args: {
    slotCount: MAX_SCORE,
    basePrice: 2.0,
    playPrice: 1.96,
    tokenPrice: 0,
    multiplier: 1,
    loading: true,
    targetSupply: TARGET_SUPPLY,
    currentSupply: CURRENT_SUPPLY,
    stakesTotal: STARTERPACK_COUNT,
    className: "w-full",
    onClose: fn(),
    onPurchase: fn(),
  },
};

export const WithConnect: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={1} />,
  args: {
    slotCount: MAX_SCORE,
    basePrice: 2.0,
    playPrice: 1.96,
    tokenPrice: 0.0042,
    multiplier: 1,
    targetSupply: TARGET_SUPPLY,
    currentSupply: CURRENT_SUPPLY,
    stakesTotal: STARTERPACK_COUNT,
    className: "w-full",
    onClose: fn(),
    onConnect: fn(),
    onPurchase: fn(),
  },
};

export const ReadOnly: Story = {
  render: (args) => <PurchaseSceneWrapper {...args} initialStakeIndex={1} />,
  args: {
    slotCount: MAX_SCORE,
    basePrice: 2.0,
    playPrice: 1.96,
    tokenPrice: 0.0042,
    multiplier: 1,
    targetSupply: TARGET_SUPPLY,
    currentSupply: CURRENT_SUPPLY,
    stakesTotal: STARTERPACK_COUNT,
    className: "w-full",
    onClose: fn(),
  },
};
