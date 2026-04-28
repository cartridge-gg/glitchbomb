import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

function Typography(props: PropsWithChildren) {
  return <div className="flex gap-4" {...props} />;
}

function Title({
  name,
  label,
  className,
}: {
  name: string;
  label: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <p className="text-[9px]/[9px] tracking-widest uppercase font-mono text-green">
          {name}
        </p>
        <p className={cn("uppercase", className)}>{label}</p>
      </div>
      <div className="w-full h-px bg-white opacity-15" />
    </div>
  );
}

const meta: Meta<typeof Typography> = {
  title: "Styles/Typography",
  component: Typography,
  parameters: {
    layout: "padded",
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

type Story = StoryObj<typeof Typography>;

export const Primary: Story = {
  args: {
    children: (
      <div className="flex gap-4 w-full">
        <div className="flex flex-col gap-4 text-white w-full">
          <Title
            name="Title one"
            label="Rubik One 72pT"
            className="font-primary text-7xl"
          />
          <Title
            name="Title two"
            label="Rubik One 48pT"
            className="font-primary text-5xl"
          />
          <Title
            name="Title three"
            label="Rubik One 32pT"
            className="font-primary text-[32px]"
          />
          <Title
            name="Heading one"
            label="Rubik One 24pT"
            className="font-primary text-2xl"
          />
        </div>
      </div>
    ),
  },
};

export const Secondary: Story = {
  args: {
    children: (
      <div className="flex gap-4 w-full">
        <div className="flex flex-col gap-4 text-white w-full">
          <Title
            name="Text XXL"
            label="VT323 - Regular - 24pT"
            className="font-secondary text-2xl"
          />
          <Title
            name="Text XL"
            label="VT323 - Regular - 20pT"
            className="font-secondary text-xl"
          />
          <Title
            name="Text L"
            label="VT323 - Regular - 18pT"
            className="font-secondary text-lg"
          />
          <Title
            name="Text M"
            label="VT323 - Regular - 16pT"
            className="font-secondary text-base"
          />
          <Title
            name="Text SM"
            label="VT323 - Regular - 14pT"
            className="font-secondary text-sm"
          />
          <Title
            name="Text XS"
            label="VT323 - Regular - 12pT"
            className="font-secondary text-xs"
          />
          <Title
            name="Text XXS"
            label="VT323 - Regular - 10pT"
            className="font-secondary text-2xs"
          />
        </div>
      </div>
    ),
  },
};

export const Animated: Story = {
  args: {
    children: (
      <div className="flex gap-4 w-full">
        <div className="flex flex-col gap-4 text-white w-full">
          <Title
            name="Title one"
            label="Rubik One + animate-glitch 72pT"
            className="font-primary animate-glitch text-7xl"
          />
          <Title
            name="Title two"
            label="Rubik One + animate-glitch 48pT"
            className="font-primary animate-glitch text-5xl"
          />
          <Title
            name="Title three"
            label="Rubik One + animate-glitch 32pT"
            className="font-primary animate-glitch text-[32px]"
          />
          <Title
            name="Heading one"
            label="Rubik One + animate-glitch 24pT"
            className="font-primary animate-glitch text-2xl"
          />
        </div>
      </div>
    ),
  },
};

export const Glitch: Story = {
  args: {
    children: (
      <div className="flex gap-4 w-full">
        <div className="flex flex-col gap-4 text-white w-full">
          <Title
            name="Title one"
            label="Rubik Glitch 72pT"
            className="font-glitch text-7xl"
          />
          <Title
            name="Title two"
            label="Rubik Glitch 48pT"
            className="font-glitch text-5xl"
          />
          <Title
            name="Title three"
            label="Rubik Glitch 32pT"
            className="font-glitch text-[32px]"
          />
          <Title
            name="Heading one"
            label="Rubik Glitch 24pT"
            className="font-glitch text-2xl"
          />
        </div>
      </div>
    ),
  },
};
