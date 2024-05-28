#!/bin/bash

start=$(date +%s.%N)
start_timestamp=$(date +"%Y-%m-%d %H:%M:%S.%3N")

# Your code or command to measure
node test-POST.js

end=$(date +%s.%N)
end_timestamp=$(date +"%Y-%m-%d %H:%M:%S.%3N")
runtime=$(echo "$end - $start" | bc)


echo "Execution time: $runtime seconds"
echo "start time: $start_timestamp"
echo "end time: $end_timestamp"
