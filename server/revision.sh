#! /bin/bash
cd /var/www/
echo "{\"now_Version_Git_SHA_Num\":\"$1\"}" > /usr/share/nginx/html/ver.json
pm2 stop all
pm2 delete all
rm -rf unmanned-car
git clone https://github.com/Andrewyg/unmanned-car.git
cd unmanned-car
git reset $1 --hard
npm i
pm2 start app.js
pm2 save