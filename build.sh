CURRENT_PATH=$(pwd)
FRONTEND_DIR=frontend
BUILD_DIR=build
STATIC_DIR=static
INITIAL_STATIC_FOLDER=$CURRENT_PATH/static_init
LANDING_PAGE_PATH=$CURRENT_PATH/landing_page
LANDING_PAGE_STATIC_PATH=$LANDING_PAGE_PATH/src/static
LANDING_PAGE_TEMPATE_PATH=$LANDING_PAGE_PATH/src/index.html
FRONTEND_PATH=$CURRENT_PATH/$FRONTEND_DIR
FRONTEND_PUBLIC_PATH=$FRONTEND_PATH/public
BUILD_PATH=$FRONTEND_PATH/$BUILD_DIR
TARGET_TEMPLATE_PATH=$CURRENT_PATH/templates
TARGET_STATIC_PATH=$CURRENT_PATH/$STATIC_DIR
SOURCE_STATIC_PATH=$FRONTEND_PATH/$BUILD_DIR/$STATIC_DIR
# Build landing page
echo "Building landing page"
cd $LANDING_PAGE_PATH
npm run build
# Move the build static files to static directory
cp -rf $LANDING_PAGE_STATIC_PATH/* $FRONTEND_PUBLIC_PATH
cp -f $LANDING_PAGE_TEMPATE_PATH $TARGET_TEMPLATE_PATH
 # Go to frontend directory
cd $FRONTEND_PATH
# Build frontend
npm run build
# empty the static directory
if [ ! -d "$TARGET_STATIC_PATH" ]; then
    mkdir $TARGET_STATIC_PATH
fi
rm -rf $TARGET_STATIC_PATH/*
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