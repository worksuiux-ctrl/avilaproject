import { Accordion, Text } from "@coe/design-system";
import { FaqMedia } from "./FaqMedia";
import type { FaqItem } from "../data/faqTypes";

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <Text variant="body" className="text-[var(--color-neutro-500)]">
          No se encontraron preguntas que coincidan con tu búsqueda.
        </Text>
      </div>
    );
  }

  return (
    <Accordion
      allowMultiple
      className="space-y-2"
      items={items.map((item) => ({
        key: item.id,
        title: item.pregunta,
        content: (
          <div className="pt-2 pb-4 space-y-3">
            <Text variant="body" className="text-[var(--color-neutro-700)] leading-relaxed">
              {item.respuesta}
            </Text>
            <FaqMedia
              tipo={item.media?.tipo ?? null}
              src={item.media?.src}
              alt={item.media?.alt}
              poster={item.media?.poster}
            />
          </div>
        ),
      }))}
    />
  );
}