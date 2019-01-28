let bReady = false;
let colWarLeftSonar = undefined;
let colWarRightSonar = undefined;
let colWarFrontSonar = undefined;

function updateHTMLContent(data) {
  if (!bReady) return;
  document.getElementById("height").innerHTML = data.height.toString();
  colWarFrontSonar.style.fill = data.frontSonarColor;
  colWarLeftSonar.style.fill = data.leftSonarColor;
  colWarRightSonar.style.fill = data.rightSonarColor;
}

setInterval(function() {
fetch('/flightVars')
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      //console.log(JSON.stringify(myJson));
      updateHTMLContent(myJson);
    });
}, 10);

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

function doOnReady() {
  colWarLeftSonar = document.querySelector("#colWarLeftSonar").getSVGDocument().getElementById("path78");
  colWarRightSonar = document.querySelector("#colWarRightSonar").getSVGDocument().getElementById("path78");
  colWarFrontSonar = document.querySelector("#colWarFrontSonar").getSVGDocument().getElementById("path78");
  bReady = true;
}
