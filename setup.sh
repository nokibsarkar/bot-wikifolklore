# Create an user and a group for the appllication
USERNAME=listgen
GROUP=nokib-tool
VENV=venv
VENV_DIR="/home/$USERNAME/$VENV"
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
python3 -m venv $VENV_DIR
source $VENV_DIR/bin/activate
pip install wheel
cd $LOCAL_CLONED_DIR
pip install -r requirements.txt
deactivate
EOF
sudo chown -R $USERNAME:$GROUP $CLONED_DIR
# create a service file
echo "Creating a service file"

cat > $SERVICE_FILE_NAME << EOF
[Unit]
Description=Gunicorn instance to serve $USERNAME
After=network.target

[Service]
User=$USERNAME
WorkingDirectory=$CLONED_DIR
ExectStartPre="source $VENV_DIR/bin/activate"
ExecStart=$VENV_DIR/bin/gunicorn --config $CLONED_DIR/gunicorn.conf.py app:app
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
sudo cp nginx.conf /etc/nginx/sites-available/$USERNAME.conf
sudo chmod 666 /etc/nginx/sites-available/$USERNAME.conf
sudo rm /etc/nginx/sites-enabled/*
sudo ln -s /etc/nginx/sites-available/$USERNAME.conf /etc/nginx/sites-enabled 

# Enable the service
echo "Enabling the service"
sudo systemctl daemon-reload
sudo systemctl start $SERVICE_FILE_NAME
sudo systemctl enable $SERVICE_FILE_NAME
sudo nginx -t
sudo systemctl restart nginx
