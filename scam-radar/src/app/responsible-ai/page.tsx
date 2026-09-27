"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Send, Database, AlertTriangle, Scale, LifeBuoy, WifiOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/Card";

const SECTIONS = [
  { key: "sendTitle", bodyKey: "sendBody", icon: Send },
  { key: "storeTitle", bodyKey: "storeBody", icon: Database },
  { key: "limitsTitle", bodyKey: "limitsBody", icon: AlertTriangle },
  { key: "rulesTitle", bodyKey: "rulesBody", icon: Scale },
  { key: "offlineTitle", bodyKey: "offlineBody", icon: WifiOff },
  { key: "helpTitle", bodyKey: "helpBody", icon: LifeBuoy },
] as const;

export default function ResponsibleAiPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold">{t("responsibleAi.title")}</h1>
            </div>
            <p className="text-foreground/70 leading-relaxed">{t("responsibleAi.intro")}</p>
          </motion.div>

          {SECTIONS.map((section, index) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
            >
              <Card variant="outlined" padding="lg">
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-border text-accent flex items-center justify-center shrink-0">
                      <section.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-foreground mb-2">
                        {t(`responsibleAi.${section.key}`)}
                      </h2>
                      <p className="text-foreground/75 leading-relaxed">
                        {t(`responsibleAi.${section.bodyKey}`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Link href="/scanner" className="inline-flex">
            <span className="inline-flex items-center gap-2 text-accent hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("scanMessage")}
            </span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
