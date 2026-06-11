import type { TaskFilter } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TaskFiltersProps {
  current: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  counts: { all: number; pending: number; completed: number };
}

export function TaskFilters({ current, onChange, counts }: TaskFiltersProps) {
  const { t } = useLanguage();

  const filters: { value: TaskFilter; label: string }[] = [
    { value: 'all', label: t.filters.all },
    { value: 'pending', label: t.filters.pending },
    { value: 'completed', label: t.filters.completed },
  ];

  return (
    <div className="flex gap-2">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            current === value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {label}
          <span className={`ml-1.5 text-xs ${current === value ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
            {counts[value]}
          </span>
        </button>
      ))}
    </div>
  );
}
