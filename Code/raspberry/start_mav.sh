export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

# Launch connector
cd $SCRIPTPATH
python connect.py &
echo $! > spawned-processes

# Stream bottom feed
cd "./mjpg-streamer/mjpg-streamer-experimental/"
./mjpg_streamer -o "output_http.so -w ./www -p 8080" -i "input_raspicam.so -x 640 -y 480 -fps 30" &
cd $SCRIPTPATH
echo $! >> spawned-processes

# Stream front feed
#cd "./mjpg-streamer/mjpg-streamer-experimental/"
#./mjpg_streamer -o "output_http.so -w ./www -p 8081" -i "input_uvc.so -d /dev/v4l/by-id/usb-SunplusIT_Inc_HBV_3D_camera-video-index0 -r 1280x480 -f 30" &
#cd $SCRIPTPATH
#echo $! >> spawned-processes
