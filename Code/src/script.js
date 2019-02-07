//Jan 23: not sure how the data will look when piped off MAV. Best guess for now, feel free to change.
//Jan 23: X is forward/back, Y is SidetoSide, Z is verticle. Is there a standard in flight?
//Jan 23: for sonic sensors, naming orientation is as if you were a pilot in a helicopter
//Jan 23: trying to get everything, even things we might not need
//Jan 23: Set all vars to 1 to test that object is updated correctly after fetch
let flightVars = {
  speedMag: 1, speedX: 1, speedY: 1, speedZ: 1, accelX: 1, accelY: 1, accelZ: 1, pitchChange: 1, rollChange: 1,
  orientationPitch: 1, orientationRoll: 1, height: 1, ledsON: 1, speakerON: 1
}

let bReady = false;
let colWarLeftSonar = undefined;
let colWarRightSonar = undefined;
let colWarFrontSonar = undefined;

function updateHTMLContent(data) {
  if (!bReady) return;

  if (data.height !== undefined) {
    document.getElementById("height").innerHTML = data.height.toString();
  }

  if (data.speed !== undefined) {
    document.getElementById("speed").innerHTML = data.speed.toString();
  }
  else {
    document.getElementById("speed").innerHTML = "NONE";
  }

  colWarFrontSonar.style.fill = data.frontSonarColor;
  colWarLeftSonar.style.fill = data.leftSonarColor;
  colWarRightSonar.style.fill = data.rightSonarColor;
}

function updateVideoSource(ip) {
  document.getElementById("bottomFeed").src = "http://" + ip + ":8080/?action=stream";
}

let interval_id1 = setInterval(function () {
  fetch('/flightVars')
    .then((response) => response.json())
    .then((data) => {
      updateHTMLContent(data)

      //Jan 23: test to make sure local flightVars object is updated correctly after fetch
      flightVars = data;
    })
    .catch(err => console.error(err));

}, 10);


// Call this fetch to update IP address
let interval_id2 = setInterval(function () {
  fetch('/raspberryIP')
    .then((response) => response.text())
    .then((ip) => {
      console.log(ip);
      if (ip === "") return;
      updateVideoSource(ip);

      // We only need to update source once.
      clearInterval(interval_id2);
      interval_id2 = undefined;
    })
    .catch(err => console.error(err));
}, 500)

//For switching between the depth map and bottom camera feed
var switchBottomView = document.getElementsByClassName("BottomFeed");
var switchDepthMap = document.getElementsByClassName("DepthMap");

document.addEventListener("keyup", function (event) {
  // Cancel the default action, if needed
  event.preventDefault();
  if (event.keyCode === 32) {
    console.log("PICKUP MODE");
    switchBottomView[0].style.display = "none";
    switchDepthMap[0].style.display = "block";
  }
  if (event.keyCode === 13) {
    console.log("DEPTH-MAP MODE");
    switchBottomView[0].style.display = "block";
    switchDepthMap[0].style.display = "none";
  }
});

function doOnReady() {
  switchBottomView[0].style.display = "none";
  switchDepthMap[0].style.display = "block";

  colWarLeftSonar = document.querySelector("#colWarLeftSonar").getSVGDocument().getElementById("path78");
  colWarRightSonar = document.querySelector("#colWarRightSonar").getSVGDocument().getElementById("path78");
  colWarFrontSonar = document.querySelector("#colWarFrontSonar").getSVGDocument().getElementById("path78");
  bReady = true;
}
