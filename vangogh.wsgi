import sys
sys.path.insert(0,'/var/www/html/vangogh')

from app import app

if __name__ == '__main__':
  app.run()
