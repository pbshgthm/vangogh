from flask import Flask,jsonify,render_template,request,send_file
from app.engine import *
import json, shutil, datetime,os
from flask_compress import Compress
from werkzeug.utils import secure_filename
from io import BytesIO
import keys

app = Flask(__name__)

COMPRESS_MIMETYPES = ['text/html', 'text/css', 'text/xml', 'application/json', 'application/javascript']
Compress(app)


if not os.path.isdir('app/static/desk'):
	os.makedirs('app/static/desk')
if not os.path.isfile('app/static/masterLog.json'):
	emptyLog={'page':[],'search':[],'img':[]}
	with open('app/static/masterLog.json','w') as emptyFile:
		emptyFile.write(json.dumps(emptyLog))

@app.route('/launch')
def launch():
	return render_template('launch.html')

@app.route('/cachelist')
def cacheList():
	cache=os.listdir('app/static/desk')
	return jsonify(cache)

@app.route('/')
def index():
	_ip=request.remote_addr
	logger(_ip,'page','index')

	return render_template('index.html')

@app.route('/home')
def home():
	_ip=request.remote_addr
	logger(_ip,'page','home')

	return render_template('home.html')

@app.route('/search')
def palette():
	_ip=request.remote_addr
	logger(_ip,'page','search')

	return render_template('search.html')

@app.route('/image')
def image():
	_ip=request.remote_addr
	logger(_ip,'page','image')

	data=json.load(open('app/static/image-init.json'))
	return render_template('image.html',data=data)

@app.route('/imgcache')
def archive():
	_ip=request.remote_addr
	logger(_ip,'page','cache')

	data={}
	data['archive']=os.listdir('app/static/desk')
	return render_template('archive.html',data=data)
	
@app.route('/what')
def what():
	_ip=request.remote_addr
	logger(_ip,'page','what')

	return render_template('what.html')

@app.route('/how')
def how():
	_ip=request.remote_addr
	logger(_ip,'page','how')

	return render_template('how.html')

@app.route('/sayhi')
def sayhi():
	_ip=request.remote_addr
	logger(_ip,'page','sayhi')

	return render_template('sayhi.html')

@app.route('/log')
def viewLog():
	with open('app/static/masterLog.json','r') as logFile:
		log=json.loads(logFile.read())
		return jsonify(log)

@app.route('/api/img', methods=['POST'])
def img():

	
	reqType=request.form['type']
	if reqType=='userfile':
		file=request.files['file']
		if file.filename=='':
			print('nofile')
			return 'NOFILE'
		if file and True:
			img=getImage(BytesIO(file.read()),mode='RGB',size_=100)[1]
	else: img=getImage('app/static/img/sample/'+reqType,mode='RGB',size_=100)[1]
	
	_ip=request.remote_addr
	logger(_ip,'img',reqType)


	colorData={}
	colorData['palette']=[getPalette(img,i,mode='HEX') for i in range(3,8)]
	colorData['scatter']=getPlot(img)
	return jsonify(data=colorData)


@app.route('/api/search', methods=['POST'])
def generate():

	search_term=request.json['key']
	_k=4
	_k=request.json['paletteSize']
	_cacheClear=request.json['cacheClear']
	
	_ip=request.remote_addr
	logger(_ip,'search',search_term)

	search_term=search_term.lower()
	if search_term[-1]==' ':
		search_term=search_term[:-1]

	cache=os.listdir('app/static/desk')


	if not search_term.replace(' ','_') in cache:
		link_list=search(search_term,azureKey=keys.azureKey)
		if(len(link_list)==0): 
			print('ERROR',search_term)
			return "SEARCH_ERROR"
		download(link_list,'app/static/desk/'+search_term)
	elif _cacheClear:
		shutil.rmtree('app/static/desk/'+search_term.replace(' ','_'))
		print('clearing cache for',search_term)
		link_list=search(search_term,azureKey=keys.azureKey)
		if(len(link_list)==0): 
			print('ERROR',search_term)
			return "SEARCH_ERROR"
		download(link_list,'app/static/desk/'+search_term)
	else:
		print('using cache for '+search_term)
	colorData=process('app/static/desk/'+search_term,_k)
	if colorData=="ERROR":return "SEARCH_ERROR"
	return jsonify({'data':colorData})


def logger(_ip,_type,msg='NA'):
	_time=str(datetime.datetime.now())
	
	logFile=open('app/static/masterLog.json','r+')
	log={}
	with open('app/static/masterLog.json','r') as logFile:
		log=json.loads(logFile.read())
		log[_type].append([_time,_ip,msg])
	with open('app/static/masterLog.json','w') as logFile:
		logFile.write(json.dumps(log))
	
