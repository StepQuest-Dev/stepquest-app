import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
        backgroundColor: '#12181f',
        justifyContent: 'space-between'
    },
    profileHeader: {
        backgroundColor: '#1d2631',
        borderWidth: 2,
        borderColor: '#a38450',
        borderRadius: 4,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 45 : 10,
        zIndex: 10
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        backgroundColor: '#2a3642',
        borderWidth: 2,
        borderColor: '#d8b26e',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: {
        fontSize: 22
    },
    profileInfo: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center'
    },
    usernameText: {
        color: '#ebd59b',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 0.5
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2
    },
    levelText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        marginRight: 6
    },
    expLabel: {
        color: '#8a94a6',
        fontSize: 11,
        fontWeight: 'bold',
        marginRight: 4
    },
    expBarBg: {
        width: 65,
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
    stepCoinsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingLeft: 8
    },
    coinsRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    coinIcon: {
        fontSize: 18,
        marginRight: 4
    },
    coinsValue: {
        color: '#ebd59b',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1
    },
    coinsLabel: {
        color: '#ebd59b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        marginTop: -2,
        opacity: 0.9
    },
    mainContent: {
        flex: 1,
        marginVertical: 12,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#a38450',
        overflow: 'hidden',
        backgroundColor: '#171f2a'
    },
    webFallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    webFallbackIcon: {
        fontSize: 48,
        marginBottom: 16
    },
    gameModeTitle: {
        color: '#ebd59b',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        textAlign: 'center'
    },
    gameModeSubtitle: {
        color: '#8a94a6',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
        maxWidth: 500
    },
    mapErrorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    mapErrorText: {
        color: '#8a94a6',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    bottomNavContainer: {
        backgroundColor: '#1d2631',
        borderWidth: 2,
        borderColor: '#a38450',
        borderRadius: 4,
        flexDirection: 'row',
        height: 80,
        alignItems: 'center',
        paddingHorizontal: 5,
        marginBottom: Platform.OS === 'ios' ? 15 : 0
    },
    navTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative'
    },
    activeNavTab: {
        backgroundColor: '#222d3a'
    },
    navIcon: {
        fontSize: 20,
        marginBottom: 2
    },
    navText: {
        color: '#8a94a6',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 0.5
    },
    activeNavText: {
        color: '#ebd59b'
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 4,
        left: '10%',
        right: '10%',
        height: 3,
        backgroundColor: '#ebd59b',
        borderRadius: 2
    },
    navDivider: {
        width: 2,
        height: '45%',
        backgroundColor: '#a38450',
        opacity: 0.4
    }
});