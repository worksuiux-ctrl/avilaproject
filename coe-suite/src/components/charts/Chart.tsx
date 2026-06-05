import { useRef, useEffect } from "react";
import type { ChartData, ChartOptions, ChartType } from "chart.js";

interface ChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  height?: number;
}

export function Chart({ type, data, options, height = 200 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let chart: any = null;

    (async () => {
      try {
        const { Chart: ChartJS, registerables } = await import("chart.js");
        ChartJS.register(...registerables);
        const ctx = el.getContext("2d");
        if (!ctx) return;
        chart?.destroy();
        chart = new ChartJS(ctx, { type, data, options });
      } catch (e) {
        console.error("Chart init error:", e);
      }
    })();

    return () => {
      chart?.destroy();
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef} style={{ width: "100%", height }} height={height} />;
}
