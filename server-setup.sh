#! /bin/bash

if [ $EUID != 0 ]; then
    sudo "$0" "$@"
    exit $?
fi

sudo yum update -y
sudo yum upgrade -y

sudo yum install wget -y

wget http://nodejs.org/dist/v0.10.30/node-v0.10.30-linux-x64.tar.gz
sudo tar --strip-components 1 -xzvf node-v* -C /usr/local
sudo ln -s /usr/local/bin/node /usr/bin/node
sudo ln -s /usr/local/lib/node /usr/lib/node
sudo ln -s /usr/local/bin/npm /usr/bin/npm
sudo ln -s /usr/local/bin/node-waf /usr/bin/node-waf

sudo yum install git -y

echo "[mongodb-org-4.0]" | sudo tee --append /etc/yum.repos.d/mongodb-org-4.0.repo > /dev/null
echo "name=MongoDB Repository" | sudo tee --append /etc/yum.repos.d/mongodb-org-4.0.repo > /dev/null
echo "baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.0/x86_64/" | sudo tee --append /etc/yum.repos.d/mongodb-org-4.0.repo > /dev/null
echo "gpgcheck=1" | sudo tee --append /etc/yum.repos.d/mongodb-org-4.0.repo > /dev/null
echo "enabled=1" | sudo tee --append /etc/yum.repos.d/mongodb-org-4.0.repo > /dev/null
echo "gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc" | sudo tee --append /etc/yum.repos.d/mongodb-org-4.0.repo > /dev/null
sudo yum install -y mongodb-org
sudo service mongod start
sudo chkconfig mongod on

cd ~
sudo npm i pm2@latest -g
sudo pm2 startup systemd

sudo -i
yum install openssh openssh-server -y
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.orig
sed -i -e 's/Port 22/Port 3007/g' /etc/ssh/sshd_config
sed -i -e 's/AllowUsers/AllowUsers uc/g' /etc/ssh/sshd_config
sed -i -e 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
sed -i -e 's/Protocol 1/Protocol 2/g' /etc/ssh/sshd_config
systemctl restart sshd.service
systemctl enable sshd.service
semanage port -a -t ssh_port_t -p tcp 3007
firewall-cmd --permanent --zone=public --add-port=3007/tcp
firewall-cmd --reload
exit