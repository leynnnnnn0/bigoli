import os, subprocess, tempfile, pathlib, json, secrets, base64
root=pathlib.Path(__file__).resolve().parents[2]
tmp=pathlib.Path(tempfile.mkdtemp(prefix='bigoli-qa-'))
db=tmp/'database.sqlite'; db.touch()
env=os.environ.copy()
env.update(APP_ENV='testing',APP_DEBUG='true',APP_URL='http://admin.localhost:3147',APP_KEY='base64:'+base64.b64encode(secrets.token_bytes(32)).decode(),DB_CONNECTION='sqlite',DB_DATABASE=str(db),DB_URL='',DATABASE_URL='',CACHE_STORE='array',QUEUE_CONNECTION='sync',SESSION_DRIVER='database',SESSION_DOMAIN='',SESSION_SECURE_COOKIE='false',MAIL_MAILER='array',BROADCAST_CONNECTION='null',ADMIN_DOMAIN='admin.localhost',CUSTOMER_DOMAIN='customer.localhost',STAFF_DOMAIN='staff.localhost',BCRYPT_ROUNDS='4')
for args in [['migrate','--force'],['db:seed','--class=E2ETestSeeder','--force']]:
 subprocess.run(['php','artisan',*args],cwd=root,env=env,check=True)
(pathlib.Path(__file__).parent/'local-environment.json').write_text(json.dumps({'database':str(db),'admin':'http://admin.localhost:3147','customer':'http://customer.localhost:3147','staff':'http://staff.localhost:3147'},indent=2))
print('Isolated local QA server ready on port 3147',flush=True)
subprocess.run(['php','artisan','serve','--no-reload','--host=127.0.0.1','--port=3147'],cwd=root,env=env,check=True)
