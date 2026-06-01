import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    paddingTop: 60
  },
  title: {
    fontSize: 32,
    fontFamily: 'determination',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  },
  turn: {
    color: '#ebd59b',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'determination',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    paddingTop: 80
  },
  text: {
    color: '#8a94a6',
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'determination'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40
  },
  statBox: {
    backgroundColor: 'rgba(29, 38, 49, 0.85)',
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
    borderRadius: 5,
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
    backgroundColor: 'rgba(139, 0, 0, 0.85)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff4c4c',
    alignItems: 'center'
  },
  fleeButton: {
    backgroundColor: 'rgba(42, 54, 66, 0.85)',
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