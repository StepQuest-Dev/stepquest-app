import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#12181f'
    },
    loadingText: {
        fontFamily: 'determination',
        marginTop: 15,
        color: '#ebd59b',
        fontSize: 16
    },
    errorText: {
        fontFamily: 'determination',
        color: '#e74c3c',
        fontSize: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#12181f',
        padding: 12
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Platform.OS === 'ios' ? 20 : 10,
        marginBottom: 10,
        paddingHorizontal: 8
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#1d2631',
        borderWidth: 2,
        borderColor: '#a38450',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topBarTitle: {
        fontFamily: 'determination',
        color: '#ebd59b',
        fontSize: 18,
        letterSpacing: 1,
        marginLeft: 8
    },
    headerCard: {
        flexDirection: 'row',
        backgroundColor: '#1d2631',
        borderWidth: 2,
        borderColor: '#a38450',
        borderRadius: 4,
        padding: 12,
        alignItems: 'center',
        marginBottom: 15
    },
    avatarWrapper: {
        position: 'relative'
    },
    avatar: {
        width: 64,
        height: 64,
        backgroundColor: '#2a3642',
        borderWidth: 2,
        borderColor: '#d8b26e',
        borderRadius: 4
    },
    avatarOverlay: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#1d2631',
        borderWidth: 1,
        borderColor: '#ebd59b',
        borderRadius: 3,
        padding: 2
    },
    headerInfo: {
        marginLeft: 12,
        flex: 1,
        justifyContent: 'center'
    },
    username: {
        fontFamily: 'determination',
        color: '#ebd59b',
        fontSize: 15,
        letterSpacing: 0.5
    },
    email: {
        fontFamily: 'determination',
        fontSize: 12,
        color: '#8a94a6',
        marginTop: 1,
        marginBottom: 4
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2
    },
    levelText: {
        fontFamily: 'determination',
        color: '#fff',
        fontSize: 14,
        marginRight: 6
    },
    expLabel: {
        fontFamily: 'determination',
        color: '#8a94a6',
        fontSize: 10,
        marginRight: 4
    },
    expBarBg: {
        width: 70,
        height: 8,
        backgroundColor: '#12181f',
        borderWidth: 1,
        borderColor: '#454f5b',
        borderRadius: 1,
        overflow: 'hidden'
    },
    expBarFill: {
        height: '100%',
        backgroundColor: '#717d8c'
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#2a1a1e',
        borderWidth: 1,
        borderColor: '#e74c3c',
        borderRadius: 4,
        marginLeft: 'auto'
    },
    logoutText: {
        fontFamily: 'determination',
        color: '#e74c3c',
        fontSize: 12,
        marginLeft: 6
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#171f2a',
        borderWidth: 2,
        borderColor: '#a38450',
        borderRadius: 4,
        padding: 15,
        marginVertical: 5
    },
    sectionTitle: {
        fontFamily: 'determination',
        fontSize: 15,
        color: '#ebd59b',
        marginBottom: 15,
        letterSpacing: 0.5
    },
    flatListContent: {
        paddingBottom: 10
    },
    characterCard: {
        flexDirection: 'row',
        backgroundColor: '#1d2631',
        borderWidth: 1,
        borderColor: '#454f5b',
        padding: 12,
        borderRadius: 4,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    characterInfo: {
        flex: 1
    },
    characterName: {
        fontSize: 15,
        fontFamily: 'determination',
        color: '#ebd59b'
    },
    characterClass: {
        fontSize: 11,
        color: '#8a94a6',
        fontFamily: 'determination',
        letterSpacing: 0.5,
        marginTop: 2
    },
    characterLevelBadge: {
        backgroundColor: '#2a3642',
        borderWidth: 1,
        borderColor: '#d8b26e',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 2
    },
    characterLevelText: {
        color: '#ebd59b',
        fontFamily: 'determination',
        fontSize: 12
    },
    emptyText: {
        textAlign: 'center',
        color: '#8a94a6',
        marginTop: 20,
        //fontStyle: 'italic',
        fontSize: 13,
        fontFamily: 'determination'
    },
    // --- STYLE EKWIPUNKU ---
    equipmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a3642',
        borderWidth: 1,
        borderColor: '#a38450',
        borderRadius: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginTop: 10,
        alignSelf: 'flex-start'
    },
    equipmentButtonText: {
        color: '#ebd59b',
        fontFamily: 'determination',
        fontSize: 14,
        marginLeft: 8
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    equipmentPanel: {
        width: '100%',
        backgroundColor: '#1d2631',
        borderWidth: 2,
        borderColor: '#a38450',
        borderRadius: 8,
        padding: 15,
        maxHeight: '80%'
    },
    equipmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#a38450',
        paddingBottom: 10
    },
    equipmentTitle: {
        fontFamily: 'determination',
        fontSize: 20,
        color: '#ebd59b'
    },
    closeButton: {
        padding: 5
    },
    equipmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    equipmentSlot: {
        width: 70,
        height: 70,
        backgroundColor: '#12181f',
        borderWidth: 2,
        borderColor: '#454f5b',
        borderRadius: 4,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    equipmentSlotEquipped: {
        borderColor: '#ebd59b',
        backgroundColor: '#2a3642'
    },
    slotLabel: {
        color: '#8a94a6',
        fontSize: 10,
        fontFamily: 'determination',
        marginTop: 4,
        textAlign: 'center'
    },
    itemName: {
        color: '#ebd59b',
        fontSize: 8,
        fontFamily: 'determination',
        marginTop: 2,
        textAlign: 'center'
    }
});