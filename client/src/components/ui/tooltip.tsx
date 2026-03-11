import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[100] overflow-hidden rounded-md bg-black px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * TapTooltip — tooltip that also opens on tap for touch devices.
 * On hover-capable devices it behaves like a normal Radix tooltip.
 * On touch devices a tap toggles the tooltip; tapping outside closes it.
 */
const TapTooltip = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) => {
  const [open, setOpen] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setIsTouchDevice(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  React.useEffect(() => {
    if (!isTouchDevice || !open) return;
    const handleOutsideTap = (e: PointerEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideTap);
    return () => document.removeEventListener("pointerdown", handleOutsideTap);
  }, [isTouchDevice, open]);

  if (!isTouchDevice) {
    return <Tooltip {...props}>{children}</Tooltip>;
  }

  // On touch devices, intercept the trigger to toggle on tap
  const childArray = React.Children.toArray(children);
  const trigger = childArray.find(
    (child) => React.isValidElement(child) && child.type === TooltipTrigger,
  ) as React.ReactElement | undefined;
  const rest = childArray.filter(
    (child) => !(React.isValidElement(child) && child.type === TooltipTrigger),
  );

  return (
    <Tooltip {...props} open={open} onOpenChange={setOpen}>
      {trigger && (
        <TooltipTrigger asChild>
          <div
            ref={triggerRef}
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") {
                e.preventDefault();
                setOpen((prev) => !prev);
              }
            }}
          >
            {/* Unwrap the original trigger's children */}
            {React.isValidElement(trigger) && trigger.props.children}
          </div>
        </TooltipTrigger>
      )}
      {rest}
    </Tooltip>
  );
};

export { Tooltip, TapTooltip, TooltipTrigger, TooltipContent, TooltipProvider };
