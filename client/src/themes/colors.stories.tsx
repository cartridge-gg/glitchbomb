import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";

function Colors(props: PropsWithChildren) {
  return <div className="flex gap-4" {...props} />;
}

function Palette({ color, label }: { color: string; label: string }) {
  return (
    <div className="size-36 flex flex-shrink-0 flex-col text-xs rounded-lg overflow-hidden">
      <div className={`${color} h-2/3 flex justify-center items-center`}>
        {window
          .getComputedStyle(document.documentElement)
          .getPropertyValue(color.replace("bg", "-"))}
      </div>
      <div className="bg-white text-black-100 flex justify-center items-center h-1/3">
        {label}
      </div>
    </div>
  );
}

const meta: Meta<typeof Colors> = {
  title: "Styles/Colors",
  component: Colors,
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0F1410" }],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Colors>;

export const Blue: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-blue" label="bg-blue" />
        <Palette color="bg-blue-100" label="bg-blue-100" />
        <Palette color="bg-blue-300" label="bg-blue-300" />
        <Palette color="bg-blue-500" label="bg-blue-500" />
      </>
    ),
  },
};

export const Green: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-green" label="bg-green" />
        <Palette color="bg-green-100" label="bg-green-100" />
        <Palette color="bg-green-300" label="bg-green-300" />
        <Palette color="bg-green-500" label="bg-green-500" />
      </>
    ),
  },
};

export const Yellow: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-yellow" label="bg-yellow" />
        <Palette color="bg-yellow-100" label="bg-yellow-100" />
        <Palette color="bg-yellow-300" label="bg-yellow-300" />
        <Palette color="bg-yellow-500" label="bg-yellow-500" />
      </>
    ),
  },
};

export const Orange: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-orange" label="bg-orange" />
        <Palette color="bg-orange-100" label="bg-orange-100" />
        <Palette color="bg-orange-300" label="bg-orange-300" />
        <Palette color="bg-orange-500" label="bg-orange-500" />
      </>
    ),
  },
};

export const Salmon: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-salmon" label="bg-salmon" />
        <Palette color="bg-salmon-100" label="bg-salmon-100" />
        <Palette color="bg-salmon-300" label="bg-salmon-300" />
        <Palette color="bg-salmon-500" label="bg-salmon-500" />
      </>
    ),
  },
};

export const Red: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-red" label="bg-red" />
        <Palette color="bg-red-100" label="bg-red-100" />
        <Palette color="bg-red-300" label="bg-red-300" />
        <Palette color="bg-red-500" label="bg-red-500" />
      </>
    ),
  },
};

export const Black: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-black" label="bg-black" />
        <Palette color="bg-black-100" label="bg-black-100" />
      </>
    ),
  },
};

export const MultiplierOne: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-multiplier-one-100" label="bg-multiplier-one-100" />
        <Palette color="bg-multiplier-one-200" label="bg-multiplier-one-200" />
      </>
    ),
  },
};

export const MultiplierTwo: Story = {
  args: {
    children: (
      <>
        <Palette color="bg-multiplier-two-100" label="bg-multiplier-two-100" />
        <Palette color="bg-multiplier-two-200" label="bg-multiplier-two-200" />
      </>
    ),
  },
};

export const MultiplierThree: Story = {
  args: {
    children: (
      <>
        <Palette
          color="bg-multiplier-three-100"
          label="bg-multiplier-three-100"
        />
        <Palette
          color="bg-multiplier-three-200"
          label="bg-multiplier-three-200"
        />
      </>
    ),
  },
};

export const MultiplierFour: Story = {
  args: {
    children: (
      <>
        <Palette
          color="bg-multiplier-four-100"
          label="bg-multiplier-four-100"
        />
        <Palette
          color="bg-multiplier-four-200"
          label="bg-multiplier-four-200"
        />
      </>
    ),
  },
};

export const MultiplierFive: Story = {
  args: {
    children: (
      <>
        <Palette
          color="bg-multiplier-five-100"
          label="bg-multiplier-five-100"
        />
        <Palette
          color="bg-multiplier-five-200"
          label="bg-multiplier-five-200"
        />
      </>
    ),
  },
};
