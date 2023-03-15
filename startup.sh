#!/bin/bash

npm run build && 
nohup npm run start &
echo "Sever on"

exit 0
