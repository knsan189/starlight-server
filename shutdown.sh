#!/bin/bash

pgrep starlight-server | xargs kill

echo "Server Off"

exit 0
