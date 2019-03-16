import os
import signal

SPAWNED_PROCESSES_FNAME = "spawned-processes"

if not os.path.isfile(SPAWNED_PROCESSES_FNAME):
    raise OSError("A file, '" + SPAWNED_PROCESSES_FNAME + "', does not exist.")

bdelete = True

with open(SPAWNED_PROCESSES_FNAME, 'r') as fp:
    line = fp.readline()
    while line:
        try:
            os.kill(int(line), signal.SIGTERM)
        except OSError as err:
            if err.errno == 1:
                print("Please run script as admin (sudo)")
                bdelete = False
                break
        except Exception as err:
            print("Error killing process: " + line + " - " + str(err))
            pass
        line = fp.readline()

if bdelete:
    os.remove(SPAWNED_PROCESSES_FNAME)
