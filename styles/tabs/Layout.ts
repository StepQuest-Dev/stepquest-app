import { Platform, StyleSheet } from 'react-native';

export const layoutStyles = StyleSheet.create({
  bottomNavContainer: {
    backgroundColor: '#1d2631',
    borderTopWidth: 2,
    borderColor: '#a38450',
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 95 : 80,
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: Platform.OS === 'ios' ? 15 : 0, 
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeNavTab: {
    backgroundColor: '#222d3a',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navText: {
    color: '#8a94a6',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  activeNavText: {
    color: '#ebd59b',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#ebd59b',
    borderRadius: 2,
  },
  navDivider: {
    width: 2,
    height: '45%',
    backgroundColor: '#a38450',
    opacity: 0.4,
  }
});