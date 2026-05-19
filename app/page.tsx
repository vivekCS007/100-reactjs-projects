import Hero from "@/components/hero/hero";
import FluidCursor from "@/components/fluid-cursor";

export default function Home() {
  return (
    <section className="relative max-w-6xl py-25">
      <FluidCursor />
      <Hero />
    </section>
  );
}
