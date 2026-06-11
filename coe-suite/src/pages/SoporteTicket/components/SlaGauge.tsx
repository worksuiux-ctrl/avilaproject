import { Text } from "@coe/design-system";

const ZONES = [
  { min: 0, max: 50, label: "Alerta", color: "#dc2626" },
  { min: 50, max: 80, label: "Rango óptimo", color: "#42aa42" },
  { min: 80, max: 100, label: "Optimizado", color: "#2563eb" },
];

function getZone(value: number) {
  return ZONES.find((z) => value >= z.min && value < z.max) || ZONES[ZONES.length - 1];
}

export function SlaGauge({ value }: { value: number }) {
  const zone = getZone(value);
  return (
    <div className="space-y-2">
      <div className="relative h-3 w-full rounded-full overflow-hidden flex">
        {ZONES.map((z) => {
          const pct = z.max - z.min;
          return (
            <div
              key={z.label}
              className="h-full relative"
              style={{ width: `${pct}%`, backgroundColor: z.color, opacity: z === zone ? 1 : 0.2 }}
            />
          );
        })}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md bg-[#42aa42] transition-all"
          style={{ left: `calc(${value}% - 7px)` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px]">
        {ZONES.map((z) => (
          <span key={z.label} className="font-medium" style={{ color: z.color, opacity: z === zone ? 1 : 0.4 }}>
            {z.label}
          </span>
        ))}
      </div>
      <div className="text-center">
        <Text variant="small" className="font-bold" style={{ color: zone.color }}>
          {value}% — {zone.label}
        </Text>
      </div>
    </div>
  );
}
