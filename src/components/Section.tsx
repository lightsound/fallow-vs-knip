import type { ReactNode } from "react";
import { useInView } from "../hooks/useInView.ts";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: SectionProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      id={id}
      className="reveal mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-20 sm:py-24"
      data-shown={inView}
    >
      <header className="mb-12 max-w-3xl">
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-fallow-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-lg leading-relaxed text-knip-300">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}
