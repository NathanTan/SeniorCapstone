// -----------------------------------------------------------------------------
//  Constants
// -----------------------------------------------------------------------------

// Range sensor data ranges between 15.2 cm (6") and 645 cm (254")
const SONAR_MIN = 6.0;
const SONAR_MAX = 254.0;

// Sonar color ranges (RGB)
const SONAR_COLORS = [
    [255, 0, 0], // closest
    [255, 255, 0],
    [0, 255, 0], // farthest
];

// Start as take of, hover, change height, land
// { time (sec) => height (in) }
const HEIGHT_VALUES = {
    0.0 : SONAR_MIN,
    2.0 : 50,
    4.0 : 16,
    5.0 : 50,
    10.0 : 200,
    20.0 : 230,
    22.0 : SONAR_MAX,
    30.0 : 30,
    33.0 : SONAR_MIN
};

// Attidute: from -90 (clockwise) to 90 (counter-clockwise) degrees
// { time (sec) => tilt (deg) }
const ATTITUDE_VALUES = {
    0.0 : 0,
    1.0 : 10,
    2.0 : -10,
    3.0 : -70,
    4.0 : -30,
    5.0 : 0,
    7.0 : -70,
    10.0 : 0,
    11.0 : -5,
    12.0 : 3,
    12.4 : 0
};

// Forward tilt: from -45 (clockwise) to 45 (counter-clockwise) degrees
// { time (sec) => tilt (deg) }
const FORWARD_TILT_VALUES = {
    0.0 : 0,
    1.0 : -5,
    2.0 : 5,
    3.0 : -15,
    4.0 : -5,
    5.0 : 0,
    7.0 : 30,
    10.0 : -10,
    11.0 : 45,
    13.0 : -25,
    14.0 : 0
};

// Left sonar values
// { time (sec) => range (in) }
const LEFT_SONAR_VALUES = {
    0.0 : SONAR_MIN,
    2.0 : 50,
    4.0 : 16,
    5.0 : 50,
    10.0 : 200,
    20.0 : 230,
    22.0 : SONAR_MAX,
    30.0 : 30,
    33.0 : SONAR_MIN
};

// Right sonar values
// { time (sec) => range (in) }
const RIGHT_SONAR_VALUES = {
    0.0 : SONAR_MIN,
    2.0 : 50,
    4.0 : 16,
    5.0 : 50,
    10.0 : 200,
    20.0 : 230,
    22.0 : SONAR_MAX,
    30.0 : 30,
    33.0 : SONAR_MIN
};

// Front sonar values
// { time (sec) => range (in) }
const FRONT_SONAR_VALUES = {
    0.0 : SONAR_MIN,
    2.0 : 50,
    4.0 : 16,
    5.0 : 50,
    10.0 : 200,
    20.0 : 230,
    22.0 : SONAR_MAX,
    30.0 : 30,
    33.0 : SONAR_MIN
};


// -----------------------------------------------------------------------------
//  Helper Functions
// -----------------------------------------------------------------------------

// This takes the values and applies linear interpolation
function interpolateValues(values, time, repeat = false) {
    // find min and max time
    let tmin = undefined;
    let tmax = undefined;
    for (let x in values) {
        if (tmin === undefined || x < tmin) tmin = x;
        if (tmax === undefined || x > tmax) tmax = x;
    }
    // clamp or modulo
    if (repeat) {
        time = tmin + ((time - tmin) % (tmax - tmin));
    }
    else {
        if (time < tmin) {
            time = tmin;
        }
        else if (time > tmax) {
            time = tmax;
        }
    }
    // find prior and next times
    let tprior = tmin;
    let tnext = tmax;
    for (let x in values) {
        if (x > tprior && x <= time) tprior = x;
        if (x < tnext && x >= time) tnext = x;
    }
    // interpolate between both
    let dt = tnext - tprior;
    if (dt < 1.0e-12) {
        return (values[tprior] + valies[tnext]) * 0.5;
    }
    let r = (time - tprior) / dt;
    return values[tmin] + (values[tmax] - values[tmin]) * r;
}

// Assumes:
//  - colors is not empty
//  - each element in an array of 3 numeric values
// Returns: Array
function interpolateColors(colors, ratio) {
    let s = colors.length;
    if (s <= 1) return colors[0];
    if (ratio <= 0.0) return colors[0];
    if (ratio >= 1.0) return colors[s - 1];

    let cr = (s - 1) * ratio;
    let i1 = Math.floor(cr);
    let i2 = i1 + 1;
    if (i2 == s) --i2;
    let lr = cr - i1;
    let c1 = colors[i1];
    let c2 = colors[i2];

    let c3 = [
        c1[0] + (c2[0] - c1[0]) * lr,
        c1[1] + (c2[1] - c1[1]) * lr,
        c1[2] + (c2[2] - c1[2]) * lr];

    return c3;
}

function convertColorToCSS(c) {
    let n = c[0] + (c[1] << 8) + (c[2] << 16);
    return '#' + n.toString(16);
}

// Returns a string, representing a hex color
// ex: "#ff0c00"
function convertSonarRangeToCSSColor(range) {
    let r = (x - SONAR_MIN) / (SONAR_MAX - SONAR_MIN);
    let c = interpolateColors(SONAR_COLORS, r);
    return convertColorToCSS(c);
}


// -----------------------------------------------------------------------------
//  Export Functions
// -----------------------------------------------------------------------------

module.exports = {
    // Returns a float, representing heiht in inches.
    getHeight: function(time) {
        return interpolateValues(HEIGHT_VALUES, time, true);
    },

    // Returns a float, representing heiht in inches.
    getAttitide: function(time) {
        return interpolateValues(HEIGHT_VALUES, time, true);
    },

    // Returns a float, representing forward tilt angle in degrees.
    getForwardTilt: function(time) {
        return interpolateValues(FORWARD_TILT_VALUES, time, true);
    },

    // Returns a string, representing an interpolated color in CSS form
    getLeftSonarColor: function(time) {
        let x = interpolateValues(LEFT_SONAR_VALUES, time, true);
        return convertSonarRangeToCSSColor(x);
    },

    // Returns a string, representing an interpolated color in CSS form
    getRightSonarColor: function(time) {
        let x = interpolateValues(RIGHT_SONAR_VALUES, time, true);
        return convertSonarRangeToCSSColor(x);
    },

    // Returns a string, representing an interpolated color in CSS form
    getFrontSonarColor: function(time) {
        let x = interpolateValues(FRONT_SONAR_VALUES, time, true);
        return convertSonarRangeToCSSColor(x);
    }
};
