TEMP_DIR="$1"
CMD="$2"
if [ -z "$TEMP_DIR" ]; then
    echo "Please provide a temp directory name"
    exit 1
fi
echo "Temp directory: $TEMP_DIR"
echo "Command : $2"
if [ -z "$CMD" ]; then
    echo "Please provide a command: setup, landing_page, frontend , package, all"
    exit 1
fi
CURRENT_PATH=$(pwd)
TEMP_PATH=$CURRENT_PATH/$TEMP_DIR
STATIC_DIR=static
FRONTEND_DIR=frontend
FRONTEND_PATH=$CURRENT_PATH/$FRONTEND_DIR
TARGET_TEMPLATE_PATH=$CURRENT_PATH/templates
TARGET_STATIC_PATH=$CURRENT_PATH/$STATIC_DIR
setup (){
    # empty the static directory
    if [ ! -d "$TARGET_STATIC_PATH" ]; then
        mkdir $TARGET_STATIC_PATH
    fi
    rm -rf $TARGET_STATIC_PATH/*
}
build_landing_page (){
    LANDING_PAGE_PATH=$CURRENT_PATH/landing_page
    LANDING_PAGE_SRC_PATH=$LANDING_PAGE_PATH/src
    LANDING_PAGE_STATIC_PATH=$LANDING_PAGE_SRC_PATH/static
    LANDING_PAGE_TEMPATE_PATH=$LANDING_PAGE_SRC_PATH/index.html
    # Build landing page
    echo "Building landing page"
    cd $LANDING_PAGE_PATH
    npm run build
    # Move the build static files to static directory
    cp -rf $LANDING_PAGE_STATIC_PATH/* $TARGET_STATIC_PATH
    rm -rf $LANDING_PAGE_STATIC_PATH
    cp -f $LANDING_PAGE_SRC_PATH/*.html $TARGET_TEMPLATE_PATH
    cd $CURRENT_PATH
    echo '  Landing page build completed'
}
build_frontend (){
    
    BUILD_DIR=build
    INITIAL_STATIC_FOLDER=$CURRENT_PATH/static_init
    
    FRONTEND_PUBLIC_PATH=$FRONTEND_PATH/public
    BUILD_PATH=$FRONTEND_PATH/$BUILD_DIR
    TARGET_TEMPLATE_PATH=$CURRENT_PATH/templates
    TARGET_STATIC_PATH=$CURRENT_PATH/$STATIC_DIR
    SOURCE_STATIC_PATH=$FRONTEND_PATH/$BUILD_DIR/$STATIC_DIR
    echo "Building Frontend"
    # Go to frontend directory
    cd $FRONTEND_PATH
    # Build frontend
    npm run build
    
    if [ -d "$INITIAL_STATIC_FOLDER" ]; then
        cp -r $INITIAL_STATIC_FOLDER/* $TARGET_STATIC_PATH
    fi
    # Move the build static files to static directory
    mv $SOURCE_STATIC_PATH/* $TARGET_STATIC_PATH
    if [ -d "$INITIAL_STATIC_FOLDER" ]; then
        cp -r $INITIAL_STATIC_FOLDER/* $TARGET_STATIC_PATH
    fi
    rm -rf $SOURCE_STATIC_PATH
    # Move all the files from frontend/build to static directory
    mv -f $BUILD_PATH/* $TARGET_STATIC_PATH
    cd $CURRENT_PATH
    # Move the 
    echo "Build completed"
}
package () {
    if [ -d "$TEMP_PATH" ]; then
        echo "Removing old temp folder"
        rm -rf $TEMP_PATH
        echo '  Creating new temp folder'
        mkdir $TEMP_PATH
    fi

    echo "Copying all the python files"
    cp *.py  $TEMP_PATH
    echo "Copying static folder"
    cp -r static $TEMP_PATH
    echo "Copying templates folder"
    cp -r $TARGET_TEMPLATE_PATH $TEMP_PATH
    echo "Copying schema folder"
    cp -r schema $TEMP_PATH
    echo "Copying requirements.txt"
    cp requirements.txt $TEMP_PATH
    # echo "Copying Bash scripts"
    # cp *.sh $TEMP_PATH
    echo "Copying .env"
    cp production.env $TEMP_PATH/.env
    echo "Copying VERSION"
    cp VERSION $TEMP_PATH
    echo "Packaging done"
}
if [ "$CMD" == "setup" ]; then
    setup
elif [ "$CMD" == "landing_page" ]; then
    build_landing_page
elif [ "$CMD" == "frontend" ]; then
    build_frontend
elif [ "$CMD" == "package" ]; then
    package
elif [ "$CMD" == "all" ]; then
    setup
    build_landing_page
    build_frontend
    package
else
    echo "Please provide a command: setup, landing_page, frontend , package, all"
fi

