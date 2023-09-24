# Create an user and a group for the appllication
USERNAME=listgen
GROUP=nokib-tool
VENV=nokib-tool
SERVER_HOST=tools.wikilovesfolklore.org
GITHUB_REPO="https://github.com/nokibsarkar/bot-wikifolklore"
LOCAL_CLONED_DIR="listgen"
sudo groupadd $GROUP
sudo useradd -g $GROUP $USERNAME -s /bin/bash -m -d /home/$USERNAME
echo "Please enter the password for the user $USERNAME"
sudo passwd $USERNAME


su - $USERNAME << EOF
# Clone the repository
echo "Cloning the repository"
git clone $GITHUB_REPO $LOCAL_CLONED_DIR
# Create a virtual environment
python3 -m venv $VENV
source $VENV/bin/activate
pip install wheel
cd $LOCAL_CLONED_DIR
pip install -r requirements.txt
deactivate
EOF

# create a service file
echo "Creating a service file"
sudo touch /etc/systemd/system/$USERNAME.service
sudo chmod 666 /etc/systemd/system/$USERNAME.service
sudo cat > gunicorn.service << EOF
[Unit]
Description=Gunicorn instance to serve $USERNAME
After=network.target

[Service]
User=$USERNAME
Group=$GROUP
WorkingDirectory=/home/$USERNAME/$CLONED_DIR
Environment="PATH=/home/$USERNAME/$CLONED_DIR/$VENV/bin"
ExecStart=/home/$USERNAME/$CLONED_DIR/$VENV/bin/gunicorn --config gunicorn_config.py app:app
[Install]
WantedBy=multi-user.target
EOF

# Add nginx configuration
echo "Adding nginx configuration"
sudo touch /etc/nginx/sites-available/$USERNAME
sudo cp nginx.conf /etc/nginx/sites-available/$USERNAME
sudo chmod 666 /etc/nginx/sites-available/$USERNAME
sudo ln -s  /etc/nginx/sites-enabled /etc/nginx/sites-available/$USERNAME

# # Enable the service
# echo "Enabling the service"
# sudo systemctl start $USERNAME
# sudo systemctl enable $USERNAME
# sudo nginx -t
# sudo systemctl restart nginx
# sudo systemctl daemon-reload
