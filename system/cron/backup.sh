#!/bin/bash
# This script leaves /nudgepad/sites perfectly in place and creates copy
# of it in /nudgepad/backup, excluding sub git repos, logs, and temp for
# efficiency reasons.
sudo rsync -a /nudgepad/sites /nudgepad/backup --exclude=".git/*" --exclude=".git" --exclude="logs/*" --exclude="temp" --exclude="temp/*" --exclude="temp"
