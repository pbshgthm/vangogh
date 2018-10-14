import numpy as np, scipy, colorsys
from PIL import Image
from sklearn.cluster import KMeans
import json, random, os, urllib, requests
import shutil, hashlib, time
from multiprocessing.dummy import Pool


from skimage import io, color
from skimage.transform import resize

clusterMin=5
clusterK=10
redImgSize=50
detImgSize=20




def search(search_term,azureKey):
    print('searching using bing: "'+search_term+'"')
    search_url = "https://api.cognitive.microsoft.com/bing/v7.0/images/search"
    subscription_key = azureKey
    assert subscription_key
    headers = {"Ocp-Apim-Subscription-Key" : subscription_key}
    params  = {"q": search_term, "imageType": "Photo","count":100}
    response = requests.get(search_url, headers=headers, params=params)
    response.raise_for_status()
    search_results = response.json()
    result=[]
    for i in search_results['value']:
        result.append(i['thumbnailUrl'])
    return result


def download(links,dir_name):
    dir_name=dir_name.replace(' ','_')
    print('search results',len(links))
    if os.path.exists(dir_name):
    	print('using cache')
    	return

    tempName=dir_name+'-'+str(int(time.time()))
    i=0
    os.makedirs(tempName)
    def fetch(url):
    	global i
    	response = requests.get(url[0], stream=True)
    	with open(tempName+'/'+str(i).zfill(4), 'wb') as out_file:
    		shutil.copyfileobj(response.raw, out_file)
    	i+=1

    def fetch(url):
    	r=requests.get(url[0], stream=True)
    	with open(tempName+'/'+str(url[1]).zfill(4), 'wb') as out_file:
    		shutil.copyfileobj(r.raw, out_file)

    modLinks=[[links[i],i+i] for i in range(0,100)]
    Pool(10).map(fetch, modLinks)
    
    try:
    	os.rename(tempName,dir_name)
    except:
    	shutil.rmtree(tempName)

    print('Items downloaded',len(links))


def getImage(file,mode='rgb',size_=redImgSize):
	img = io.imread(file)
	img = resize(img,(size_,size_),mode='constant',anti_aliasing=False)
	if mode=='lab':
		img = color.rgb2lab(img)
	else:
		img = img*255

	if len(img.shape) == 2:
		img=np.hstack((img,img,img))
	elif img.shape[2] == 4:
		img=np.delete(img,3,axis=2)
	img=img.reshape(size_*size_,3)

	return "OK",img


def getImageData(_dir):
	global detImgSize
	allFileList=os.listdir(_dir)
	imgData=[]
	fileList=[]
	for i in allFileList:
		status,img=getImage(_dir+'/'+i,mode='lab',size_=detImgSize)
		if status=="ERROR":continue
		imgData.append(img)
		fileList.append(i)
	return np.array(imgData),fileList

def to_hsv(col):
	r=col[0]/255
	g=col[1]/255
	b=col[2]/255
	h,s,v=colorsys.rgb_to_hsv(r,g,b)
	return [h,0,0]


def getMoments(imgData):
	moments=[]
	mean=np.mean(imgData,axis=1)
	std=np.std(imgData,axis=1)
	skew=scipy.stats.skew(imgData,axis=1)
	kurtosis=scipy.stats.kurtosis(imgData,axis=1)
	moments=np.array([[mean[i],std[i],skew[i]] for i in range(len(imgData))]).reshape(len(imgData),-1)
	return moments
	


def clusterCost(imgData,centroids,labels_):
  
    normSum=[0]*len(centroids)
    clusterCount=[0]*len(centroids)
    for i in range(len(imgData)):
        dist=imgData[i]-centroids[labels_[i]]
        normSum[labels_[i]]+=np.linalg.norm(dist)
        clusterCount[labels_[i]]+=1
    cost=np.array(normSum)/np.array(clusterCount)
    return cost

