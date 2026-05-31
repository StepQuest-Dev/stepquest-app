import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/components/CustomAlerts';

interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isSuccess?: boolean;
  showCancel?: boolean; // Nowy parametr
}

export default function CustomAlert({ 
  visible, title, message, onClose, onConfirm, 
  confirmText = "TAK", cancelText = "NIE", isSuccess = false,
  showCancel = true // Domyślnie true, żeby nie popsuć starych alertów
}: AlertProps) {
  
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.customAlertBox}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={isSuccess ? styles.alertMessageSuccess : styles.alertMessage}>{message}</Text>
          
          <View style={styles.alertButtonsRow}>
            {/* Jeśli jest onConfirm I chcemy przycisk NIE (showCancel), wyświetl oba */}
            {onConfirm && showCancel ? (
              <>
                <TouchableOpacity style={styles.alertButtonCancel} onPress={onClose}>
                  <Text style={styles.alertButtonTextCancel}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.alertButtonConfirm} onPress={onConfirm}>
                  <Text style={styles.alertButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              // W przeciwnym razie wyświetl tylko jeden przycisk (OK)
              <TouchableOpacity style={styles.alertButtonOk} onPress={onConfirm || onClose}>
                <Text style={styles.alertButtonText}>{onConfirm ? confirmText : "DOBRZE"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}