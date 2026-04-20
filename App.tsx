import "./global.css";
import React from 'react';
import AppEntry from './src/App';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppEntry />
    </SafeAreaProvider>
  );
}
