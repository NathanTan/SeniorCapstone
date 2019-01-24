//Jan 23: not sure how the data will look when piped off MAV. Best guess for now, feel free to change.
//Jan 23: X is forward/back, Y is SidetoSide, Z is verticle. Is there a standard in flight?
//Jan 23: for sonic sensors, naming orientation is as if you were a pilot in a helicopter
//Jan 23: trying to get everything, even things we might not need 
//Jan 23: Set all vars to 1 to test that object is updated correctly after fetch
let flightVars = {speedMag:1, speedX:1, speedY:1, speedZ:1, accelX:1, accelY:1, accelZ:1, pitchChange:1, rollChange:1,
  orientationPitch:1, orientationRoll:1, height:1, ledsON:1, speakerON:1}

  //Jan 23: test to make sure local flightVars object is updated correctly after fetch
console.log(flightVars);
fetch('/flightVars')
    .then(function (response) {
        return response.json();
    })
    .then(function (myJson) {
        flightVars=myJson;
        return myJson;
    })
    .then(function (myJson) {
        console.log(JSON.stringify(myJson));
        console.log(flightVars);
    });

//For switching between the depth map and bottom camera feed
var switchBottomView = document.getElementsByClassName("BottomFeed");
var switchDepthMap = document.getElementsByClassName("DepthMap");

console.log(switchBottomView)
//switchBottomView[0].style.display = "none";
//switchDepthMap[0].style.display = "block";

document.addEventListener("keyup", function(event) {
  // Cancel the default action, if needed
  event.preventDefault();
  if (event.keyCode === 32) {
    console.log("PICKUP MODE");
    switchBottomView[0].style.display = "none";
    switchDepthMap[0].style.display = "block";
  }
  if (event.keyCode === 13) {
    console.log("PICKUP MODE");
    switchBottomView[0].style.display = "block";
    switchDepthMap[0].style.display = "none";
  }
});
