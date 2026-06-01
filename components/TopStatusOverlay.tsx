import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { useStepSync } from '../hooks/useStepSync';
import CustomAlert from './CustomAlerts';
import { styles as dashboardStyles } from '../styles/tabs/Dashboard';

interface TopStatusOverlayProps {
  // Zachowujemy props dla kompatybilności wstecznej, ale priorytet ma hook
  steps?: number;
  onSyncPress?: () => void;
}

const getUserAvatar = (avatarUrl?: string | null) => {
  switch (avatarUrl) {
    case 'warrior-icon.png': return require('@/assets/images/framed-icons/warrior-icon-ramka.png');
    case 'mnich-icon.png': return require('@/assets/images/framed-icons/monk-icon-ramka.png');
    case 'mag-icon.png': return require('@/assets/images/framed-icons/mag-icon-ramka.png');
    case 'loczek-icon.png': return require('@/assets/images/framed-icons/loczek-icon-ramka.png');
    default: return require('@/assets/images/user-icon.png');
  }
};

export default function TopStatusOverlay({ steps: propSteps, onSyncPress: propOnSyncPress }: TopStatusOverlayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');
  const [character, setCharacter] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Hook do synchronizacji kroków
  const { steps: hookSteps, isSyncing, fullSync } = useStepSync();

  // Stan dla alertu synchronizacji
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    isSuccess: false,
    showCancel: true,
    onConfirm: undefined as (() => void) | undefined
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        try {
          const [userRes, charRes] = await Promise.all([
            api.get('/auth/me').catch(() => null),
            api.get('/character').catch(() => null),
          ]);

          if (isActive) {
            if (userRes?.data) {
              setUsername(userRes.data.username || userRes.data.email);
              setAvatarUrl(userRes.data.avatarUrl || null);
            }
            if (charRes?.data) {
              const charData = Array.isArray(charRes.data) ? charRes.data[0] : charRes.data;
              setCharacter(charData);
            }
          }
        } catch (e) {
          console.error('[TopStatusOverlay] Fetch error:', e);
        }
      };

      fetchData();
      return () => { isActive = false; };
    }, [])
  );

  const handleSyncPress = async () => {
    setAlertConfig({
      title: '🛡️ SYNCHRONIZACJA',
      message: 'Czy chcesz pobrać aktualną liczbę kroków z urządzenia i wysłać ją do chmury?',
      isSuccess: false,
      showCancel: true,
      onConfirm: async () => {
        setAlertVisible(false);
        try {
          await fullSync();
          setAlertConfig({
            title: '✅ SUKCES',
            message: 'Kroki zostały pomyślnie zsynchronizowane!',
            isSuccess: true,
            showCancel: false,
            onConfirm: () => setAlertVisible(false)
          });
          setAlertVisible(true);
        } catch (err) {
          setAlertConfig({
            title: '❌ BŁĄD',
            message: 'Nie udało się zsynchronizować kroków. Spróbuj ponownie później.',
            isSuccess: false,
            showCancel: false,
            onConfirm: () => setAlertVisible(false)
          });
          setAlertVisible(true);
        }
      }
    });
    setAlertVisible(true);
  };

  // Priorytet wyświetlania: propSteps (jeśli podane), w przeciwnym razie hookSteps
  const displaySteps = propSteps !== undefined ? propSteps : hookSteps;
  
  // Jeśli rodzic przekazał własną funkcję sync, używamy jej, w przeciwnym razie naszej
  const onSync = propOnSyncPress || handleSyncPress;

  const level = character?.level || 1;
  const currentExp = character?.exp ?? 0;
  const expToNext = level * 100;
  const expFillPercent = expToNext > 0 ? Math.min((currentExp / expToNext) * 100, 100) : 0;

  const avatarSource = getUserAvatar(avatarUrl);

  return (
    <>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        isSuccess={alertConfig.isSuccess}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertVisible(false)}
      />

      <View style={dashboardStyles.topOverlay} pointerEvents="box-none">
        <View style={dashboardStyles.profileHeader}>
          <TouchableOpacity
            style={dashboardStyles.avatarPlaceholder}
            onPress={() => router.push({ pathname: '/(tabs)/profile', params: { from: pathname } })}
            activeOpacity={0.7}
          >
            <Image source={avatarSource} style={dashboardStyles.avatarImage} resizeMode="cover" />
          </TouchableOpacity>

          <View style={dashboardStyles.profileInfo}>
            <Text style={[dashboardStyles.usernameText, { fontFamily: 'determination' }]} numberOfLines={1}>
              {username.toUpperCase()}
            </Text>
            <View style={dashboardStyles.levelRow}>
              <Text style={[dashboardStyles.levelText, { fontFamily: 'determination' }]}>
                LV. {level}
              </Text>
              <Text style={[dashboardStyles.expLabel, { fontFamily: 'determination' }]}>EXP</Text>
              <View style={[dashboardStyles.expBarBg, { width: 90, height: 15 }]}>
                <View
                  style={[
                    dashboardStyles.expBarFill,
                    { width: `${expFillPercent}%` },
                  ]}
                />
                <Text
                  style={[dashboardStyles.expBarText, { fontFamily: 'determination'}]}
                  numberOfLines={1}
                >
                  {currentExp}/{expToNext}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={dashboardStyles.stepCoinsContainer}
            onPress={onSync}
            activeOpacity={0.7}
            disabled={isSyncing}
          >
            <View style={dashboardStyles.coinsRow}>
              {isSyncing ? (
                <ActivityIndicator color="#ebd59b" size="small" style={{ marginRight: 5 }} />
              ) : (
                <Image source={require('@/assets/images/coins.png')} style={{ width: 25, height: 25, marginRight: 5 }} resizeMode="contain" />
              )}
              <Text style={[dashboardStyles.coinsValue, { fontFamily: 'determination' }]}>
                {displaySteps.toLocaleString()}
              </Text>
            </View>
            <Text style={[dashboardStyles.coinsLabel, { fontFamily: 'determination' }]}>
              {isSyncing ? 'SYNC...' : 'STEP COINS'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
