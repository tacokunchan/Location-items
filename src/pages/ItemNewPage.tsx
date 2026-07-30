import { ItemForm } from '../components/item/ItemForm';
import { ScreenHeader } from '../components/common/ScreenHeader';

export function ItemNewPage() {
  return (
    <div className="p-4">
      <ScreenHeader title="モノを登録" back />
      <ItemForm />
    </div>
  );
}
