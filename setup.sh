# Create an user and a group for the appllication
USERNAME=listgen
GROUP=nokib-tool
VENV=venv
SERVER_HOST=tools.wikilovesfolklore.org
GITHUB_REPO="https://github.com/nokibsarkar/bot-wikifolklore"
LOCAL_CLONED_DIR="listgen"
CLONED_DIR="/home/$USERNAME/$LOCAL_CLONED_DIR"
SERVICE_FILE_NAME="gunicorn.service"
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

cat > $SERVICE_FILE_NAME << EOF
[Unit]
Description=Gunicorn instance to serve $USERNAME
After=network.target

[Service]
User=$USERNAME
WorkingDirectory=$CLONED_DIR
ExectStartPre="source $CLONED_DIR/$VENV/bin/activate"
ExecStart=gunicorn --config gunicorn_config.py app:app
[Install]
WantedBy=multi-user.target
EOF
echo "Service file created"
echo "Moving the service file to /etc/systemd/system/"
sudo mv $SERVICE_FILE_NAME /etc/systemd/system/$SERVICE_FILE_NAME
echo "Service file moved"
echo "Changing the permission of the service file"
sudo chmod 666 /etc/systemd/system/$SERVICE_FILE_NAME
echo "Permission changed"

# Add nginx configuration
echo "Adding nginx configuration"
sudo touch /etc/nginx/sites-available/$USERNAME.conf
sudo cp nginx.conf /etc/nginx/sites-available/$USERNAME.conf
sudo chmod 666 /etc/nginx/sites-available/$USERNAME.conf
sudo ln -s /etc/nginx/sites-enabled /etc/nginx/sites-available/$USERNAME.conf

# Enable the service
echo "Enabling the service"
sudo systemctl start $SERVICE_FILE_NAME
sudo systemctl enable $SERVICE_FILE_NAME
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl daemon-reload
