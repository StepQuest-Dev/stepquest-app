import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { styles as dashboardStyles } from '../styles/tabs/Dashboard';

interface TopStatusOverlayProps {
  steps?: number;
  onSyncPress?: () => void;
}

// --- FUNKCJA POMOCNICZA DO AWATARU UŻYTKOWNIKA ---
const getUserAvatar = (avatarUrl?: string | null) => {
  switch (avatarUrl) {
    case 'warrior-icon.png': return require('@/assets/images/framed-icons/warrior-icon-ramka.png');
    case 'mnich-icon.png': return require('@/assets/images/framed-icons/monk-icon-ramka.png');
    case 'mag-icon.png': return require('@/assets/images/framed-icons/mag-icon-ramka.png');
    case 'loczek-icon.png': return require('@/assets/images/framed-icons/loczek-icon-ramka.png');
    default: return require('@/assets/images/user-icon.png');
  }
};

export default function TopStatusOverlay({ steps: propSteps, onSyncPress }: TopStatusOverlayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');
  const [character, setCharacter] = useState<any>(null);
  const [serverSteps, setServerSteps] = useState(0);

  // --- NOWY STAN NA AVATAR URL Z BACKENDU ---
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        try {
          const [userRes, charRes, stepsRes] = await Promise.all([
            api.get('/auth/me').catch(() => null),
            api.get('/character').catch(() => null),
            api.get('/steps/latest').catch(() => null),
          ]);

          if (isActive) {
            if (userRes?.data) {
              setUsername(userRes.data.username || userRes.data.email);
              setAvatarUrl(userRes.data.avatarUrl || null); // <--- Pobieramy i zapisujemy Avatar z konta
            }
            if (charRes?.data) {
              const charData = Array.isArray(charRes.data) ? charRes.data[0] : charRes.data;
              setCharacter(charData);
            }
            if (stepsRes?.data) {
              setServerSteps(stepsRes.data.steps || stepsRes.data.count || stepsRes.data.totalSteps || 0);
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

  const displaySteps = propSteps !== undefined ? propSteps : serverSteps;

  const level = character?.level || 1;
  const currentExp = character?.exp ?? 0;
  const expToNext = level * 100;
  const expFillPercent = expToNext > 0 ? Math.min((currentExp / expToNext) * 100, 100) : 0;

  // Pobieramy obrazek UŻYTKOWNIKA
  const avatarSource = getUserAvatar(avatarUrl);

  return (
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
              LV. {character?.level || 1}
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
          onPress={onSyncPress}
          activeOpacity={onSyncPress ? 0.7 : 1}
          disabled={!onSyncPress}
        >
          <View style={dashboardStyles.coinsRow}>
            <Image source={require('@/assets/images/coins.png')} style={{ width: 25, height: 25, marginRight: 5 }} resizeMode="contain" />
            <Text style={[dashboardStyles.coinsValue, { fontFamily: 'determination' }]}>
              {displaySteps.toLocaleString()}
            </Text>
          </View>
          <Text style={[dashboardStyles.coinsLabel, { fontFamily: 'determination' }]}>STEP COINS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}