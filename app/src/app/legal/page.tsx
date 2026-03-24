"use client";

import { motion } from "framer-motion";
import { BackButton } from "@/components/shared/BackButton";
import { PageContainer } from "@/components/shared/layout";
import ShinyText from "@/components/ui/ShinyText";

export default function LegalPage() {
  return (
    <PageContainer>
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <BackButton href="/info" label="Retour aux informations" />
      </motion.div>

      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Mentions légales" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2 max-w-3xl">
          Informations légales concernant la plateforme LearnSup
        </p>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-xl p-6 sm:p-10 space-y-8 text-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-ls-heading border-b-2 border-brand pb-2 inline-block">
            1. Éditeur du site
          </h2>
          <p className="leading-relaxed text-ls-text">
            Le site LearnSup est édité par la société LearnSup SAS, au capital
            de 1 000 euros, immatriculée au Registre du Commerce et des
            Sociétés de Paris sous le numéro 123 456 789.
          </p>
          <p className="leading-relaxed text-ls-text">
            <strong className="text-ls-heading">Siège social :</strong> 123
            Avenue des Étudiants, 75000 Paris, France.
          </p>
          <p className="leading-relaxed text-ls-text">
            <strong className="text-ls-heading">Directeur de la publication :</strong>{" "}
            Jean Dupont, en sa qualité de Président.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-ls-heading border-b-2 border-brand pb-2 inline-block">
            2. Hébergement
          </h2>
          <p className="leading-relaxed text-ls-text">
            Le site est hébergé par la société Vercel Inc., située au 340 S
            Lemon Ave #4133 Walnut, CA 91789, USA.
          </p>
          <p className="leading-relaxed text-ls-text">
            La base de données est hébergée par Neon, située au 1450 Fashion
            Island Blvd, San Mateo, CA 94404, USA.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-ls-heading border-b-2 border-brand pb-2 inline-block">
            3. Contact
          </h2>
          <p className="leading-relaxed text-ls-text">
            Pour toute question concernant le site, vous pouvez nous contacter :
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4 text-ls-text marker:text-brand">
            <li>Par e-mail : support@learnsup.fr</li>
            <li>Via notre centre d&apos;aide en ligne</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-ls-heading border-b-2 border-brand pb-2 inline-block">
            4. Crédits
          </h2>
          <p className="leading-relaxed text-ls-text">
            Design et développement par l&apos;équipe LearnSup.
          </p>
        </section>
      </motion.div>
    </PageContainer>
  );
}
