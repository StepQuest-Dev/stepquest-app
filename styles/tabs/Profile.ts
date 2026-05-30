import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#12181f'
    },
    loadingText: {
        marginTop: 15,
        color: '#ebd59b',
        fontWeight: 'bold',
        fontSize: 16
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 16,
        fontWeight: 'bold'
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
        color: '#ebd59b',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 1
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
        color: '#ebd59b',
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 0.5
    },
    email: {
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
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 6
    },
    expLabel: {
        color: '#8a94a6',
        fontSize: 10,
        fontWeight: 'bold',
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
        color: '#e74c3c',
        fontSize: 12,
        fontWeight: 'bold',
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
        fontSize: 15,
        fontWeight: 'bold',
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
        fontWeight: 'bold',
        color: '#ebd59b'
    },
    characterClass: {
        fontSize: 11,
        color: '#8a94a6',
        fontWeight: 'bold',
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
        fontWeight: 'bold',
        fontSize: 12
    },
    emptyText: {
        textAlign: 'center',
        color: '#8a94a6',
        marginTop: 20,
        fontStyle: 'italic',
        fontSize: 13
    }
});