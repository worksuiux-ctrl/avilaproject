import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsMsg?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  noOptionsMsg = "Sin resultados",
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    setHighlightIdx(0);
  }, [open]);

  function handleSelect(opt: Option) {
    onChange(opt.value);
    setOpen(false);
    setSearch("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[highlightIdx]) {
      e.preventDefault();
      handleSelect(filtered[highlightIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] bg-white text-[13px] text-left transition-colors hover:border-[var(--color-neutro-300)] cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className={`flex-1 truncate ${selected ? "text-[var(--color-neutro-900)]" : "text-[var(--color-neutro-400)]"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--color-neutro-400)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg z-20">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-[13px] pl-8 pr-3 py-2 border-b border-[var(--color-neutro-100)] outline-none bg-transparent"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt, idx) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left transition-colors cursor-pointer ${
                    idx === highlightIdx
                      ? "bg-[var(--color-verde-100)] text-white"
                      : opt.value === value
                      ? "bg-[var(--color-neutro-50)] text-[var(--color-neutro-900)]"
                      : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-50)]"
                  }`}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-[13px] text-[var(--color-neutro-400)] text-center">
                {noOptionsMsg}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
