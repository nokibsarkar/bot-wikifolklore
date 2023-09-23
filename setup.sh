# Create an user and a group for the appllication
USERNAME=nokib
GROUP=nokib-tool
VENV=nokib-tool
SERVER_HOST=tools.wikilovesfolklore.org
sudo groupadd $GROUP
sudo useradd -g $GROUP $USERNAME -s /bin/bash -m -d /home/$USERNAME
echo "Please enter the password for the user $USERNAME"
sudo passwd $USERNAME

sudo apt-get install python3-pip python3-dev

su - $USERNAME << EOF
# Create a virtual environment
python3 -m venv $VENV
source $VENV/bin/activate
pip install wheel
pip install -r requirements.txt
deactivate
EOF

# create a service file
echo "Creating a service file"
sudo touch /etc/systemd/system/nokib-tool.service
sudo chmod 666 /etc/systemd/system/nokib-tool.service
sudo cat > gunicorn.service << EOF
[Unit]
Description=Gunicorn instance to serve nokib-tool
After=network.target

[Service]
User=$USERNAME
Group=$GROUP
WorkingDirectory=/home/$USERNAME/nokib-tool
Environment="PATH=/home/$USERNAME/nokib-tool/$VENV/bin"
ExecStart=/home/$USERNAME/nokib-tool/$VENV/bin/gunicorn --config gunicorn_config.py app:app

[Install]
WantedBy=multi-user.target
EOF

# Add nginx configuration
echo "Adding nginx configuration"
sudo touch /etc/nginx/sites-available/nokib-tool
sudo chmod 666 /etc/nginx/sites-available/nokib-tool
sudo cat > /etc/nginx/sites-available/nokib-tool << EOF
server {
    listen 80;
    server_name $SERVER_HOST;
    location / {
        include proxy_params;
        proxy_pass http://unix:/home/$USERNAME/nokib-tool/nokib-tool.sock;
    }
}
EOF

# Enable the service
echo "Enabling the service"
sudo systemctl start nokib-tool
sudo systemctl enable nokib-tool
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl daemon-reload
