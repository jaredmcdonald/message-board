# Express Board

Hacker News-inspired message board, written in express.

## Prerequisites

- `mongodb` (`brew install mongodb`)
- `gulp` (`npm install -g gulp`)
- `supervisor` (`npm install -g supervisor`)

## Development

(uses `supervisor`)

```bash
npm install               # install dependencies
nohup mongod &            # start local mongoDB
npm run-script start-dev  # watch server and client code

```

## "Production"

Super beta.

### Environment variables

- `SECRET`: express session secret
- `PORT`: for HTTP
- `MONGODB_HOST`: hostname for mongodb

Then:

```bash
node node_modules/gulp/bin/gulp.js  # compilation step (if you have
                                    # gulp globally, just `gulp`)
npm start                           # start server (should probably run
                                    # with `forever`)
```

## TODO

Major items are [tracked as Github issues](https://github.com/jaredmcdonald/message-board/issues) but there are also `TODO` comments scattered throughout the code.
