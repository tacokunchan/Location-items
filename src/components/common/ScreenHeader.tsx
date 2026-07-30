import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from './Icon';

type ScreenHeaderProps = {
  title: string;
  back?: boolean;
  action?: React.ReactNode;
};

export function ScreenHeader({ title, back, action }: ScreenHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="mb-4 flex min-h-11 items-center gap-2">
      {back && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="戻る"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full -ml-2"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}
      <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
      {action}
    </div>
  );
}
