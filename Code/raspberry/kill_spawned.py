import os
import signal

SPAWNED_PROCESSES_FNAME = "spawned-processes"

if not os.path.isfile(SPAWNED_PROCESSES_FNAME):
    raise OSError("A file, '" + SPAWNED_PROCESSES_FNAME + "', does not exist.")

with open(SPAWNED_PROCESSES_FNAME, 'r') as fp:
    line = fp.readline()
    while line:
        try:
            os.kill(int(line), signal.SIGTERM)
        except:
            pass
        line = fp.readline()

os.remove(SPAWNED_PROCESSES_FNAME)
