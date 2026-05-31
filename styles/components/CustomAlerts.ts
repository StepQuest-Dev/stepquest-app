import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  alertTitle: { color: '#ebd59b', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', letterSpacing: 1 },
  alertMessage: { color: '#8a94a6', fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  alertMessageSuccess: { color: '#2ecc71', fontSize: 14, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  alertButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  alertButtonCancel: { flex: 1, backgroundColor: '#2a1a1e', borderWidth: 1, borderColor: '#e74c3c', paddingVertical: 10, borderRadius: 4, alignItems: 'center' },
  alertButtonConfirm: { flex: 1, backgroundColor: '#2a3642', borderWidth: 1, borderColor: '#ebd59b', paddingVertical: 10, borderRadius: 4, alignItems: 'center' },
  alertButtonOk: { width: '100%', backgroundColor: '#2a3642', borderWidth: 1, borderColor: '#2ecc71', paddingVertical: 10, borderRadius: 4, alignItems: 'center' },
  alertButtonText: { color: '#ebd59b', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
  alertButtonTextCancel: { color: '#e74c3c', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 }
});