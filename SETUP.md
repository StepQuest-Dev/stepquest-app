# Instrukcja Konfiguracji Środowiska (Step-by-Step)

Poniższa instrukcja przeprowadzi Cię przez proces uruchomienia pełnego środowiska StepQuest (Backend + Frontend + Infrastruktura).

**Po sklonowaniu repo w obu wykonaj**:
```bash
npm install
npx install
```

## 1. Infrastruktura i Baza Danych (Backend)

W folderze `stepquest-server` wykonaj następujące kroki:

1.  **Uruchom kontenery bazy danych i Redis**:
    ```bash
    docker-compose up -d redis postgres
    ```

2.  **Zsynchronizuj schemat bazy danych**:
    ```bash
    npx prisma db push
    ```

3.  **Wygeneruj klienta Prisma**:
    ```bash
    npx prisma generate
    ```

4.  **Wypełnij bazę danymi startowymi (Klasy, Przeciwnicy)**:
    ```bash
    npx ts-node prisma/seed.ts
    ```

5.  **Uruchom serwer NestJS**:
    ```bash
    npm run start:dev
    ```

## 2. Udostępnienie API na Świat (Tunnel)

Aby móc testować aplikację na telefonie poza siecią lokalną (lub przez LTE), uruchom tunnel w osobnym oknie terminala:

```bash
npx cloudflared tunnel --url http://localhost:3000
```

*Skopiuj wygenerowany adres URL (np. `https://random-name.trycloudflare.com`).*

## 3. Konfiguracja Aplikacji Mobilnej (Frontend)

W folderze `stepquest-app` wykonaj następujące kroki:

1.  **Zaktualizuj plik `.env`**:
    Wklej wygenerowany adres URL do zmiennej `EXPO_PUBLIC_API_URL`:
    ```env
    EXPO_PUBLIC_API_URL=https://TWOJ-ADRES-Z-CLOUDFLARE.trycloudflare.com/api/v1
    ```

2.  **Uruchom Expo z czyszczeniem cache**:
    ```bash
    npx expo start -c --tunnel
    ```

---
**Uwaga:** Upewnij się, że w pliku `.env` backendu dane połączenia z bazą danych odpowiadają Twojej lokalnej konfiguracji (domyślne wartości w `.env.example` są zgodne z `docker-compose.yml`).
