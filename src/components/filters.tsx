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

  return (
    <div className="border-b border-slate-100 py-5 first:pt-0 last:border-b-0">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between font-display text-base font-semibold text-ink"
      >
        {title}
        <ChevronDown
          className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
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
      <AccordionGroup title="Por Problema" defaultOpen>
        <ul className="space-y-3">
          {categoryOptions.map((item) => (
            <li key={item.name}>
              <label className="group flex cursor-pointer items-center justify-between">
                <span className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(item.name)}
                    onChange={() => toggleValue('categoria', item.name, selectedCategories)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 transition-colors group-hover:text-primary-700">
                    {item.name}
                  </span>
                </span>
                <span className="text-xs text-slate-400">{item.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </AccordionGroup>

      <AccordionGroup title="Por Marca">
        <ul className="space-y-3">
          {brandOptions.map((item) => (
            <li key={item.name}>
              <label className="group flex cursor-pointer items-center justify-between">
                <span className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(item.name)}
                    onChange={() => toggleValue('marca', item.name, selectedBrands)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 transition-colors group-hover:text-primary-700">
                    {item.name}
                  </span>
                </span>
                <span className="text-xs text-slate-400">{item.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </AccordionGroup>

      {hasFilters && (
        <button
          onClick={handleClearFilters}
          className="mt-6 w-full rounded-md border border-ink/20 py-2.5 font-accent text-sm font-semibold text-ink transition-colors hover:border-ink"
        >
          Limpiar Filtros
        </button>
      )}
    </div>
  );
}
