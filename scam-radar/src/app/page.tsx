"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Link2,
  Gift,
  DollarSign,
  MessageSquare,
  Gamepad2,
  ScanSearch,
  Zap,
  CheckCircle2,
  ArrowRight,
  Users,
  GraduationCap,
  HeartHandshake,
  WifiOff,
  EyeOff,
  Languages,
  Scale,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { RULES } from "@/lib/rules";

const redFlagIcons: Record<string, typeof Zap> = {
  urgency: Zap,
  credential_request: Lock,
  suspicious_link: Link2,
  prize_claim: Gift,
  upfront_fee: DollarSign,
  threat: AlertTriangle,
};

const redFlagIds = ["urgency", "credential_request", "suspicious_link", "prize_claim", "upfront_fee", "threat"];

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-background to-background">
          <div className="container mx-auto px-4 pt-14 pb-12 md:pt-20 md:pb-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <span className="section-label mb-5">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("heroBadge")}
                </span>
                <h1 className="text-4xl md:text-5xl xl:text-[3.4rem] font-extrabold leading-[1.1] tracking-tight mb-5">
                  {t("heroTitleA")}{" "}
                  <span className="text-gradient">{t("heroTitleB")}</span>
                </h1>
                <p className="text-lg text-foreground/65 leading-relaxed mb-6 max-w-xl">
                  {t("heroSubtitle")}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {[t("heroPoints1"), t("heroPoints2"), t("heroPoints3")].map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[15px] text-foreground/80">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <Link href="/game" className="btn-primary flex-1 sm:flex-none sm:px-8">
                    <Gamepad2 className="h-5 w-5" aria-hidden="true" />
                    {t("playGame")}
                  </Link>
                  <Link href="/scanner" className="btn-secondary flex-1 sm:flex-none sm:px-8">
                    <ScanSearch className="h-5 w-5" aria-hidden="true" />
                    {t("scanMessage")}
                  </Link>
                </div>
                <p className="text-xs text-foreground/50 flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("heroNote")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
              >
                <Card variant="elevated" padding="lg" className="relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent via-emerald-400 to-accent" aria-hidden="true" />
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                        {t("scanMessage")}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        92 / 100
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-border p-4 text-sm leading-relaxed text-foreground/80 mb-4">
                      “URGENT: your account closes in 2 hours. Send your PIN to{" "}
                      <span className="bg-amber-100 text-amber-900 rounded px-1 font-medium">bit.ly/verify</span>{" "}
                      now.”
                    </div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {["False urgency", "Asks for PIN", "Shortened link"].map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2.5 py-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                          {flag}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border p-3 text-center">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                          {t("ruleBasedScore")}
                        </div>
                        <div className="text-2xl font-extrabold text-foreground">63</div>
                      </div>
                      <div className="rounded-xl border border-accent/30 bg-emerald-50/60 p-3 text-center">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-accent mb-1">
                          {t("aiIndependentRead")}
                        </div>
                        <div className="text-2xl font-extrabold text-accent">92</div>
                      </div>
                    </div>
                    <Link
                      href="/scanner"
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                    >
                      {t("scanMessage")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="border-y border-border bg-surface">
          <div className="container mx-auto px-4 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-sm text-foreground/70">
              <span className="inline-flex items-center gap-2 font-medium">
                <WifiOff className="h-4 w-4 text-accent" aria-hidden="true" />
                {t("trustOffline")}
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <EyeOff className="h-4 w-4 text-accent" aria-hidden="true" />
                {t("trustPrivate")}
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <Languages className="h-4 w-4 text-accent" aria-hidden="true" />
                {t("trustTrilingual")}
              </span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-16 md:py-24 scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="section-label mb-4">{t("navHow")}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{t("howTitle")}</h2>
              <p className="text-foreground/60 text-lg">{t("howSub")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { n: "1", icon: ListChecks, title: t("step1T"), desc: t("step1D") },
                { n: "2", icon: MessageSquare, title: t("step2T"), desc: t("step2D") },
                { n: "3", icon: Scale, title: t("step3T"), desc: t("step3D") },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Card variant="elevated" padding="lg" className="h-full relative overflow-hidden">
                    <span className="absolute top-4 end-5 text-5xl font-extrabold text-slate-100 select-none" aria-hidden="true">
                      {step.n}
                    </span>
                    <CardContent>
                      <span className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                        <step.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-16 md:py-24 bg-surface border-y border-border scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="section-label mb-4">{t("navFeatures")}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{t("featuresTitle")}</h2>
              <p className="text-foreground/60 text-lg">{t("featuresSub")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: Gamepad2, title: t("featGameT"), desc: t("featGameD"), href: "/game", cta: t("playGame") },
                { icon: ScanSearch, title: t("featScanT"), desc: t("featScanD"), href: "/scanner", cta: t("scanMessage") },
                { icon: ShieldCheck, title: t("featDualT"), desc: t("featDualD"), href: "/responsible-ai", cta: t("responsibleAi.title") },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Card variant="elevated" hover padding="lg" className="h-full">
                    <CardContent>
                      <span className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center mb-4 shadow-sm">
                        <f.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed mb-4">{f.desc}</p>
                      <Link href={f.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
                        {f.cta}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY IT MATTERS */}
        <section id="why" className="py-16 md:py-24 scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="section-label mb-4">{t("whyTitle")}</span>
              <p className="text-lg md:text-xl text-foreground/75 leading-relaxed mb-4">{t("whyLead")}</p>
              <p className="text-foreground/55">{t("whyAudience")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              {[
                { value: "stat1Value", label: "stat1Label" },
                { value: "stat2Value", label: "stat2Label" },
                { value: "stat3Value", label: "stat3Label" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Card variant="elevated" padding="lg" className="h-full text-center">
                    <CardContent>
                      <div className="text-3xl md:text-4xl font-extrabold text-danger mb-2">{t(stat.value)}</div>
                      <p className="text-sm text-foreground/60 leading-relaxed">{t(stat.label)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-foreground/45 max-w-3xl mx-auto text-center leading-relaxed">
              {t("whySource")}
            </p>
          </div>
        </section>

        {/* RED FLAGS */}
        <section id="red-flags" className="py-16 md:py-24 bg-slate-900 text-white scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-4">
                {t("navRedFlags")}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{t("sixRedFlags")}</h2>
              <p className="text-white/65 text-lg">{t("redFlagsDesc")}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {redFlagIds.map((id, index) => {
                const rule = RULES.find((r) => r.id === id);
                const Icon = redFlagIcons[id] ?? AlertTriangle;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 3) * 0.08, duration: 0.4 }}
                    className="rounded-2xl bg-white/[0.06] border border-white/10 p-6 hover:bg-white/[0.09] hover:border-emerald-400/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-11 h-11 rounded-xl bg-emerald-400/15 text-emerald-300 flex items-center justify-center">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      {rule && (
                        <span className="text-xs font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1">
                          +{rule.weight}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold mb-1.5">{t(`rules.${id}`)}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{rule?.name ?? ""}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{t("audienceTitle")}</h2>
              <p className="text-foreground/60 text-lg">{t("audienceSub")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: Users, title: t("aud1T"), desc: t("aud1D") },
                { icon: GraduationCap, title: t("aud2T"), desc: t("aud2D") },
                { icon: HeartHandshake, title: t("aud3T"), desc: t("aud3D") },
              ].map((a, i) => (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Card variant="outlined" padding="lg" className="h-full">
                    <CardContent>
                      <span className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                        <a.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="font-bold text-lg mb-2">{a.title}</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed">{a.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white px-6 py-12 md:p-14 text-center">
              <div className="absolute inset-0 opacity-10" aria-hidden="true">
                <div className="absolute -top-20 -start-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute -bottom-24 -end-16 w-80 h-80 rounded-full bg-black/20 blur-3xl" />
              </div>
              <div className="relative max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{t("ctaTitle")}</h2>
                <p className="text-white/80 text-lg mb-8">{t("ctaSub")}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/game"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-emerald-800 font-semibold rounded-xl px-8 py-3.5 hover:bg-emerald-50 transition-colors shadow-lg"
                  >
                    <Gamepad2 className="h-5 w-5" aria-hidden="true" />
                    {t("playGame")}
                  </Link>
                  <Link
                    href="/scanner"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto border border-white/40 text-white font-semibold rounded-xl px-8 py-3.5 hover:bg-white/10 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" aria-hidden="true" />
                    {t("scanMessage")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
