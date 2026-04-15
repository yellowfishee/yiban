import { type ReactNode } from 'react';
import { useLaunch } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './app.scss';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { CollectionProvider } from './context/CollectionContext';
import { InspirationProvider } from './context/InspirationContext';

interface AppProps {
  children?: ReactNode;
}

function AppContent({ children }: { children?: ReactNode }) {
  const { theme } = useSettings();
  
  return (
    <View className="app" data-theme={theme === 'xuanqing' ? undefined : theme}>
      {children}
    </View>
  );
}

function App({ children }: AppProps) {
  useLaunch(() => {
    // App launched
  });

  return (
    <AuthProvider>
      <SettingsProvider>
        <CollectionProvider>
          <InspirationProvider>
            <AppContent>{children}</AppContent>
          </InspirationProvider>
        </CollectionProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
