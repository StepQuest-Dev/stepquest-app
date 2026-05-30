import React from 'react';
import { TextInput, TextInputProps, useColorScheme, StyleSheet } from 'react-native';

export default function StyledTextInput(props: TextInputProps) {
  const colorScheme = useColorScheme(); // Wykrywa czy użytkownik ma jasny czy ciemny motyw
  
  // Definiujemy kolory dla placeholderów
  const placeholderColor = colorScheme === 'dark' ? '#bdc3c7' : '#7f8c8d';

  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderColor} // To jest kluczowe!
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    // Twoje globalne style inputa
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    // Kolor tekstu też może być zależny od motywu:
  }
});