"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, Phone, X } from "lucide-react";
import { ClientListItem } from "@/types";

async function fetchClients(): Promise<ClientListItem[]> {
  const res = await fetch("/api/clients");
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export function GlobalClientSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: clients = [], isFetching } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    enabled: open || query.trim().length > 0,
    staleTime: 60_000,
  });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return clients
      .filter(
        (client) =>
          client.name.toLowerCase().includes(q) ||
          client.phone.replace(/\s|-/g, "").includes(q.replace(/\s|-/g, "")) ||
          (client.email?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, 8);
  }, [clients, query]);

  const showDropdown = open && query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToClient = (clientId: number) => {
    setQuery("");
    setOpen(false);
    router.push(`/clients/${clientId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[activeIndex];
      if (selected) goToClient(selected.id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search clients..."
        className="w-full pl-10 pr-9 py-2 bg-slate-50 border-none rounded-lg outline-none focus:ring-2 focus:ring-slate-200 transition-all text-sm"
        aria-label="Search clients"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        autoComplete="off"
      />

      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[60] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {isFetching && results.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No clients match “{query.trim()}”
            </div>
          ) : (
            <ul role="listbox" className="max-h-80 overflow-y-auto py-1">
              {results.map((client, index) => (
                <li key={client.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToClient(client.id)}
                    className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors ${
                      index === activeIndex ? "bg-slate-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                      {client.name
                        .split(/\s+/)
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {client.name}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
