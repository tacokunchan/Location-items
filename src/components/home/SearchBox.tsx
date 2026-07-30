import { useEffect, useRef } from 'react';
import { SearchIcon, CloseIcon } from '../common/Icon';

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

// Autofocuses on mount: opening the app mid-search (the most common use
// case per 6-1) should drop the user straight into typing.
export function SearchBox({ value, onChange }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="なにを探していますか？"
        className="min-h-14 w-full rounded-2xl border border-neutral-300 bg-white pl-12 pr-12 text-lg shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="検索をクリア"
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-neutral-400"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