def getClusters(imgData,fileList):
	global clusterK
	moments=getMoments(imgData)
	clt = KMeans(n_clusters = clusterK)
	clt.fit(moments)
	cost=clusterCost(moments,clt.cluster_centers_,clt.labels_)
	clusters=[[cost[i],[]] for i in range(clusterK)]
	for i in range(len(imgData)):
		clusters[clt.labels_[i]][1].append(fileList[i])
	
	clusters.sort(key=lambda x: x[0])
	return clusters


def clusterCheck(clusters):
	global clusterMin
	for i in range(len(clusters)):
		if(len(clusters[i][1])<clusterMin):
			return False,i
	return True,None


def getPlot(img):
	plot=[[],[],[]]
	for i in img:
		plot[0].append(int(i[0]))
		plot[1].append(int(i[1]))
		plot[2].append(int(i[2]))
	return plot

def getPalette(img,paletteK,mode='RGB'):
	paletteK+=2
	clt = KMeans(n_clusters = paletteK)
	clt.fit(img)
	val = clt.cluster_centers_.max(axis=1)
	if mode=='HEX':
		palette=[[val[i],'#%02x%02x%02x' % tuple(map(int,clt.cluster_centers_[i]))] for i in range(paletteK)]
	else:
		palette=[[val[i],list(map(int,clt.cluster_centers_[i]))] for i in range(paletteK)]
	palette.sort(reverse=True,key=lambda x: x[0])
	return [x[1] for x in palette[:-2]]


def getData(_dir,clusters,paletteK):
	global clusterMin
	data={'palette':[],'scatter':[]}
	for i in range(len(clusters))[:4]:
		palette=[]
		scatter=[]
		random.shuffle(clusters[i][1])
		for j in clusters[i][1][:clusterMin]:
			img=getImage(_dir+'/'+j)[1]
			palette.append(getPalette(img,paletteK,mode='HEX'))
			scatter.append(getPlot(img))	
		data['palette'].append(palette)
		data['scatter'].append(scatter)

	return data


def process(_dir,paletteK):
	_dir=_dir.replace(' ','_')
	print('processing '+_dir.split('/')[1],'with k=',paletteK)
	global clusterK
	imgData,fileList=getImageData(_dir)
	
	k=1
	clusters=getClusters(imgData,fileList)
	valid,ErrCltNum=clusterCheck(clusters)
	while not valid:
		if k>5:
			del clusters[ErrCltNum]
			valid,ErrCltNum=clusterCheck(clusters)
			clusterK-=1
			k=0
			continue

		k+=1
		clusters=getClusters(imgData,fileList)
		valid,ErrCltNum=clusterCheck(clusters)

	data=getData(_dir,clusters,paletteK)
	return data



############### dev_mode #########################
'''

def save_clusters(clusters,_dir,mode):
	
	try:
		os.makedirs(_dir+'_'+mode)
	except:
		shutil.rmtree(_dir+'_'+mode)
		os.makedirs(_dir+'_'+mode)

	for i in range(len(clusters)):
		print(clusters[i][0])
		os.makedirs(_dir+'_'+mode+'/clt_'+str(i))
		for j in clusters[i][1]:
			img=getImage(_dir+'/'+j)[1]
			shutil.copyfile(_dir+'/'+j,_dir+'_'+mode+'/clt_'+str(i)+'/'+j)
			get_colors(img,color_k=5,file=_dir+'_'+mode+'/clt_'+str(i)+'/'+j+'x')

def plot_colors(dist):
	bar = np.zeros((50, 300, 3), dtype = "uint8")
	startX=0
	for (percent, color) in dist:
		endX = startX + (0.25 * 300)
		cv2.rectangle(bar, (int(startX), 0), (int(endX), 50),
			color.astype("uint8").tolist(), -1)
		startX = endX
	return bar



def get_colors(img,color_k,file):
	clt = KMeans(n_clusters = color_k)
	clt.fit(img)
	val = clt.cluster_centers_.max(axis=1)
	dist=[[val[i],clt.cluster_centers_[i]] for i in range(color_k)]
	dist.sort(reverse=True,key=lambda x: x[0])
	bar = plot_colors(dist[:4])	
	plt.figure()
	plt.axis("off")
	plt.imshow(bar)
	plt.savefig(file)
	plt.close()
'''