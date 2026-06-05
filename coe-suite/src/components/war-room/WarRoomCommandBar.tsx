import { useState, useEffect } from "react";
import { Button, Text, Tabs } from "@worksuiux-ctrl/my-design-system";
import type { WrTab } from "@data/warRoomData";

interface WarRoomCommandBarProps {
  activeTab: WrTab;
  onTabChange: (tab: WrTab) => void;
}

export function WarRoomCommandBar({ activeTab, onTabChange }: WarRoomCommandBarProps) {
  const [clock, setClock] = useState("--:--:--");
  const lastUpdate = "10:48:32";

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("es-ES", { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-[var(--color-neutro-200)] rounded-t-lg">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-[13px] font-mono font-semibold text-[var(--color-neutro-800)]">{clock}</span>
        <Text variant="caption">En vivo · Tesorería Central</Text>
      </div>

      <Tabs
        tabs={[
          { id: "divisas", label: "Divisas" },
          { id: "bolivares", label: "Bolívares" },
        ]}
        activeTab={activeTab}
        onChange={(id) => onTabChange(id as WrTab)}
        variant="pills"
      />

      <div className="flex items-center gap-2">
        <Text variant="caption">Act: {lastUpdate}</Text>
        <Button variant="outline" size="sm">
          ↻ Actualizar
        </Button>
      </div>
    </div>
  );
}
