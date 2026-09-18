import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootLayout from './app/_layout';

export default function App() {
  return (
    <>
      <RootLayout />
      <StatusBar style="auto" />
    </>
  );
}
