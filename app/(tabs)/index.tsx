import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import StepCounter from '@/components/StepCounter';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Krokomierz</Text>
      <Text style={styles.subtitle}>
        Pobieranie kroków z telefonu Android / iOS przez Expo Pedometer.
      </Text>
      <StepCounter />
      <Link href="/two" style={styles.link}>
        Idź do Tab Two
      </Link>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  link: {
    marginTop: 24,
    color: 'blue',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
