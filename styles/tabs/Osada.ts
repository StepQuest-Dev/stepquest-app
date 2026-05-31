import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  townView: {
    flex: 1,
  },
  building: {
    position: 'absolute',
    zIndex: 5,
  },
  bubbleWrapper: {
    alignItems: 'center',
  },
  bubblePointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#a38450',
    marginTop: -2,
  },
  plaque: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 38, 49, 0.95)',
    borderWidth: 2,
    borderColor: '#a38450',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 10,
  },
  plaqueIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  plaqueText: {
    color: '#ebd59b',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'determination',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  hut: { 
    top: height * 0.18, 
    left: width * 0.1 
  },
  barracks: { 
    top: height * 0.39, 
    right: width * 0.03 
  },
  workshop: { 
    bottom: height * 0.49, 
    left: width * 0.03 
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  npcDialogCard: {
    backgroundColor: '#1d2631',
    width: '100%',
    borderRadius: 15,
    borderWidth: 2,
    padding: 25,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  closeBtnText: {
    color: '#8a94a6',
    fontSize: 20,
    fontFamily: 'determination'
  },
  modalEmoji: { 
    fontSize: 60, 
    marginBottom: 15 
  },
  modalName: { 
    color: '#ebd59b', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    fontFamily: 'determination' 
  },
  modalDialog: { 
    color: '#c9d1d9', 
    fontSize: 14, 
    fontStyle: 'italic', 
    textAlign: 'center', 
    lineHeight: 22, 
    marginBottom: 25, 
    fontFamily: 'determination' 
  },
  modalActionBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalActionText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold', 
    letterSpacing: 1, 
    fontFamily: 'determination' 
  },
  disabledBtn: { 
    backgroundColor: '#30363d', 
    opacity: 0.5 
  },
});