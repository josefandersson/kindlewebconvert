#!/bin/bash

# Taken from DigitalOcean - https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04

apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

apt update

apt install -y mongodb-org

echo "[Unit]
Description=High-performance, schema-free document-oriented database
After=network.target

[Service]
User=mongodb
ExecStart=/usr/bin/mongod --quiet --config /etc/mongod.conf

[Install]
WantedBy=multi-user.target" >> /etc/systemd/system/mongodb.service

systemctl enable mongodb

systemctl start mongodb

systemctl status mongodb
