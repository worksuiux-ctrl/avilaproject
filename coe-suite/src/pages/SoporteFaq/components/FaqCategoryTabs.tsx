import { Tabs, Chip } from "@coe/design-system";
import type { FaqCategory } from "../data/faqTypes";

interface FaqCategoryTabsProps {
  categories: FaqCategory[];
  activeCategory: string;
  onChange: (categoryId: string) => void;
  searchQuery: string;
}

export function FaqCategoryTabs({
  categories,
  activeCategory,
  onChange,
  searchQuery,
}: FaqCategoryTabsProps) {
  const tabs = [
    { id: "all", label: "Todas" },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <div className="mb-6">
      <Tabs
        activeTab={activeCategory}
        onChange={onChange}
        variant="pills"
        className="w-full flex flex-wrap gap-2"
        tabs={tabs}
      />
      {searchQuery && (
        <div className="mt-3 flex items-center gap-2">
          <Chip variant="default" size="sm" className="cursor-default">
            Filtro: "{searchQuery}"
          </Chip>
          <span className="text-[12px] text-[var(--color-neutro-500)]">
            Mostrando resultados en todas las categorías
          </span>
        </div>
      )}
    </div>
  );
}