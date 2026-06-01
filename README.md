# StepQuest - Mobile App

StepQuest to innowacyjna gra mobilna RPG, która łączy świat wirtualny z aktywnością fizyczną. Twoje kroki w rzeczywistości przekładają się na siłę Twojego bohatera w grze. Eksploruj mapę, walcz z potworami i rozbudowuj swoją osadę!

## 🚀 Główne Funkcje

-   **System Kroków RPG**: Twoja codzienna aktywność fizyczna (kroki) jest synchronizowana z serwerem i bezpośrednio wpływa na bonusy do obrażeń w walce.
-   **Eksploracja GPS**: Wykorzystaj mapę Leaflet do odkrywania unikalnych miejsc w Twojej okolicy i zbierania nagród.
-   **System Walki**: Turowy system walki z różnorodnymi przeciwnikami, uwzględniający statystyki klasowe i bonusy z aktywności.
-   **Zarządzanie Osadą**: Rozbudowuj swoje budynki, wysyłaj wojska na rajdy do innych graczy i odpieraj ataki najeźdźców.
-   **Klasy Postaci**: Wybierz swoją ścieżkę jako Wojownik, Mnich, Czarnoksiężnik lub Zwiadowca – każda klasa posiada unikalne bonusy i skalowanie statystyk.

## 🛠 Tech Stack

-   **Framework**: React Native (Expo)
-   **Nawigacja**: Expo Router
-   **Sensory**: Expo Sensors (Pedometer), Expo Location
-   **Komunikacja**: Axios
-   **Mapa**: Leaflet (przez WebView)
-   **Storage**: Expo Secure Store (bezpieczne przechowywanie tokenów JWT)
-   **UI**: Custom Styled Components, Lottie Animations

## ⚙️ Instalacja i Konfiguracja

1.  **Sklonuj repozytorium**:
    ```bash
    git clone <url-repozytorium-app>
    cd stepquest-app
    ```

2.  **Zainstaluj zależności**:
    ```bash
    npm install
    ```

3.  **Konfiguracja Środowiska**:
    Utwórz plik `.env` w głównym folderze i skonfiguruj adresy API:
    ```env
    # Lokalny adres IP Twojego komputera (dla testów w sieci lokalnej)
    EXPO_PUBLIC_LOCAL_IP=192.168.x.x
    
    # Adres API (pusty dla automatycznego wyboru lub URL tunelu ngrok/cloudflare)
    EXPO_PUBLIC_API_URL=https://twoj-tunnel.trycloudflare.com/api/v1
    ```

4.  **Uruchomienie**:
    ```bash
    npx expo start
    ```
    *Użyj `npx expo start -c`, aby wyczyścić cache przy zmianie adresu API.*

## 📱 Platformy
-   **Android / iOS**: Pełna obsługa GPS i krokomierza.
-   **Web**: Wersja podglądowa (pedometer i GPS mogą posiadać ograniczenia przeglądarki).

---
© 2026 StepQuest Team
