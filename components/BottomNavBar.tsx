import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
// Importujemy Twoje style z Dashboardu (zakładam, że tam wciąż są definicje navbara)
import { styles } from '../styles/tabs/Dashboard'; 

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname(); // Pobiera aktualną ścieżkę (np. "/dashboard" lub "/dungeon")

  return (
    <View style={styles.bottomNavContainer}>
      
      {/* --- MAPA --- */}
      <TouchableOpacity 
        style={[styles.navTab, pathname === '/dashboard' && styles.activeNavTab]} 
        onPress={() => router.push('/(tabs)/dashboard')}
      >
        <Image source={require('@/assets/images/mapa.png')} style={styles.navImage} resizeMode="contain" />
        <Text style={[styles.navText, pathname === '/dashboard' && styles.activeNavText]}>MAPA</Text>
        {pathname === '/dashboard' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      <View style={styles.navDivider} />

      {/* --- LOCHY --- */}
      <TouchableOpacity 
        style={[styles.navTab, pathname === '/dungeon' && styles.activeNavTab]} 
        onPress={() => router.push('/(tabs)/dungeon')}
      >
        <Image source={require('@/assets/images/dungeon_icon.png')} style={styles.navImage} resizeMode="contain" />
        <Text style={[styles.navText, pathname === '/dungeon' && styles.activeNavText]}>LOCHY</Text>
        {pathname === '/dungeon' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>

      <View style={styles.navDivider} />

      {/* --- SKLEP --- */}
      <TouchableOpacity style={styles.navTab} onPress={() => alert('Sklep wkrótce!')}>
        <Image source={require('@/assets/images/money.png')} style={styles.navImage} resizeMode="contain" />
        <Text style={styles.navText}>SKLEP</Text>
      </TouchableOpacity>

      <View style={styles.navDivider} />

      {/* --- OSADA --- */}
      <TouchableOpacity style={styles.navTab} onPress={() => alert('Osada wkrótce!')}>
        <Image source={require('@/assets/images/osada.png')} style={styles.navImage} resizeMode="contain" />
        <Text style={styles.navText}>OSADA</Text>
      </TouchableOpacity>

    </View>
  );
}