import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#12181f' // Ciemne tło RPG
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 160,  
    height: 160, 
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 40, 
    color: '#ebd59b', // Złoty kolor tekstu
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1
  },
  input: { 
    backgroundColor: '#212933', // Granatowo-szare tło pól tekstowych
    padding: 15, 
    borderRadius: 4, // Ostre, pikselowe krawędzie
    marginBottom: 15, 
    borderWidth: 2, 
    borderColor: '#a38450', // Ciemnozłota ramka
    color: '#ebd59b', 
    fontSize: 16
  },
  button: { 
    backgroundColor: '#2a3642', 
    padding: 15, 
    borderRadius: 4, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d8b26e', // Jasnozłota ramka przycisku
    marginTop: 10
  },
  buttonDisabled: { 
    backgroundColor: '#1a2026',
    borderColor: '#555'
  },
  buttonText: { 
    color: '#ebd59b', 
    fontWeight: 'bold', 
    fontSize: 18,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  },
  linkText: { 
    textAlign: 'center', 
    color: '#a38450', 
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    textDecorationLine: 'underline'
  }
});