import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './hooks/AppDataContext';
import { HomePage } from './pages/HomePage';
import { ItemNewPage } from './pages/ItemNewPage';
import { ItemEditPage } from './pages/ItemEditPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { WantedPage } from './pages/WantedPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <div className="mx-auto min-h-svh max-w-lg bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/items/new" element={<ItemNewPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route path="/items/:id/edit" element={<ItemEditPage />} />
            <Route path="/wanted" element={<WantedPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppDataProvider>
  );
}

export default App;
