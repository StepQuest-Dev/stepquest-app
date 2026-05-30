import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';

// Import Twoich stylów nawigacji
import { layoutStyles as styles } from '../../styles/tabs/Layout';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const currentRoute = state.routes[state.index];
  const { options } = descriptors[currentRoute.key];

  // 1. SZTYWNE UKRYCIE: Pasek całkowicie znika na Profilu i Panelu Deva
  if (currentRoute.name === 'profile' || currentRoute.name === 'developerPanel') {
    return null;
  }

  // 2. DYNAMICZNE UKRYCIE: Nasłuchuje komend z dashboard.tsx (kliknięcie w mapę)
  if (options.tabBarStyle?.display === 'none') {
    return null;
  }

  // return (
   
  //  <View style={styles.bottomNavContainer}>
  //     {/* ZAKŁADKA: MAPA */}
  //     <TouchableOpacity 
  //       style={[styles.navTab, currentRoute.name === 'dashboard' ? styles.activeNavTab : null]} 
  //       onPress={() => navigation.navigate('dashboard')}
  //     >
  //       <Text style={styles.navIcon}>🧭</Text>
  //       <Text style={[styles.navText, currentRoute.name === 'dashboard' ? styles.activeNavText : null]}>MAPA</Text>
  //       {currentRoute.name === 'dashboard' && <View style={styles.activeIndicator} />}
  //     </TouchableOpacity>

  //     <View style={styles.navDivider} />

  //     {/* ZAKŁADKA: SKLEP */}
  //     <TouchableOpacity style={styles.navTab} onPress={() => alert('Sklep wkrótce!')}>
  //       <Text style={styles.navIcon}>💰</Text>
  //       <Text style={styles.navText}>SKLEP</Text>
  //     </TouchableOpacity>

  //     <View style={styles.navDivider} />

  //     {/* ZAKŁADKA: OSADA */}
  //     <TouchableOpacity style={styles.navTab} onPress={() => alert('Osada wkrótce!')}>
  //       <Text style={styles.navIcon}>🏡</Text>
  //       <Text style={styles.navText}>OSADA</Text>
  //     </TouchableOpacity>
  //   </View>
  // );
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="developerPanel" options={{ href: null }} />
    </Tabs>
  );
}