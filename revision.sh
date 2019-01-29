#! /bin/bash

if [ $EUID != 0 ]; then
    sudo "$0" "$@"
    exit $?
fi

cd ~
sudo pm2 stop all
sudo rm -rf ~/unmanned-car
git clone https://github.com/Andrewyg/unmanned-car.git
cd unmanned-car
git reset $1 --hard
npm i
sudo pm2 start app.js
sudo pm2 save