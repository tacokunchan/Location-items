import { useParams } from 'react-router-dom';
import { useAppData } from '../hooks/AppDataContext';
import { ItemForm } from '../components/item/ItemForm';
import { ScreenHeader } from '../components/common/ScreenHeader';

export function ItemEditPage() {
  const { id } = useParams<{ id: string }>();
  const { items, loading } = useAppData();
  const item = items.find((i) => i.id === id);

  if (loading) return null;
  if (!item) return <NotFound />;

  return (
    <div className="p-4">
      <ScreenHeader title="モノを編集" back />
      <ItemForm existingItem={item} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="p-4">
      <ScreenHeader title="見つかりません" back />
      <p className="text-neutral-500">このアイテムは削除された可能性があります。</p>
    </div>
  );
}
