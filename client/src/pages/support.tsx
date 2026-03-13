import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/containers";
import { mobilePath } from "@/utils/mobile";

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

      <div className="flex-1 overflow-y-auto px-4 pb-8 max-w-[600px] w-full mx-auto font-secondary text-sm tracking-wide leading-relaxed text-green-600 [&_*]:font-secondary">
        {/* How to Play */}
        <h2 className="text-lg tracking-widest text-green-400 uppercase mt-6 mb-3">
          How to Play
        </h2>
        <p>
          GlitchBomb is a risk-reward game. Pull orbs from a bag, collect
          points, and avoid bombs. Cash out before your health runs out.
        </p>
        <ul className="list-disc list-inside space-y-1 mt-3 ml-1">
          <li>Pull an orb — its effect applies immediately</li>
          <li>Point orbs add to your score</li>
          <li>Bomb orbs deal damage to your health</li>
          <li>Health orbs restore HP (max 5)</li>
          <li>Multiplier orbs boost all future points earned</li>
          <li>Moonrock and chip orbs give you shop currency</li>
        </ul>
        <p className="mt-3">
          When your points reach a milestone you can cash out or continue to the
          next level. Continuing opens a shop where you can buy new orbs, burn
          bad ones, or reroll for better options.
        </p>
        <p className="mt-3">
          If your health hits 0, the run ends. The higher you score before
          cashing out, the greater your reward — the payout curve is
          exponential.
        </p>

        {/* Contact */}
        <h2 className="text-lg tracking-widest text-green-400 uppercase mt-8 mb-3">
          Contact
        </h2>
        <p>Reach out to the Cartridge team for support:</p>
        <div className="mt-2 space-y-2">
          <a
            href="https://discord.gg/cartridge"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-green-300 hover:text-green-200 underline underline-offset-2"
          >
            Discord — discord.gg/cartridge
          </a>
          <a
            href="https://x.com/cartridge_gg"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-green-300 hover:text-green-200 underline underline-offset-2"
          >
            X — @cartridge_gg
          </a>
        </div>

        {/* Privacy Policy */}
        <h2 className="text-lg tracking-widest text-green-400 uppercase mt-8 mb-3">
          Privacy Policy
        </h2>
        <a
          href="https://cartridge.gg/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-green-300 hover:text-green-200 underline underline-offset-2"
        >
          Cartridge Privacy Policy
        </a>

        {/* Terms of Service */}
        <h2 className="text-lg tracking-widest text-green-400 uppercase mt-8 mb-3">
          Terms of Service
        </h2>
        <p>
          By playing GlitchBomb you agree to the Cartridge terms of service.
        </p>
        <a
          href="https://cartridge.gg/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-green-300 hover:text-green-200 underline underline-offset-2"
        >
          Cartridge Terms of Service
        </a>
      </div>
    </div>
  );
}
