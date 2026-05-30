import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
        marginBottom: 15,
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
        fontSize: 16,
        letterSpacing: 1
    },
    infoCard: {
        backgroundColor: '#1d2631',
        borderWidth: 2,
        borderColor: '#a38450',
        borderRadius: 4,
        padding: 12,
        marginBottom: 15
    },
    infoTitle: {
        color: '#ebd59b',
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 6,
        letterSpacing: 0.5
    },
    infoText: {
        color: '#8a94a6',
        fontSize: 12,
        marginTop: 2
    },
    highlight: {
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: 'bold'
    },
    sectionCard: {
        backgroundColor: '#171f2a',
        borderWidth: 2,
        borderColor: '#ebd59b',
        borderRadius: 4,
        padding: 15,
        marginBottom: 15
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    sectionTitle: {
        color: '#ebd59b',
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 0.5
    },
    sectionSubtitle: {
        color: '#8a94a6',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 15
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12
    },
    mockButton: {
        flex: 1,
        backgroundColor: '#2a3642',
        borderWidth: 1,
        borderColor: '#a38450',
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mockButtonEpic: {
        backgroundColor: '#352e25',
        borderColor: '#ebd59b'
    },
    buttonText: {
        color: '#ebd59b',
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 0.5
    },
    consoleContainer: {
        flex: 1,
        backgroundColor: '#0d1117',
        borderWidth: 2,
        borderColor: '#454f5b',
        borderRadius: 4,
        padding: 12
    },
    consoleTitle: {
        color: '#8a94a6',
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 8,
        letterSpacing: 0.5
    },
    consoleScroll: {
        flex: 1
    },
    consoleText: {
        color: '#c9d1d9',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 4
    }
});