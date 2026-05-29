import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons'; // Zestaw darmowych, popularnych ikon

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Ukrywamy domyślny górny pasek z nazwą pliku (mamy własne, ładniejsze nagłówki na ekranach)
        headerShown: false,
        // Kolor aktywnej ikonki (nasz motyw przewodni - niebieski)
        tabBarActiveTintColor: '#2980b9',
        // Kolor nieaktywnej ikonki
        tabBarInactiveTintColor: '#95a5a6',
        // Stylowanie samego paska na dole
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#ecf0f1',
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        }
      }}
    >
      {/* 1. Przycisk: Dashboard */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Pulpit',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. Przycisk: Profil Gracza */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-alt" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}