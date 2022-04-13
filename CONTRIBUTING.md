# Requirements

NodeJS 14.x and NPM v8.x version

# Clone & Setup

Run `git clone git@gitlab.com:xtendify/founderphone/founderphone.git && cd founderphone`.

Run `npm run setup`.

---

# Server

## Populating env variables

We need to use tunnel so that we can forward API requests from Slack & Twilio to localhost. (You can use NgRok for the same, run `ngrok http 3001` or https://www.npmjs.com/package/localtunnel, run `lt --port 3001`).

Choose your env variables from https://gitlab.com/xtendify/founderphone/founderphone/-/wikis/Available-Slack-Apps-and-Tunnels (do not use variables which has user assigned to it and whichever you choose assign your name after it). Replace `SERVER_URL`, `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` in `.env` file.

## Start Server

Run `npm run dev` to start server.

---

# Client

Run `cd client && npm run dev` to start client.

---

# Create Pull Request
Push your changes under branch `issue/<123>`. Create a pull request merging your changes to `master` and requesting review from fellow contributors.

---

# Advanced

## Local tunnel URL changes
- Update `SERVER_URL` in .env file and restart server.
- Update `App Manifest` with new domain in Slack App. Do not update full URL. (Ask Rohit for access)
- Update `Active Configuration` for your number in [Twilio](https://console.twilio.com/us1/develop/phone-numbers/manage/active). (Ask Rohit for access)
