import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#12181f'
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
        fontSize: 34,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 35,
        color: '#ebd59b',
        letterSpacing: 2,
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 1
    },
    input: {
        backgroundColor: '#212933',
        padding: 15,
        borderRadius: 4,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#a38450',
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
        borderColor: '#d8b26e',
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
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#212933',
        borderRadius: 4,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#a38450',
    },
    eyeIcon: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    }
});