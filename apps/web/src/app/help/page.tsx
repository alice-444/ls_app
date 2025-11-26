"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { faqConfig, type FAQItem } from "@/lib/faq-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { Search, Mail } from "lucide-react";

export default function HelpCenterPage() {
  const { categories, questions } = faqConfig;
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const hasQuestions = questions.length > 0;

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return questions;
    }

    const query = searchQuery.toLowerCase().trim();
    return questions.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [questions, searchQuery]);

  const filteredCategoriesWithQuestions = useMemo(() => {
    return sortedCategories
      .map((category) => {
        const categoryQuestions = filteredQuestions.filter(
          (q) => q.categoryId === category.id
        );
        return {
          category,
          questions: categoryQuestions,
        };
      })
      .filter((item) => item.questions.length > 0);
  }, [sortedCategories, filteredQuestions]);

  const hasResults = filteredCategoriesWithQuestions.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Foire aux questions</h1>
        <p className="text-muted-foreground">
          Trouvez des réponses aux questions fréquemment posées
        </p>
      </div>

      {!hasQuestions ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucune question disponible pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher dans les questions et réponses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {hasSearchQuery && !hasResults ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Aucun résultat trouvé
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredCategoriesWithQuestions.map(({ category, questions: categoryQuestions }) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FAQAccordion items={categoryQuestions} exclusive={true} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-center">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/support-request">
                <Mail className="w-4 h-4 mr-2" />
                Contacter le support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
