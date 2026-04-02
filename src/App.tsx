import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InspirationProvider } from './context/InspirationContext';
import { CollectionProvider } from './context/CollectionContext';
import { SettingsProvider } from './context/SettingsContext';
import PageLayout from './components/layout/PageLayout';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import StudyPage from './pages/StudyPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <SettingsProvider>
      <CollectionProvider>
        <InspirationProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PageLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/study" element={<StudyPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </InspirationProvider>
      </CollectionProvider>
    </SettingsProvider>
  );
}

export default App;
