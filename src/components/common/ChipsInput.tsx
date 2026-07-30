import { useState } from 'react';
import { CloseIcon } from './Icon';

type ChipsInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

// Enter or comma commits a chip; this is shared by aliases and tags, both of
// which are open-ended, user-defined vocabularies (spec 6-4).
export function ChipsInput({ values, onChange, placeholder }: ChipsInputProps) {
  const [draft, setDraft] = useState('');

  function commit() {
    const value = draft.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-300 px-2 py-2 dark:border-neutral-700">
      {values.map((value) => (
        <span
          key={value}
          className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800"
        >
          {value}
          <button
            type="button"
            aria-label={`${value} を削除`}
            onClick={() => onChange(values.filter((v) => v !== value))}
            className="text-neutral-500"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={placeholder}
        className="min-h-9 min-w-24 flex-1 bg-transparent px-1 text-base outline-none"
      />
    </div>
  );
}
