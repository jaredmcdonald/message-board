#!/bin/bash

LOG_DIR="log"
SERVER_LOG="$LOG_DIR/server.log"
GULP_LOG="$LOG_DIR/gulp.log"
NEWLINE=""
ARROW="===>"

# commands to be echoed and executed
GULP_COMMAND="nohup gulp watch > $GULP_LOG &"
SERVER_COMMAND="nohup supervisor -w dist bin/www > $SERVER_LOG &"
TAIL_COMMAND="tail -f $SERVER_LOG $GULP_LOG"

# ensure logs exist
mkdir -p $LOG_DIR
touch $SERVER_LOG $GULP_LOG

# ensure `supervisor` is installed
if ! hash supervisor 2>/dev/null; then
  echo "Error: missing global dependency \`supervisor\`"
  echo "Install with \`npm install -g supervisor\`"
  echo "Aborting..."
  exit 1
fi

# ensure `gulp` is installed
if ! hash gulp 2>/dev/null; then
  echo "Error: missing global dependency \`gulp\`"
  echo "Install with \`npm install -g gulp\`"
  echo "Aborting..."
  exit 1
fi

echo $NEWLINE
echo "Watching source files for changes and sending output to $GULP_LOG..."
echo $ARROW $GULP_COMMAND
eval $GULP_COMMAND

echo $NEWLINE
echo "Starting server with supervisor and sending output to $SERVER_LOG..."
echo $ARROW $SERVER_COMMAND
eval $SERVER_COMMAND

echo $NEWLINE
echo "Tailing $SERVER_LOG and $GULP_LOG..."
echo $ARROW $TAIL_COMMAND
echo "(exit: ^C)"
echo $NEWLINE
eval $TAIL_COMMAND
