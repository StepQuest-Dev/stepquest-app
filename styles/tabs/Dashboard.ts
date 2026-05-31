import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12181f'
  },
  // --- KONTENER MAPY (PEŁEN EKRAN) ---
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  // --- GÓRNA NAKŁADKA (PROFIL + DEV PANEL) ---
  topOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  profileHeader: {
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: '#2a3642',
    borderWidth: 2,
    borderColor: '#d8b26e',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden' // Dodane
  },
  avatarText: { fontSize: 22 },
  profileInfo: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  usernameText: { fontFamily: 'determination', color: '#ebd59b', fontSize: 14, letterSpacing: 0.5 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  levelText: { fontFamily: 'determination', color: '#fff', fontSize: 15, marginRight: 6 },
  expLabel: { fontFamily: 'determination', color: '#8a94a6', marginRight: 4 },
  expBarBg: { width: 65, height: 8, backgroundColor: '#12181f', borderWidth: 1, borderColor: '#454f5b', borderRadius: 1, overflow: 'hidden' },
  expBarFill: { height: '100%', backgroundColor: '#717d8c' },
  stepCoinsContainer: { alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 8 },
  coinsRow: { flexDirection: 'row', alignItems: 'center' },
  coinImage: {
    width: 30,
    height: 30,
    marginRight: 6,
  },
  coinsValue: { fontFamily: 'determination', color: '#ebd59b', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
  coinsLabel: { fontFamily: 'determination', color: '#ebd59b', letterSpacing: 0.5, marginTop: -2, opacity: 0.9 },

  // --- PODRĘCZNY PANEL DEWELOPERSKI ZE SCREENA ---
  devPanel: {
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
  },
  devPanelTitle: {
    fontFamily: 'determination',
    color: '#ebd59b',
    fontSize: 10,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  devButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  devButton: {
    flex: 1,
    backgroundColor: '#2a3642',
    borderWidth: 1,
    borderColor: '#a38450',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  devButtonText: {
    fontFamily: 'determination',
    color: '#ebd59b',
    fontSize: 12,
  },

  // --- DOLNA NAKŁADKA (NAWIGACJA) ---
  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 12,
    right: 12,
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    paddingHorizontal: 5,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  customAlertBox: {
    width: '85%',
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    padding: 20
  },
  alertTitle: {
    fontFamily: 'determination',
    color: '#ebd59b',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1
  },
  alertMessage: {
    fontFamily: 'determination',
    color: '#8a94a6',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20
  },
  alertMessageSuccess: {
    fontFamily: 'determination',
    color: '#2ecc71',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  alertButtonCancel: {
    flex: 1,
    backgroundColor: '#2a1a1e',
    borderWidth: 1,
    borderColor: '#e74c3c',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center'
  },
  alertButtonConfirm: {
    flex: 1,
    backgroundColor: '#2a3642',
    borderWidth: 1,
    borderColor: '#ebd59b',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center'
  },
  alertButtonOk: {
    width: '100%',
    backgroundColor: '#2a3642',
    borderWidth: 1,
    borderColor: '#2ecc71',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center'
  },
  alertButtonText: {
    fontFamily: 'determination',
    color: '#ebd59b',
    fontSize: 13,
    letterSpacing: 0.5
  },
  alertButtonTextCancel: {
    fontFamily: 'determination',
    color: '#e74c3c',
    fontSize: 13,
    letterSpacing: 0.5
  },

  navTab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' },
  activeNavTab: { backgroundColor: '#222d3a' },
  navIcon: { fontSize: 20, marginBottom: 2 },
  navText: { fontFamily: 'determination', color: '#8a94a6', fontSize: 12, letterSpacing: 0.5 },
  activeNavText: { color: '#ebd59b' },
  activeIndicator: { position: 'absolute', bottom: 4, left: '10%', right: '10%', height: 3, backgroundColor: '#ebd59b', borderRadius: 2 },
  navDivider: { width: 2, height: '45%', backgroundColor: '#a38450', opacity: 0.4 },

  // --- FALLBACKI MAPY ---
  webFallbackContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#171f2a' },
  webFallbackIcon: { fontSize: 48, marginBottom: 16 },
  gameModeTitle: { fontFamily: 'determination', color: '#ebd59b', fontSize: 18, letterSpacing: 1, textAlign: 'center' },
  gameModeSubtitle: { fontFamily: 'determination', color: '#8a94a6', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20, maxWidth: 500 },
  mapErrorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#171f2a' },
  mapErrorText: { fontFamily: 'determination', color: '#8a94a6', fontSize: 14, textAlign: 'center' },

  // Zaktualizuj ten styl (dodaj overflow: 'hidden', aby obrazek nie wystawał poza zaokrąglone rogi)

  // --- Style Ikon ---
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  navImage: {
    width: '100%',
    height: 30,
  },

});
