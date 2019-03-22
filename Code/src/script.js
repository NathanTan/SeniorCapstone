(function($) {
    function FlightIndicator( placeholder, type, options ) {
        // Initial configuration
        var attitude = this;
        var settings = $.extend({
            size : 200,
            roll : 0,
            pitch : 0,
            turn : 0,
            heading: 0,
            vario: 0,
            airspeed: 0,
            altitude: 0,
            pressure: 1000,
            showBox : true,
            img_directory : 'img/'
        }, options );

        var constants = {
            pitch_bound:30,
            vario_bound : 1.95,
            airspeed_bound_l : 0,
            airspeed_bound_h : 160
        }

        // Creation of the instrument
        placeholder.each(function(){
            switch(type){
                case 'heading':
                    $(this).html('<div class="instrument heading"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><div class="heading box"><img src="' + settings.img_directory + 'heading_yaw.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'heading_mechanics.svg" class="box" alt="" /><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
                    _setHeading(settings.heading);
                break;
                case 'variometer':
                    $(this).html('<div class="instrument vario"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><img src="' + settings.img_directory + 'vertical_mechanics.svg" class="box" alt="" /><div class="vario box"><img src="' + settings.img_directory + 'fi_needle.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
                    _setVario(settings.vario);
                break;
                case 'turn_coordinator':
                    $(this).html('<div class="instrument turn_coordinator"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><img src="' + settings.img_directory + 'turn_coordinator.svg" class="box" alt="" /><div class="turn box"><img src="' + settings.img_directory + 'fi_tc_airplane.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
                    _setTurn(settings.turn);
                break;
                case 'airspeed':
                    $(this).html('<div class="instrument airspeed"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><img src="' + settings.img_directory + 'speed_mechanics.svg" class="box" alt="" /><div class="speed box"><img src="' + settings.img_directory + 'fi_needle.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
                    _setAirSpeed(settings.airspeed);
                break
                case 'altimeter':
                    $(this).html('<div class="instrument altimeter"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><div class="pressure box"><img src="' + settings.img_directory + 'altitude_pressure.svg" class="box" alt="" /></div><img src="' + settings.img_directory + 'altitude_ticks.svg" class="box" alt="" /><div class="needleSmall box"><img src="' + settings.img_directory + 'fi_needle_small.svg" class="box" alt="" /></div><div class="needle box"><img src="' + settings.img_directory + 'fi_needle.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
                    _setAltitude(settings.altitude);
                    _setPressure(settings.pressure);
                break;
                default:
                    $(this).html('<div class="instrument attitude"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><div class="roll box"><img src="' + settings.img_directory + 'horizon_back.svg" class="box" alt="" /><div class="pitch box"><img src="' + settings.img_directory + 'horizon_ball.svg" class="box" alt="" /></div><img src="' + settings.img_directory + 'horizon_circle.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'horizon_mechanics.svg" class="box" alt="" /><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
                    _setRoll(settings.roll);
                    _setPitch(settings.pitch);
            }
            $(this).find('div.instrument').css({height : settings.size, width : settings.size});
            $(this).find('div.instrument img.box.background').toggle(settings.showBox);
        });

        // Private methods
        function _setRoll(roll){
            placeholder.each(function(){
                $(this).find('div.instrument.attitude div.roll').css('transform', 'rotate('+roll+'deg)');
            });
        }

        function _setPitch(pitch){
            // alert(pitch);
            if(pitch>constants.pitch_bound){pitch = constants.pitch_bound;}
            else if(pitch<-constants.pitch_bound){pitch = -constants.pitch_bound;}
            placeholder.each(function(){
                $(this).find('div.instrument.attitude div.roll div.pitch').css('top', pitch*0.7 + '%');
            });
        }

        function _setHeading(heading){
            placeholder.each(function(){
                $(this).find('div.instrument.heading div.heading').css('transform', 'rotate(' + -heading + 'deg)');
            });
        }

        function _setTurn(turn){
            placeholder.each(function(){
                $(this).find('div.instrument.turn_coordinator div.turn').css('transform', 'rotate('+turn+'deg)');
            });
        }

        function _setVario(vario){
            if(vario > constants.vario_bound){vario = constants.vario_bound;}
            else if(vario < -constants.vario_bound){vario = -constants.vario_bound;}
            vario = vario*90;
            placeholder.each(function(){
                $(this).find('div.instrument.vario div.vario').css('transform', 'rotate(' + vario + 'deg)');
            });
        }

        function _setAirSpeed(speed){
            if(speed > constants.airspeed_bound_h){speed = constants.airspeed_bound_h;}
            else if(speed < constants.airspeed_bound_l){speed = constants.airspeed_bound_l;}
            speed = 90+speed*2;
            placeholder.each(function(){
                $(this).find('div.instrument.airspeed div.speed').css('transform', 'rotate(' + speed + 'deg)');
            });
        }

        function _setAltitude(altitude){
            var needle = 90 + altitude%1000 * 360 / 1000;
            var needleSmall = altitude / 10000 * 360;
            placeholder.each(function(){
                $(this).find('div.instrument.altimeter div.needle').css('transform', 'rotate(' + needle + 'deg)');
                $(this).find('div.instrument.altimeter div.needleSmall').css('transform', 'rotate(' + needleSmall + 'deg)');
            });
        }

        function _setPressure(pressure){
            pressure = 2*pressure - 1980;
            placeholder.each(function(){
                $(this).find('div.instrument.altimeter div.pressure').css('transform', 'rotate(' + pressure + 'deg)');
            });
        }

        function _resize(size){
            placeholder.each(function(){
                $(this).find('div.instrument').css({height : size, width : size});
            });
        }

        function _showBox(){
            placeholder.each(function(){
                $(this).find('img.box.background').show();
            });
        }

        function _hideBox(){
            placeholder.each(function(){
                $(this).find('img.box.background').hide();
            });
        }

        // Public methods
        this.setRoll = function(roll){_setRoll(roll);}
        this.setPitch = function(pitch){_setPitch(pitch);}
        this.setHeading = function(heading){_setHeading(heading);}
        this.setTurn = function(turn){_setTurn(turn);}
        this.setVario = function(vario){_setVario(vario);}
        this.setAirSpeed = function(speed){_setAirSpeed(speed);}
        this.setAltitude = function(altitude){_setAltitude(altitude);}
        this.setPressure = function(pressure){_setPressure(pressure);}
        this.resize = function(size){_resize(size);}
        this.showBox = function(){_showBox();}
        this.hideBox = function(){_hideBox();}

        return attitude;
    };

    // Extension to jQuery
    $.flightIndicator = function(placeholder, type, options){
        var flightIndicator = new FlightIndicator($(placeholder), type, options)
        return flightIndicator;
    }

    $.fn.flightIndicator = function(data, type, options){
        return this.each(function(){
            $.flightIndicator(this, type, options);
        });
    }
}( jQuery ));

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

  if (typeof(data.bottomSonarRange) === "number") {
    //let h = (data.bottomSonarRange * 0.0254).toFixed(2);
    let h = (data.bottomSonarRange * 1.0).toFixed(2);
    document.getElementById("bottomSonarRange").innerHTML = h.toString() + " in";
  }
  else {
    document.getElementById("bottomSonarRange").innerHTML = "UNKNOWN";
  }

  if (typeof(data.speed) === "number") {
    let s = parseFloat(data.speed).toFixed(2);
    document.getElementById("speed").innerHTML = s.toString() + " m/s";
  }
  else {
    document.getElementById("speed").innerHTML = "UNKNOWN";
  }

  colWarFrontSonar.style.fill = data.frontSonarColor;
  colWarLeftSonar.style.fill = data.leftSonarColor;
  colWarRightSonar.style.fill = data.rightSonarColor;
}

function updateVideoSource(ip) {
  document.getElementById("bottomFeed").src = "http://" + ip + ":8080/?action=stream";
  document.getElementById("frontFeed").src = "http://" + ip + ":8081/?action=stream";
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
