import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12181f',
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 32,
    fontFamily: 'determination',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 2
  },
  turn: {
    color: '#ebd59b',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30
  },
  text: {
    color: '#8a94a6',
    textAlign: 'center',
    marginTop: 15
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40
  },
  statBox: {
    backgroundColor: '#1d2631',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#a38450',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ebd59b',
    marginBottom: 10,
    backgroundColor: '#2a3642'
  },
  statName: {
    color: '#ebd59b',
    fontSize: 16,
    fontFamily: 'determination',
    marginBottom: 5,
    textAlign: 'center'
  },
  hpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hpText: {
    color: '#e74c3c',
    fontSize: 18,
    fontFamily: 'determination',
    textAlign: 'center'
  },
  vs: {
    color: '#8a94a6',
    fontSize: 24,
    fontFamily: 'determination',
    marginHorizontal: 15
  },
  actionTitle: {
    fontFamily: 'determination',
    color: '#8a94a6',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1
  },
  actionsContainer: {
    gap: 15
  },
  actionButton: {
    backgroundColor: '#8b0000',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff4c4c',
    alignItems: 'center'
  },
  fleeButton: {
    backgroundColor: '#2a3642',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8a94a6',
    alignItems: 'center'
  },
  actionText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'determination',
  }
});