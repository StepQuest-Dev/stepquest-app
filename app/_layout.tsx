import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Tutaj rejestrujemy Twój nowy folder z logowaniem i rejestracją */}
      <Stack.Screen name="(auth)" /> 
      {/* Tutaj rejestrujemy folder z Dashboardem i Profilem */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}