import { useCoengineStore } from "./CoengineStore";
import { CoengineBubble } from "./CoengineBubble";
import { CoenginePanel } from "./CoenginePanel";

export function CoengineWidget() {
  const { isOpen, isHidden } = useCoengineStore();

  if (isHidden) return null;

  return (
    <>
      {isOpen && <CoenginePanel />}
      <CoengineBubble />
    </>
  );
}
