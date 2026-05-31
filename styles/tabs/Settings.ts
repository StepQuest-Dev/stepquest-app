import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0d1117' 
  },
  centerContainer: { 
    flex: 1, 
    backgroundColor: '#0d1117', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 20, 
    paddingBottom: 15, 
    backgroundColor: '#161b22', 
    borderBottomWidth: 1, 
    borderBottomColor: '#a38450' 
  },
  backButton: { 
    padding: 10 
  },
  topBarTitle: { 
    color: '#ebd59b', 
    fontSize: 18, 
    fontWeight: 'bold', 
    fontFamily: 'determination', 
    letterSpacing: 1 
  },
  scrollContent: { 
    padding: 20 
  },
  sectionTitle: { 
    color: '#8a94a6', 
    fontSize: 14, 
    fontFamily: 'determination', 
    marginBottom: 10, 
    marginTop: 10 
  },
  card: { 
    backgroundColor: '#1d2631', 
    borderRadius: 8, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#30363d', 
    marginBottom: 20 
  },
  label: { 
    color: '#c9d1d9', 
    fontSize: 14, 
    marginBottom: 15, 
    fontFamily: 'determination' 
  },
  input: { 
    backgroundColor: '#0d1117', 
    color: '#c9d1d9', 
    borderWidth: 1, 
    borderColor: '#a38450', 
    borderRadius: 5, 
    padding: 12, 
    fontSize: 16, 
    fontFamily: 'determination', 
    marginBottom: 15 
  },
  saveBtn: { 
    backgroundColor: '#a38450', 
    paddingVertical: 12, 
    borderRadius: 5, 
    alignItems: 'center' 
  },
  saveBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontFamily: 'determination', 
    fontSize: 16 
  },
  avatarGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 15, 
    marginBottom: 20 
  },
  avatarWrapper: { 
    width: 60, 
    height: 60, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: 'transparent', 
    overflow: 'hidden', 
    position: 'relative' 
  },
  avatarSelected: { 
    borderColor: '#ebd59b' 
  },
  avatarImage: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: '#2a3642' 
  },
  checkmark: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: '#2ecc71', 
    padding: 4, 
    borderTopLeftRadius: 5 
  },
  // --- NOWE STYLE DO USUWANIA KONTA ---
  dangerBtn: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
    marginTop: 10
  },
  dangerBtnText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontFamily: 'determination',
    fontSize: 16
  }
});