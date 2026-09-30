'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

interface FiltersProps {
  selectedCategories?: string[];
  selectedBrands?: string[];
  categoryOptions: { name: string; count: number }[];
  brandOptions: { name: string; count: number }[];
}

function AccordionGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = `filtro-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="border-b border-sw-border py-4 first:pt-0 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={id}
        className="flex min-h-[2.75rem] w-full items-center justify-between font-display text-lg font-semibold text-sw-ink"
      >
        {title}
        <ChevronDown
          aria-hidden
          className={cn('h-4 w-4 text-sw-muted transition-transform duration-sw', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div id={id} className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function Filters({
  selectedCategories = [],
  selectedBrands = [],
  categoryOptions,
  brandOptions,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleValue = (key: 'categoria' | 'marca', value: string, current: string[]) => {
    const params = new URLSearchParams(searchParams);

    const updated = current.includes(value)
      ? current.filter((c) => c !== value)
      : [...current, value];

    if (updated.length > 0) {
      params.set(key, updated.join(','));
    } else {
      params.delete(key);
    }

    router.push(`/tienda?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/tienda');
  };

  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0;

  return (
    <div>
      <AccordionGroup title="Por necesidad" defaultOpen>
        <ul className="space-y-1">
          {categoryOptions.map((item) => (
            <li key={item.name}>
              <label className="group flex min-h-[2.5rem] cursor-pointer items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(item.name)}
                    onChange={() => toggleValue('categoria', item.name, selectedCategories)}
                    className="!h-[1.125rem] !w-[1.125rem] shrink-0 cursor-pointer !rounded-sw-sm !border-sw-ink/40 !p-0 accent-[rgb(var(--sw-pink-deep))]"
                  />
                  <span className="text-sw-small text-sw-text transition-colors group-hover:text-sw-pink-deep">
                    {item.name}
                  </span>
                </span>
                <span className="text-sw-xs tabular-nums text-sw-muted">{item.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </AccordionGroup>

      <AccordionGroup title="Por laboratorio" defaultOpen={selectedBrands.length > 0}>
        <ul className="space-y-1">
          {brandOptions.map((item) => (
            <li key={item.name}>
              <label className="group flex min-h-[2.5rem] cursor-pointer items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(item.name)}
                    onChange={() => toggleValue('marca', item.name, selectedBrands)}
                    className="!h-[1.125rem] !w-[1.125rem] shrink-0 cursor-pointer !rounded-sw-sm !border-sw-ink/40 !p-0 accent-[rgb(var(--sw-pink-deep))]"
                  />
                  <span className="text-sw-small text-sw-text transition-colors group-hover:text-sw-pink-deep">
                    {item.name}
                  </span>
                </span>
                <span className="text-sw-xs tabular-nums text-sw-muted">{item.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </AccordionGroup>

      {hasFilters && (
        <button type="button" onClick={handleClearFilters} className="sw-btn sw-btn-secondary mt-6 h-11 w-full">
          Quitar filtros
        </button>
      )}
    </div>
  );
}
