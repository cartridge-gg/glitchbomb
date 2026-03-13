import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { mobilePath } from "@/utils/mobile";

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-green-900/40 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-green-950/40 hover:bg-green-950/70 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-secondary text-sm tracking-widest text-green-300 uppercase">
          {title}
        </span>
        <span className="font-secondary text-green-500">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="px-4 py-4 space-y-3">{children}</div>}
    </div>
  );
}

export function Support() {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 flex flex-col">
      <AppHeader
        moonrocks={0}
        hideBalance
        showBack
        onBack={() => navigate(mobilePath("/"))}
      />

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3 max-w-[600px] w-full mx-auto font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
        <Section title="How to Play" defaultOpen>
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            GlitchBomb is a risk-reward game. Pull orbs from a bag, collect
            points, and avoid bombs. Cash out before your health runs out.
          </p>

          <p className="font-secondary text-sm tracking-wide text-green-300 mt-1">
            Core Loop
          </p>
          <ul className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70 list-disc list-inside space-y-1 ml-1">
            <li>Pull an orb — its effect applies immediately</li>
            <li>Point orbs add to your score</li>
            <li>Bomb orbs deal damage to your health</li>
            <li>Health orbs restore HP (max 5)</li>
            <li>Multiplier orbs boost all future points earned</li>
            <li>Moonrock and chip orbs give you shop currency</li>
          </ul>

          <p className="font-secondary text-sm tracking-wide text-green-300 mt-1">
            Milestones
          </p>
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            When your points reach a milestone you can cash out or continue to
            the next level. Continuing opens a shop where you can buy new orbs,
            burn bad ones, or reroll for better options.
          </p>

          <p className="font-secondary text-sm tracking-wide text-green-300 mt-1">
            Game Over
          </p>
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            If your health hits 0, the run ends. The higher you score before
            cashing out, the greater your reward — the payout curve is
            exponential.
          </p>
        </Section>

        <Section title="FAQ">
          <p className="font-secondary text-sm tracking-wide text-green-300">
            What happens when I cash out?
          </p>
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            Your score converts to GLITCH tokens. Higher scores earn
            exponentially more.
          </p>

          <p className="font-secondary text-sm tracking-wide text-green-300 mt-2">
            Can I lose my stake?
          </p>
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            Yes. If your health reaches 0, the game ends and you lose your
            stake.
          </p>

          <p className="font-secondary text-sm tracking-wide text-green-300 mt-2">
            What are curses?
          </p>
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            At higher levels, curses make the game harder — double bombs, sticky
            bombs, etc. Higher risk, higher reward.
          </p>
        </Section>

        <Section title="Contact">
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            Reach out to the Cartridge team for support:
          </p>
          <a
            href="https://discord.gg/cartridge"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-secondary text-sm tracking-wide text-green-400 hover:text-green-300 underline underline-offset-2"
          >
            Discord — discord.gg/cartridge
          </a>
          <a
            href="https://x.com/cartaboratory"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-secondary text-sm tracking-wide text-green-400 hover:text-green-300 underline underline-offset-2"
          >
            X — @cartaboratory
          </a>
        </Section>

        <Section title="Privacy Policy">
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            Game actions are recorded onchain. No personal data is collected
            beyond what is necessary for wallet authentication. Practice games
            are stored locally in your browser.
          </p>
          <a
            href="https://cartridge.gg/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-secondary text-sm tracking-wide text-green-400 hover:text-green-300 underline underline-offset-2"
          >
            Cartridge Privacy Policy
          </a>
        </Section>

        <Section title="Terms of Service">
          <p className="font-secondary text-sm tracking-wide leading-relaxed text-green-100/70">
            By playing GlitchBomb you agree to the Cartridge terms of service.
          </p>
          <a
            href="https://cartridge.gg/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-secondary text-sm tracking-wide text-green-400 hover:text-green-300 underline underline-offset-2"
          >
            Cartridge Terms of Service
          </a>
        </Section>
      </div>
    </div>
  );
}
