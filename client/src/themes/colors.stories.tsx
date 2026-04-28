import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";

function Colors(props: PropsWithChildren) {
  return <div className="flex gap-4" {...props} />;
}

function Palette({ color, label }: { color: string; label: string }) {
  return (
    <div className="size-36 flex flex-shrink-0 flex-col rounded-lg overflow-hidden">
      <div
        className={`${color} h-2/3 flex justify-center items-center font-secondary text-xs px-2`}
      >
        {window
          .getComputedStyle(document.documentElement)
          .getPropertyValue(color.replace("bg", "-"))}
      </div>
      <div className="bg-white text-black-100 flex justify-center items-center h-1/3 font-secondary text-xs">
        {label}
      </div>
    </div>
  );
}

const meta: Meta<typeof Colors> = {
  title: "Styles/Colors",
  component: Colors,
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0F1410" }],
    },
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Colors>;

export const Primary: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-primary" label="bg-primary" />
        <Palette color="bg-primary-100" label="bg-primary-100" />
        <Palette color="bg-primary-200" label="bg-primary-200" />
        <Palette color="bg-primary-300" label="bg-primary-300" />
        <Palette color="bg-primary-400" label="bg-primary-400" />
        <Palette color="bg-primary-500" label="bg-primary-500" />
        <Palette color="bg-primary-600" label="bg-primary-600" />
        <Palette color="bg-primary-700" label="bg-primary-700" />
        <Palette color="bg-primary-800" label="bg-primary-800" />
        <Palette color="bg-primary-900" label="bg-primary-900" />
      </div>
    ),
  },
};

export const Secondary: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-secondary" label="bg-secondary" />
        <Palette color="bg-secondary-100" label="bg-secondary-100" />
        <Palette color="bg-secondary-200" label="bg-secondary-200" />
        <Palette color="bg-secondary-300" label="bg-secondary-300" />
        <Palette color="bg-secondary-400" label="bg-secondary-400" />
        <Palette color="bg-secondary-500" label="bg-secondary-500" />
        <Palette color="bg-secondary-600" label="bg-secondary-600" />
        <Palette color="bg-secondary-700" label="bg-secondary-700" />
        <Palette color="bg-secondary-800" label="bg-secondary-800" />
        <Palette color="bg-secondary-900" label="bg-secondary-900" />
      </div>
    ),
  },
};

export const Tertiary: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-tertiary" label="bg-tertiary" />
        <Palette color="bg-tertiary-100" label="bg-tertiary-100" />
        <Palette color="bg-tertiary-200" label="bg-tertiary-200" />
        <Palette color="bg-tertiary-300" label="bg-tertiary-300" />
        <Palette color="bg-tertiary-400" label="bg-tertiary-400" />
        <Palette color="bg-tertiary-500" label="bg-tertiary-500" />
        <Palette color="bg-tertiary-600" label="bg-tertiary-600" />
        <Palette color="bg-tertiary-700" label="bg-tertiary-700" />
        <Palette color="bg-tertiary-800" label="bg-tertiary-800" />
        <Palette color="bg-tertiary-900" label="bg-tertiary-900" />
      </div>
    ),
  },
};

export const White: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-white" label="bg-white" />
        <Palette color="bg-white-100" label="bg-white-100" />
        <Palette color="bg-white-200" label="bg-white-200" />
        <Palette color="bg-white-300" label="bg-white-300" />
        <Palette color="bg-white-400" label="bg-white-400" />
        <Palette color="bg-white-500" label="bg-white-500" />
        <Palette color="bg-white-600" label="bg-white-600" />
        <Palette color="bg-white-700" label="bg-white-700" />
        <Palette color="bg-white-800" label="bg-white-800" />
        <Palette color="bg-white-900" label="bg-white-900" />
      </div>
    ),
  },
};

export const Black: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-black" label="bg-black" />
        <Palette color="bg-black-100" label="bg-black-100" />
        <Palette color="bg-black-200" label="bg-black-200" />
        <Palette color="bg-black-300" label="bg-black-300" />
        <Palette color="bg-black-400" label="bg-black-400" />
        <Palette color="bg-black-500" label="bg-black-500" />
        <Palette color="bg-black-600" label="bg-black-600" />
        <Palette color="bg-black-700" label="bg-black-700" />
        <Palette color="bg-black-800" label="bg-black-800" />
        <Palette color="bg-black-900" label="bg-black-900" />
      </div>
    ),
  },
};

export const Green: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-green" label="bg-green" />
        <Palette color="bg-green-100" label="bg-green-100" />
        <Palette color="bg-green-200" label="bg-green-200" />
        <Palette color="bg-green-300" label="bg-green-300" />
        <Palette color="bg-green-400" label="bg-green-400" />
        <Palette color="bg-green-500" label="bg-green-500" />
        <Palette color="bg-green-600" label="bg-green-600" />
        <Palette color="bg-green-700" label="bg-green-700" />
        <Palette color="bg-green-800" label="bg-green-800" />
        <Palette color="bg-green-900" label="bg-green-900" />
      </div>
    ),
  },
};

