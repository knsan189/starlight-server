#!/bin/bash

npm run build && 
nohup npm run start &&
echo "Server on"

exit 0
