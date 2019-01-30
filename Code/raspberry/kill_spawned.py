import os
import signal

SPAWNED_PROCESSES_FNAME = "spawned-processes"

if not os.path.isfile(SPAWNED_PROCESSES_FNAME):
    raise OSError("A file, '" + SPAWNED_PROCESSES_FNAME + "', does not exist.")

with open(SPAWNED_PROCESSES_FNAME, 'r') as fp:
    line = fp.readline()
    while line:
        os.kill(int(line), signal.SIGTERM)
        line = fp.readline()

os.remove(SPAWNED_PROCESSES_FNAME)
