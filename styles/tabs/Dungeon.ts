import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12181f',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    tintColor: '#e74c3c'
  },
  title: {
    fontFamily: 'determination',
    fontSize: 28,
    color: '#e74c3c',
    marginBottom: 5,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  subtitle: {
    color: '#8a94a6',
    fontSize: 14,
    fontFamily: 'determination',
    textAlign: 'center'
  },
  listContainer: {
    paddingBottom: 20,
  },
  monsterCard: {
    flexDirection: 'row',
    backgroundColor: '#1d2631',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  monsterImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2a3642',
    marginRight: 15,
  },
  monsterInfo: {
    flex: 1,
  },
  monsterName: {
    fontFamily: 'determination',
    color: '#ebd59b',
    fontSize: 18,
    marginBottom: 4,
  },
  monsterStats: {
    fontFamily: 'determination',
    color: '#e74c3c',
    fontSize: 14,
  },
  attackButton: {
    backgroundColor: '#8b0000',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff4c4c',
  },
  attackButtonText: {
    color: '#fff',
    fontFamily: 'determination',
    fontSize: 14,
    letterSpacing: 1,
  }
});