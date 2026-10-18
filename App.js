

import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { TeamProvider } from './src/context/TeamContext';

export default function App() {
  return (
    <TeamProvider>
      <AppNavigator />
    </TeamProvider>
  );
}