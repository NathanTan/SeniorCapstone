fetch('/flightVars')
    .then(function (response) {
        return response.json();
    })
    .then(function (myJson) {
        console.log(JSON.stringify(myJson));
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
