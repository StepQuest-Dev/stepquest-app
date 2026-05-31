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
    fontWeight: 'bold', 
    color: '#e74c3c', 
    textAlign: 'center', 
    marginBottom: 10, 
    letterSpacing: 2 
  },
  turn: { 
    color: '#ebd59b', 
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 40 
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
    marginBottom: 50 
  },
  statBox: { 
    backgroundColor: '#1d2631', 
    padding: 20, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: '#a38450', 
    flex: 1, 
    alignItems: 'center' 
  },
  statName: { 
    color: '#ebd59b', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  hpText: { 
    color: '#e74c3c', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  vs: { 
    color: '#8a94a6', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginHorizontal: 10 
  },
  actionTitle: { 
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
    fontWeight: 'bold' 
  }
});