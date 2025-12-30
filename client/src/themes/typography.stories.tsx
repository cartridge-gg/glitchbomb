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
        <p className="text-[9px]/[9px] tracking-widest uppercase font-mono text-green-100">
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
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0F1410" }],
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
            label="RUBIK 72pT"
            className="font-primary text-7xl"
          />
          <Title
            name="Title two"
            label="RUBIK 48pT"
            className="font-primary text-5xl"
          />
          <Title
            name="Title three"
            label="RUBIK 32pT"
            className="font-primary text-[32px]"
          />
          <Title
            name="Heading one"
            label="RUBIK 24pT"
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
            label="VCR OSD Mono - regULAR - 24pT"
            className="font-secondary text-2xl"
          />
          <Title
            name="Text XL"
            label="VCR OSD Mono - regULAR - 20pT"
            className="font-secondary text-xl"
          />
          <Title
            name="Text L"
            label="VCR OSD Mono - regULAR - 18pT"
            className="font-secondary text-lg"
          />
          <Title
            name="Text M"
            label="VCR OSD Mono - regULAR - 16pT"
            className="font-secondary text-base"
          />
          <Title
            name="Text SM"
            label="VCR OSD Mono - regULAR - 14pT"
            className="font-secondary text-sm"
          />
          <Title
            name="Text XS"
            label="VCR OSD Mono - regULAR - 12pT"
            className="font-secondary text-xs"
          />
          <Title
            name="Text XXS"
            label="VCR OSD Mono - regULAR - 10pT"
            className="font-secondary text-2xs"
          />
        </div>
      </div>
    ),
  },
};
