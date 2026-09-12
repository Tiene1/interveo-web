import { LoginForm } from "@/features/auth/components/LoginForm";

export default function ConnexionPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 border-t-2 border-brand lg:grid-cols-2">
      <section className="flex flex-col justify-between gap-16 border-b border-line bg-paper-soft px-8 py-10 lg:border-b-0 lg:border-r lg:px-14">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-3 font-serif text-xl font-medium tracking-tight text-ink-1">
            SIM
            <span aria-hidden className="h-3.5 w-px bg-line-strong" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-soft">
            Interventions · Ivoire Maintenance
          </span>
        </div>

        <div className="flex max-w-[460px] flex-col gap-6">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
            <span aria-hidden className="h-px w-8 bg-ink-1" />
            Back-office · Direction d&apos;exploitation
          </div>
          <h1 className="font-serif text-[40px] font-normal leading-[1.05] tracking-[-0.035em] text-ink-1 lg:text-[56px] lg:leading-[1.02]">
            Piloter les interventions <span className="italic">terrain,</span> depuis le bureau.
          </h1>
          <p className="max-w-[400px] text-[15px] leading-[1.55] text-text-soft">
            Créez, attribuez et suivez les interventions de maintenance technique — climatisation,
            groupes électrogènes, électricité — depuis une interface unique.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
          <span>Abidjan · Côte d&apos;Ivoire</span>
          <span className="font-mono normal-case tracking-[0.02em] text-text-soft">v1.0 · Éd. 2026</span>
        </div>
      </section>

      <section className="flex items-center justify-center bg-paper px-8 py-14 lg:px-24">
        <LoginForm />
      </section>
    </main>
  );
}
