# Flutter registration app

This Flutter app registers accounts through the backend's `POST /auth/register`
endpoint. The form checks the backend's username and password requirements
before sending a request.

## Run locally

Start the backend on port 3000, then run the Flutter app:

```sh
flutter run
```

The default API address is `http://localhost:3000` for web and desktop, and
`http://10.0.2.2:3000` for the Android emulator. To use another API address,
pass it at build or run time:

```sh
flutter run --dart-define=API_BASE_URL=https://api.example.com
```

Local web development origins (`localhost` and `127.0.0.1`) are allowed by the
backend. Set `FRONTEND_ORIGINS` to a comma-separated list of exact trusted
origins when deploying the web app, for example
`https://app.example.com,https://admin.example.com`.

Use HTTPS for deployed API traffic. Android cleartext traffic is enabled only
for the emulator's `10.0.2.2` host.
