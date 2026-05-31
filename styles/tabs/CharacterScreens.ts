import { StyleSheet } from 'react-native';

export const charStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12181f', padding: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingTop: 10 },
  backButton: { padding: 10 },
  topBarTitle: { color: '#ebd59b', fontSize: 20, fontFamily: 'determination', marginLeft: 15 },

  // Create Character
  inputTitle: { color: '#8a94a6', fontFamily: 'determination', fontSize: 14, marginBottom: 5 },
  input: { backgroundColor: '#1d2631', color: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#2a3642', marginBottom: 20, fontFamily: 'determination' },
  classCard: { backgroundColor: '#1d2631', padding: 15, borderRadius: 8, borderWidth: 2, borderColor: '#2a3642', marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  classCardSelected: { borderColor: '#ebd59b', backgroundColor: '#2a3642' },
  classIcon: { width: 50, height: 50, borderRadius: 5, marginRight: 15, borderWidth: 2, borderColor: '#ebd59b' },
  classTitle: { color: '#ebd59b', fontFamily: 'determination', fontSize: 18 },
  classDesc: { fontFamily: 'determination', color: '#8a94a6', fontSize: 12, marginTop: 4, paddingRight: 50 },
  statsRow: { flexDirection: 'row', gap: 15, marginTop: 8 },
  statText: { fontFamily: 'determination', fontSize: 12 },
  submitBtn: { backgroundColor: '#ebd59b', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#12181f', fontFamily: 'determination', fontSize: 18 },

  // Character Details
  detailsCard: { backgroundColor: '#1d2631', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#a38450', alignItems: 'center' },
  bigAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 2, borderColor: '#ebd59b' },
  charName: { color: '#ebd59b', fontFamily: 'determination', fontSize: 24, marginBottom: 5 },
  charLevel: { color: '#8a94a6', fontFamily: 'determination', fontSize: 16, marginBottom: 20 },
  deleteBtn: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, borderWidth: 1, borderColor: '#c0392b' },
  deleteBtnText: { color: '#fff', fontFamily: 'determination', fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});