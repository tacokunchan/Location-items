import { Link } from 'react-router-dom';
import { PlusIcon } from '../common/Icon';

export function Fab() {
  return (
    <Link
      to="/items/new"
      aria-label="モノを登録"
      className="fixed bottom-6 right-5 flex h-14 items-center gap-2 rounded-full bg-indigo-600 px-5 text-base font-semibold text-white shadow-lg"
    >
      <PlusIcon className="h-5 w-5" />
      登録
    </Link>
  );
}
