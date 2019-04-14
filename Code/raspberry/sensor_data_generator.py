import math

# -----------------------------------------------------------------------------
#  Constants
# -----------------------------------------------------------------------------

# Range sensor data ranges between 15.2 cm (6") and 645 cm (254")
SONAR_MIN = 6.0
SONAR_MAX = 254.0

# Start as take of, hover, change height, land
# { time (sec) => speed (m/s)) }
SPEED_VALUES = {
    0.0 : 0.0,
    2.0 : 0.02,
    4.0 : 0.1,
    5.0 : 1.2,
    10.0 : 2.0,
    20.0 : 1.0,
    22.0 : 0.5,
    30.0 : 0.2,
    35.0 : 0.0
}

# Start as take of, hover, change height, land
# { time (sec) => height (in) }
HEIGHT_VALUES = {
    0.0 : SONAR_MIN,
    2.0 : 50,
    4.0 : 16,
    5.0 : 50,
    10.0 : 200,
    20.0 : 230,
    22.0 : SONAR_MAX,
    30.0 : 30,
    33.0 : SONAR_MIN
}

# Attidute: from -90 (clockwise) to 90 (counter-clockwise) degrees
# { time (sec) => tilt (deg) }
ATTITUDE_VALUES = {
    0.0 : 0,
    10.0 : -10,
    20.0 : 30,
    50.0 : 0
}

# Forward tilt: from -45 (clockwise) to 45 (counter-clockwise) degrees
# { time (sec) => tilt (deg) }
FORWARD_TILT_VALUES = {
    0.0 : 0,
    30.0 : -30,
    60.0 : 30,
    90.0 : 0
}

# Heading: from -180 (clockwise) to 180 (counter-clockwise) degrees
# { time (sec) => heading (deg) }
HEADING_VALUES = {
    0.0 : 0,
    30.0 : -180,
    60.0 : 180,
    90.0 : 0,
    120.0: 360,
    160.0: 350,
    200.0: 360
}

# Left sonar values
# { time (sec) => range (in) }
LEFT_SONAR_VALUES = {
    0.0 : SONAR_MIN,
    2.0 : 50,
    4.0 : 16,
    5.0 : 50,
    10.0 : 200,
    20.0 : 230,
    22.0 : SONAR_MAX,
    30.0 : 30,
    33.0 : SONAR_MIN
}

# Right sonar values
# { time (sec) => range (in) }
RIGHT_SONAR_VALUES = {
    0.0 : SONAR_MIN,
    2.0 : 10,
    4.0 : 50,
    5.0 : 20,
    10.0 : 100,
    20.0 : 10,
    25.0 : SONAR_MAX,
    30.0 : 30,
    35.0 : SONAR_MIN
}

# Front sonar values
# { time (sec) => range (in) }
FRONT_SONAR_VALUES = {
    0.0 : SONAR_MAX,
    10.0 : SONAR_MIN,
    20.0 : 50,
    33.0 : SONAR_MAX
}


# -----------------------------------------------------------------------------
#  Helper Functions
# -----------------------------------------------------------------------------

# This takes the values and applies linear interpolation
def interpolateValues(values, time, repeat = False):
    # find min and max time
    tmin = None
    tmax = None
    for x in values:
        if tmin is None or x < tmin:
            tmin = x
        if tmax is None or x > tmax:
            tmax = x
    # clamp or modulo
    if repeat:
        time = tmin + ((time - tmin) % (tmax - tmin))
    else:
        if time < tmin:
            time = tmin
        elif time > tmax:
            time = tmax
    # find prior and next times
    tprior = tmin
    tnext = tmax
    for x in values:
        if x > tprior and x <= time:
            tprior = x
        if x < tnext and x >= time:
            tnext = x
    # interpolate between both
    dt = tnext - tprior
    if dt < 1.0e-12:
        return (values[tprior] + values[tnext]) * 0.5
    r = (time - tprior) / dt
    return values[tprior] + (values[tnext] - values[tprior]) * r

# Assumes:
#  - colors is not empty
#  - each element in an array of 3 numeric values
# Returns: Array
def interpolateColors(colors, ratio):
    s = len(colors)
    if s <= 1:
        return colors[0]
    if ratio <= 0.0:
        return colors[0]
    if ratio >= 1.0:
        return colors[s - 1]

    cr = (s - 1) * ratio
    i1 = math.floor(cr)
    i2 = i1 + 1
    if i2 == s:
        i2 -= 1
    lr = cr - i1
    c1 = colors[i1]
    c2 = colors[i2]

    c3 = [
        c1[0] + (c2[0] - c1[0]) * lr,
        c1[1] + (c2[1] - c1[1]) * lr,
        c1[2] + (c2[2] - c1[2]) * lr]

    return c3

# -----------------------------------------------------------------------------
#  Export Functions
# -----------------------------------------------------------------------------

# Returns a float, representing height in inches.
def getHeight(time):
    return interpolateValues(HEIGHT_VALUES, time, True)

# Returns a float, representing speed in m/s.
def getSpeed(time):
    return interpolateValues(SPEED_VALUES, time, True)

# Returns a float, representing side tilt angle in degrees
def getAttitide(time):
    return interpolateValues(ATTITUDE_VALUES, time, True)

# Returns a float, representing forward tilt angle in degrees.
def getForwardTilt(time):
    return interpolateValues(FORWARD_TILT_VALUES, time, True)

# Returns a float, representing heading angle in degrees.
def getHeading(time):
    return interpolateValues(HEADING_VALUES, time, True)

# Returns a float, representing distance of left sonar.
def getLeftSonarRange(time):
    return interpolateValues(LEFT_SONAR_VALUES, time, True)

# Returns a float, representing distance of right sonar.
def getRightSonarRange(time):
    return interpolateValues(RIGHT_SONAR_VALUES, time, True)

# Returns a float, representing distance of front sonar.
def getFrontSonarRange(time):
    return interpolateValues(FRONT_SONAR_VALUES, time, True)
