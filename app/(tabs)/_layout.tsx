import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
    initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ebd59b', // Zmienione z niebieskiego na złoty, pasujący do stylistyki RPG
        tabBarInactiveTintColor: '#8a94a6',
        tabBarStyle: {
          backgroundColor: '#1d2631', // Dopasowane do ciemnego motywu gry
          borderTopWidth: 2,
          borderTopColor: '#a38450',
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        }
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'MAPA',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="compass" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFIL',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-alt" size={20} color={color} />
          ),
        }}
      />

      {/* TAJNY PANEL: Ukryty przed zwykłymi użytkownikami na dolnym pasku */}
      <Tabs.Screen
        name="developerPanel"
        options={{
          href: null, // <-- KLUCZOWE: Sprawia, że zakładka nie pojawia się w menu na dole!
        }}
      />
    </Tabs>
  );
}