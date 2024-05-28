#!/bin/bash

PID=$1
INTERVAL=$2
OUTPUT_FILE=$3

if [ -z "$PID" ] || [ -z "$INTERVAL" ] || [ -z "$OUTPUT_FILE" ]; then
	echo "Usage: $0 <PID> <INTERVAL> <OUTPUT_FILE>"
	exit 1
fi

# Write the CSV header
echo "Timestamp,CPU(%),Memory(%),Command" > $OUTPUT_FILE

while true; do
	TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S.%3N")
	USAGE=$(ps -p $PID -o %cpu,%mem,cmd --no-headers)
	echo "$TIMESTAMP,$USAGE" >> $OUTPUT_FILE
	sleep $INTERVAL
done

