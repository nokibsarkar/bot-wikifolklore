CURRENT_PATH=$(pwd)
FRONTEND_DIR=frontend
BUILD_DIR=build
STATIC_DIR=static
FRONTEND_PATH=$CURRENT_PATH/$FRONTEND_DIR
BUILD_PATH=$FRONTEND_DIR/$BUILD_DIR
TARGET_STATIC_PATH=$CURRENT_PATH/$STATIC_DIR
SOURCE_STATIC_PATH=$FRONTEND_PATH/$BUILD_DIR/$STATIC_DIR
 # Go to frontend directory
cd $FRONTEND_PATH
# Build frontend
npm run build
# empty the static directory
if [ ! -d "$TARGET_STATIC_PATH" ]; then
    mkdir $TARGET_STATIC_PATH
fi
rm -rf $TARGET_STATIC_PATH/*
# Move the build static files to static directory
mv $SOURCE_STATIC_PATH/* $TARGET_STATIC_PATH
rm -rf $SOURCE_STATIC_PATH
# Move all the files from frontend/build to static directory
echo "mv $BUILD_PATH/* $TARGET_STATIC_PATH"
mv $BUILD_PATH/* $TARGET_STATIC_PATH
cd $CURRENT_PATH
# Move the 
echo "Build completed"