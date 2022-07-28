# miki-whatsapp-bot

WhatsApp chatbot powered by Baileys.

<a href="https://twitter.com/imasml_ssr/status/1513508173747224578"><img src="https://pbs.twimg.com/media/FQEPqQOakAYk9Lb?format=jpg&name=4096x4096" width="100%" alt="Hoshii Miki" /></a>

<center><i>Miki ❤</i></center>

## Dependencies

-   Node.JS (14.17.0)
-   Imagemagick (7.1.0)
-   FFMpeg (2022-04-18)
-   Webpmux and Dwebp

## Run

```sh
git clone https://github.com/riozec/miki-whatsapp-bot
yarn install # or 'npm install', yarn is recommended
yarn build # or 'npm run build'
yarn start # or 'npm start'
```

### `.env` Configurations

```sh
# the bot number itself (NECESSARY)
BOT_NUMBER="1234567890"
# your number (NECESSARY)
OWNER_NUMBER="1234567890"
# the number people will contact to buy Premium
CUSTOMER_SERVICE_NUMBER="1234567890"
# the number to receive the feedback when a user sent a feedback using /feedback command
# (can be a group) (ends it with @g.us if it's a group)
FEEDBACK_NUMBER="1234567890"
# bot will send a backup copy of the database every minute. This is the number to send to
# (can be a group) (ends it with @g.us if it's a group)
DATABASE_BACKUP_NUMBER="1234567890"
# everytime there is an error in command, bot will send a report to this number
# (can be a group) (ends it with @g.us if it's a group)
ERROR_REPORT_NUMBER="1234567890"
# prefix of the bot
PREFIX="!@#$%^&*"
```

### Command Line Arguments

-   `--baileys-debug` (set Baileys log level to `debug`)

## Commands List

| No  | Name                    | Permission    | Status |
| --- | ----------------------- | ------------- | ------ |
| 1   | about                   | all           | ✔      |
| 2   | addpremium              | all-owner     | ✔      |
| 3   | echo/say                | all           | ✔      |
| 4   | adminonly               | group-admin   | ✔      |
| 5   | premium                 | all           | ✔      |
| 6   | ban                     | all-owner     | ✔      |
| 7   | stats                   | all           | ✔      |
| 8   | getbackup               | all-owner     | ✔      |
| 9   | ev                      | all-owner     | ✔      |
| 10  | feedback                | all           | ✔      |
| 11  | help                    | all           | ✔      |
| 12  | language                | private-admin | ✔      |
| 13  | menu                    | all           | ✔      |
| 14  | premium                 | all-owner     | ✔      |
| 15  | sleep                   | group-admin   | ✔      |
| 16  | sticker/sticker/s       | all           | ✔      |
| 17  | unsticker/unsticker/uns | all           | ✔      |
| 18  | batchsticker            | all (premium) | ✔      |
| 19  | batchunsticker          | all (premium) | ✔      |
