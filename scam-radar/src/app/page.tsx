"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, AlertTriangle, Lock, Link2, Gift, DollarSign, UserCheck, MessageSquare, Target, Eye, Zap, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { RULES } from "@/lib/rules";

const redFlags = [
  { id: "urgency", icon: Zap, titleKey: "rules.urgency" },
  { id: "credential_request", icon: Lock, titleKey: "rules.credential_request" },
  { id: "suspicious_link", icon: Link2, titleKey: "rules.suspicious_link" },
  { id: "prize_claim", icon: Gift, titleKey: "rules.prize_claim" },
  { id: "upfront_fee", icon: DollarSign, titleKey: "rules.upfront_fee" },
  { id: "threat", icon: AlertTriangle, titleKey: "rules.threat" },
];

export default function Home() {
  const { t, isRTL } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" aria-hidden="true" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 mb-6"
              >
                <Shield className="h-5 w-5" aria-hidden="true" />
                <span className="font-semibold">{t("tagline")}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                {t("appName")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10"
              >
                {t("heroSubtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/game">
                  <Button size="lg" rightIcon={<Target className="h-5 w-5" aria-hidden="true" />} className="w-full sm:w-auto">
                    {t("playGame")}
                  </Button>
                </Link>
                <Link href="/scanner">
                  <Button variant="secondary" size="lg" leftIcon={<MessageSquare className="h-5 w-5" aria-hidden="true" />} className="w-full sm:w-auto">
                    {t("scanMessage")}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whyTitle")}</h2>
              <p className="text-foreground/75 text-lg leading-relaxed mb-4">{t("whyLead")}</p>
              <p className="text-foreground/60">{t("whyAudience")}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              {[
                { value: "stat1Value", label: "stat1Label" },
                { value: "stat2Value", label: "stat2Label" },
                { value: "stat3Value", label: "stat3Label" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Card variant="outlined" padding="lg" className="h-full text-center">
                    <CardContent>
                      <div className="text-3xl md:text-4xl font-bold text-danger mb-2">
                        {t(stat.value)}
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed">{t(stat.label)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-foreground/40 max-w-3xl mx-auto text-center leading-relaxed">
              {t("whySource")}
            </p>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-surface/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("sixRedFlags")}</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">{t("redFlagsDesc")}</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {redFlags.map((flag, index) => {
                const rule = RULES.find(r => r.id === flag.id);
                return (
                  <motion.article
                    key={flag.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="group"
                  >
                    <Card variant="outlined" hover padding="lg" className="h-full">
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-background transition-colors duration-200">
                            <flag.icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-2">{t(flag.titleKey)}</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                              {rule ? `Weight: ${rule.weight} points` : ""}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to protect yourself?</h2>
              <p className="text-foreground/70 mb-8">Start learning today. No registration required. Your privacy is guaranteed.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/game">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("playGame")}
                  </Button>
                </Link>
                <Link href="/scanner">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    {t("scanMessage")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}