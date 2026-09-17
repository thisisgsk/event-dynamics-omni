import { GuidePose } from "@/components/sections/GuidePose";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function NotFound() {
  return (
    <main id="main" className="container-site flex min-h-svh flex-col items-start justify-center">
      <GuidePose pose="SUBPAGE" />
      <p className="eyebrow">404</p>
      <h1 className="mt-4 max-w-2xl display-lg">This room hasn’t been built yet.</h1>
      <div className="mt-10">
        <MagneticButton href="/" variant="glow" cursorLabel="Home">
          Back to home
        </MagneticButton>
      </div>
    </main>
  );
}
