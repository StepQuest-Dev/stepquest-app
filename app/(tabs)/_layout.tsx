import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { tabsScreenOptions } from '../../styles/tabs/Layout'; // Import wyodrębnionego obiektu ze stylami

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={tabsScreenOptions}
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