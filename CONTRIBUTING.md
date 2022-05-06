# Requirements

NodeJS 14.x and NPM v8.x version

# Clone & Setup

Run `git clone https://github.com/Xtendify/FounderPhone.git && cd FounderPhone`.

Run `npm run setup`.

# Services & ENV variables
- LocalTunnel - We need to use tunnel so that we can forward API requests from Slack & Twilio to localhost. (You can use NgRok for the same, run `ngrok http 3001` or https://www.npmjs.com/package/localtunnel, run `lt --port 3001`). Populate `SERVER_URL` based on the same.
- [MongoDB](https://account.mongodb.com/account/login) - create an account and populate `DATABASE_URL` env variable. Follow [getting started](https://www.mongodb.com/docs/atlas/getting-started/) and [this](https://www.mongodb.com/docs/guides/cloud/connectionstring/) guide to get the database URL.
- [Twilio](https://www.twilio.com/) - create an account and populate `TWILIO_SID`, `TWILIO_API_KEY` (auth token) and `TWILIO_NUMBER` env variables.
- [Slack](https://api.slack.com/apps) - create an app by going [here](https://api.slack.com/apps?new_app=1&manifest_yaml=display_information:%0A%20%20name:%20FounderPhone%0Afeatures:%0A%20%20bot_user:%0A%20%20%20%20display_name:%20founderphone%0A%20%20%20%20always_online:%20true%0A%20%20slash_commands:%0A%20%20%20%20-%20command:%20/founderphonetext%0A%20%20%20%20%20%20url:%20https://app.founderphone.com/api/founderphonetext%0A%20%20%20%20%20%20description:%20Send%20a%20first%20SMS%20and%20map%20this%20channel%20to%20the%20phone%20number%0A%20%20%20%20%20%20usage_hint:%20+15107562522%20Hi%20there!%0A%20%20%20%20%20%20should_escape:%20false%0A%20%20%20%20-%20command:%20/founderphonehelp%0A%20%20%20%20%20%20url:%20https://app.founderphone.com/api/founderphonehelp%0A%20%20%20%20%20%20description:%20How%20to%20use%20FounderPhone%0A%20%20%20%20%20%20should_escape:%20false%0Aoauth_config:%0A%20%20redirect_urls:%0A%20%20%20%20-%20https://app.founderphone.com/slackcallback%0A%20%20scopes:%0A%20%20%20%20user:%0A%20%20%20%20%20%20-%20channels:read%0A%20%20%20%20%20%20-%20files:read%0A%20%20%20%20%20%20-%20files:write%0A%20%20%20%20%20%20-%20groups:read%0A%20%20%20%20bot:%0A%20%20%20%20%20%20-%20commands%0A%20%20%20%20%20%20-%20app_mentions:read%0A%20%20%20%20%20%20-%20channels:join%0A%20%20%20%20%20%20-%20channels:manage%0A%20%20%20%20%20%20-%20channels:read%0A%20%20%20%20%20%20-%20chat:write%0A%20%20%20%20%20%20-%20groups:read%0A%20%20%20%20%20%20-%20groups:write%0A%20%20%20%20%20%20-%20users:read%0A%20%20%20%20%20%20-%20users:read.email%0Asettings:%0A%20%20event_subscriptions:%0A%20%20%20%20request_url:%20https://app.founderphone.com/api/founderphoneevent%0A%20%20%20%20user_events:%0A%20%20%20%20%20%20-%20channel_rename%0A%20%20%20%20bot_events:%0A%20%20%20%20%20%20-%20app_mention%0A%20%20%20%20%20%20-%20app_uninstalled%0A%20%20interactivity:%0A%20%20%20%20is_enabled:%20true%0A%20%20%20%20request_url:%20https://app.founderphone.com/api/slackinteraction%0A%20%20org_deploy_enabled:%20false%0A%20%20socket_mode_enabled:%20false%0A%20%20token_rotation_enabled:%20false), replace domain in App Manifest by `SERVER_URL`. Then populate `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` env variables.
- [Firebase](https://firebase.google.com/) for authentication. Populate `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PROJECT_ID` and `FIREBASE_DATABASE_URL` env variables.

---

# Server

Run `npm run dev` to start server.

---

# Client

Run `cd client && npm run dev` to start client.

---

# Create Pull Request
Fork the repository, make your changes and create a pull request merging your changes to `master`.

---

# Advanced

## Local tunnel URL changes
- Update `SERVER_URL` in .env file and restart server.
- Update `App Manifest` with new domain in Slack App. Do not update full URL.
- Update `Active Configuration` for your number in [Twilio](https://console.twilio.com/us1/develop/phone-numbers/manage/active). Message webhook should be https://app.founderphone.com/api/sms and voice webhook should be https://app.founderphone.com/api/forwardcall. Replace domain with `SERVER_URL`.
