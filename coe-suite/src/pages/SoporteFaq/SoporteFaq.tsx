import { useState, useMemo } from "react";
import { SearchBar, Heading, Text, Card } from "@coe/design-system";
import { FAQ_CATEGORIES, searchFaqItems } from "./data/faqMocks";
import { FaqCategoryTabs } from "./components/FaqCategoryTabs";
import { FaqAccordion } from "./components/FaqAccordion";

export function SoporteFaq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCategories = useMemo(() => {
    if (searchQuery) {
      const results = searchFaqItems(searchQuery);
      if (results.length === 0) return [];
      return [
        {
          id: "search",
          label: `Resultados (${results.length})`,
          items: results,
        },
      ];
    }

    if (activeCategory === "all") {
      return FAQ_CATEGORIES;
    }

    return FAQ_CATEGORIES.filter((c) => c.id === activeCategory);
  }, [searchQuery, activeCategory]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <Heading variant="title" className="font-bold text-[22px] mb-2">
          Preguntas Frecuentes
        </Heading>
        <Text variant="body" className="text-[var(--color-neutro-500)] max-w-2xl">
          Encuentra respuestas rápidas sobre COE Suite. Usa el buscador o navega por
          categorías.
        </Text>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar en preguntas y respuestas..."
        className="w-full mb-8"
      />

      <FaqCategoryTabs
        categories={FAQ_CATEGORIES}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
        searchQuery={searchQuery}
      />

      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} variant="outlined" padding="md" className="overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <Heading variant="paragraph" className="font-bold text-[var(--color-neutro-900)]">
                {category.label}
              </Heading>
              <Text variant="caption" className="text-[var(--color-neutro-500)]">
                {category.items.length} pregunta{category.items.length !== 1 ? "s" : ""}
              </Text>
            </div>
            <FaqAccordion items={category.items} />
          </Card>
        ))}

        {searchQuery && filteredCategories.length === 0 && (
          <Card variant="flat" padding="lg" className="text-center">
            <Text variant="body" className="text-[var(--color-neutro-500)] mb-2">
              No se encontraron resultados para "<span className="font-medium text-[var(--color-neutro-900)]">{searchQuery}</span>"
            </Text>
            <Text variant="small" className="text-[var(--color-neutro-400)]">
              Intenta con otros términos o navega por las categorías.
            </Text>
          </Card>
        )}
      </div>
    </div>
  );
}