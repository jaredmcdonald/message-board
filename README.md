# Express Board

Hacker News-inspired message board, written in express.

## Prerequisites

- `mongodb` (`brew install mongodb`)
- development: `supervisor` (`npm install -g supervisor`)

## Environment variables

- `SECRET`: express session secret
- `PORT`: for HTTP
- `MONGODB_URI` or `MONGOLAB_URI`: URI of mongodb instance, passed to `mongoose.connect`
- `APPLICATION_NAME`: name of app, used in main `<h1>` and page title
- `NODE_ENV`: `development` or `production`

## Development

(uses `supervisor`)

```bash
npm install               # install dependencies
nohup mongod &            # start local mongoDB
npm run-script start-dev  # watch server and client code

```

## "Production"

Super beta.

```bash
npm start  # (should probably run with `forever`)

```

Fully Heroku/[Foreman](http://ddollar.github.io/foreman/) compatible.

## Scripts

- `npm run-script create-admin`: creates an admin user (ideal for first-time setup; exposed in `Procfile` as `setup` task). set the initial username and pw with environment variables `ADMIN_USERNAME` and `ADMIN_PASSWORD` (default `administrator` / `12345`). can always change these later through the web frontend or API. before running, make sure the database is on and configured

## TODO

Major items are [tracked as Github issues](https://github.com/jaredmcdonald/message-board/issues) but there are also `TODO` comments scattered throughout the code.
