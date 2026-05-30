export const tabsScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#ebd59b', // Zmienione z niebieskiego na złoty, pasujący do stylistyki RPG
    tabBarInactiveTintColor: '#8a94a6',
    tabBarStyle: {
        backgroundColor: '#1d2631', // Dopasowane do ciemnego motywu gry
        borderTopWidth: 2,
        borderTopColor: '#a38450',
        height: 65,
        paddingBottom: 10,
        paddingTop: 5,
    },
    tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: 'bold' as const, // 'as const' pomaga TypeScriptowi zrozumieć, że to konkretna wartość, a nie zwykły string
        letterSpacing: 0.5,
    }
};