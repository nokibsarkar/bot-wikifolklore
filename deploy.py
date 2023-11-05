from pysftp import Connection
import os, sys
HOST='tools.wikilovesfolklore.org'

DEFAULT_PATH='/home/listgen/listgen'
def upload_recurively(conn : Connection, local_path, remote_path):
    if os.path.isdir(local_path):
        if not conn.exists(remote_path):
            print("Creating directory", remote_path)
            conn.mkdir(remote_path)
        for i in os.listdir(local_path):
            print("Processing", i)
            upload_recurively(conn, os.path.join(local_path, i), os.path.join(remote_path, i))
    else:
        print("Uploading", local_path)
        conn.put(local_path, remote_path)
    
def upload(username, password, folder, target):
    with Connection(HOST, username=username, password=password, default_path=DEFAULT_PATH) as conn:
        upload_recurively(conn, folder, target)
        k = conn.execute(f'ls -l \'{DEFAULT_PATH}\'')
        print(''.join(map(lambda a : a.decode('utf-8'), k)))

if __name__ == '__main__':
    assert len(sys.argv) == 5, "Usage: python3 deploy.py <username> <password> <local_folder> <remote_folder>"
    USER= sys.argv[1]
    PASSWORD= sys.argv[2]
    SOURCE= sys.argv[3]
    TARGET= sys.argv[4]
    upload(USER, PASSWORD, SOURCE, TARGET)