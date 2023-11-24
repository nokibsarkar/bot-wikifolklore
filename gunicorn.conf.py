bind = '0.0.0.0:5000'

worker_class = 'uvicorn.workers.UvicornWorker'
# workers = 5
# worker_connections = 1000
# keepalive = 5

# access_logformat = '%({x-real-ip}i)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
# accesslog = 'access.log'
# errorlog = 'error.log'
# loglevel = 'error'
# disable_redirect_access_to_syslog = True
# disable_existing_loggers = False