export const Pine: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-forest" label="bg-forest" />
        <Palette color="bg-forest-100" label="bg-forest-100" />
        <Palette color="bg-forest-200" label="bg-forest-200" />
        <Palette color="bg-forest-300" label="bg-forest-300" />
        <Palette color="bg-forest-400" label="bg-forest-400" />
        <Palette color="bg-forest-500" label="bg-forest-500" />
        <Palette color="bg-forest-600" label="bg-forest-600" />
        <Palette color="bg-forest-700" label="bg-forest-700" />
        <Palette color="bg-forest-800" label="bg-forest-800" />
        <Palette color="bg-forest-900" label="bg-forest-900" />
      </div>
    ),
  },
};

export const Blue: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-blue" label="bg-blue" />
        <Palette color="bg-blue-100" label="bg-blue-100" />
        <Palette color="bg-blue-200" label="bg-blue-200" />
        <Palette color="bg-blue-300" label="bg-blue-300" />
        <Palette color="bg-blue-400" label="bg-blue-400" />
        <Palette color="bg-blue-500" label="bg-blue-500" />
        <Palette color="bg-blue-600" label="bg-blue-600" />
        <Palette color="bg-blue-700" label="bg-blue-700" />
        <Palette color="bg-blue-800" label="bg-blue-800" />
        <Palette color="bg-blue-900" label="bg-blue-900" />
      </div>
    ),
  },
};

export const Yellow: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-yellow" label="bg-yellow" />
        <Palette color="bg-yellow-100" label="bg-yellow-100" />
        <Palette color="bg-yellow-200" label="bg-yellow-200" />
        <Palette color="bg-yellow-300" label="bg-yellow-300" />
        <Palette color="bg-yellow-400" label="bg-yellow-400" />
        <Palette color="bg-yellow-500" label="bg-yellow-500" />
        <Palette color="bg-yellow-600" label="bg-yellow-600" />
        <Palette color="bg-yellow-700" label="bg-yellow-700" />
        <Palette color="bg-yellow-800" label="bg-yellow-800" />
        <Palette color="bg-yellow-900" label="bg-yellow-900" />
      </div>
    ),
  },
};

export const Orange: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-orange" label="bg-orange" />
        <Palette color="bg-orange-100" label="bg-orange-100" />
        <Palette color="bg-orange-200" label="bg-orange-200" />
        <Palette color="bg-orange-300" label="bg-orange-300" />
        <Palette color="bg-orange-400" label="bg-orange-400" />
        <Palette color="bg-orange-500" label="bg-orange-500" />
        <Palette color="bg-orange-600" label="bg-orange-600" />
        <Palette color="bg-orange-700" label="bg-orange-700" />
        <Palette color="bg-orange-800" label="bg-orange-800" />
        <Palette color="bg-orange-900" label="bg-orange-900" />
      </div>
    ),
  },
};

export const Salmon: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-salmon" label="bg-salmon" />
        <Palette color="bg-salmon-100" label="bg-salmon-100" />
        <Palette color="bg-salmon-200" label="bg-salmon-200" />
        <Palette color="bg-salmon-300" label="bg-salmon-300" />
        <Palette color="bg-salmon-400" label="bg-salmon-400" />
        <Palette color="bg-salmon-500" label="bg-salmon-500" />
        <Palette color="bg-salmon-600" label="bg-salmon-600" />
        <Palette color="bg-salmon-700" label="bg-salmon-700" />
        <Palette color="bg-salmon-800" label="bg-salmon-800" />
        <Palette color="bg-salmon-900" label="bg-salmon-900" />
      </div>
    ),
  },
};

export const Red: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-red" label="bg-red" />
        <Palette color="bg-red-100" label="bg-red-100" />
        <Palette color="bg-red-200" label="bg-red-200" />
        <Palette color="bg-red-300" label="bg-red-300" />
        <Palette color="bg-red-400" label="bg-red-400" />
        <Palette color="bg-red-500" label="bg-red-500" />
        <Palette color="bg-red-600" label="bg-red-600" />
        <Palette color="bg-red-700" label="bg-red-700" />
        <Palette color="bg-red-800" label="bg-red-800" />
        <Palette color="bg-red-900" label="bg-red-900" />
      </div>
    ),
  },
};

export const Purple: Story = {
  args: {
    children: (
      <div className="flex gap-4 flex-wrap">
        <Palette color="bg-purple" label="bg-purple" />
        <Palette color="bg-purple-100" label="bg-purple-100" />
        <Palette color="bg-purple-200" label="bg-purple-200" />
        <Palette color="bg-purple-300" label="bg-purple-300" />
        <Palette color="bg-purple-400" label="bg-purple-400" />
        <Palette color="bg-purple-500" label="bg-purple-500" />
        <Palette color="bg-purple-600" label="bg-purple-600" />
        <Palette color="bg-purple-700" label="bg-purple-700" />
        <Palette color="bg-purple-800" label="bg-purple-800" />
        <Palette color="bg-purple-900" label="bg-purple-900" />
      </div>
    ),
  },
};
