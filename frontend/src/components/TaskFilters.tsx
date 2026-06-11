import type { TaskFilter } from '../types';

interface TaskFiltersProps {
  current: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  counts: { all: number; pending: number; completed: number };
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'completed', label: 'Concluídas' },
];

export function TaskFilters({ current, onChange, counts }: TaskFiltersProps) {
  return (
    <div className="flex gap-2">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            current === value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {label}
          <span className={`ml-1.5 text-xs ${current === value ? 'text-blue-200' : 'text-gray-400'}`}>
            {counts[value]}
          </span>
        </button>
      ))}
    </div>
  );
}
