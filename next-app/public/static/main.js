var stopRotate=false;
var prevRot=true;
var rotAng=1;
var onRotate=false;
var clt_=0;
var plt_=1;
var ploted=false;
var mode='light';
var firstPlot=true;
var currPlot;
var colorSpace='hex';
var previewImgUrl;
var currCluster;
var paletteSize=4;
var currKey;


var waitTime=0;
if((window.location+'').split('/')[3]=="")waitTime=2000;

setTimeout(function(){
  $('#preload').fadeOut(); 
},waitTime);
setTimeout(function(){
  $('#loaded').fadeIn();  
},1000+waitTime);



window.onresize = function() {
  selectPlot(clt_,plt_)
  $('.palette-color').css('width',document.documentElement.clientWidth*0.4/paletteSize+'px')
};


function copyToClipboard(txt) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(txt).select();
    document.execCommand("copy");
    $temp.remove();
}





function createCookie(name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            }
            else var expires = "";               

            document.cookie = name + "=" + value + expires + "; path=/";
        }

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}


function handleCookies(){
  if((window.location+'').indexOf('/search')!=-1){
    var cVal=readCookie('vdash')+'';
    if(cVal=='null'){
      overlayIn();
      createCookie('vdash','prod-vd1',90);
    }
  }
  if((window.location+'').indexOf('/image')!=-1){
    var cVal=readCookie('vimg')+'';
    if(cVal=='null'){
      overlayIn();
      createCookie('vimg','prod-vi1',90);
    }
  }
  
}





function overlayIn(){
  $('#dash-overlay-'+plt_).fadeIn();
  //$('#main-rot-overlay').fadeIn();
  //$('#main-full-overlay').fadeIn();
  $('#palette-size-pane').fadeIn();
  prevRot=stopRotate;
  stopRotate=true;

  $('#image-overlay').fadeIn();
  //$('#image-rot-overlay').fadeIn();
  //$('#image-full-overlay').fadeIn();
  
  if((window.location+'').indexOf('/search')!=-1){
      var clrCode=data['palette'][clt_][plt_][0];
      clrCode=hexToHex(clrCode);
      $('#dash-color-code').empty();
      $('#dash-color-code').text(clrCode);
      $('#dash-color-code').append('<span class="dash-copy-alert">copied to clipoard</span>');
      $('#dash-color-code').show();  
  }
  else{
      var clrCode=imgClrs[paletteSize-3][0];
    
      clrCode=hexToHex(clrCode);
      
      $('#image-color-code').empty();
      $('#image-color-code').text(clrCode);
      $('#image-color-code').show();
  }
}

$('#nav-help-link').click(function(){
  overlayIn();
})

$('.dash-overlay').click(function(){
  $('.dash-overlay').fadeOut();
  //$('#main-rot-overlay').fadeOut();
  //$('#main-full-overlay').fadeOut();
  //$('#palette-size-pane').fadeOut();
  stopRotate=prevRot;
  
  //$('#image-rot-overlay').fadeOut();
  //$('#image-full-overlay').fadeOut();
  $('#dash-color-code').hide();
  $('#image-color-code').hide();

})



function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function hexToRgb(hex) {
    hex=hex.substring(1);
      var bigint = parseInt(hex, 16);
      var r = (bigint >> 16) & 255;
      var g = (bigint >> 8) & 255;
      var b = bigint & 255;

      return padDigits(r,3) +", "+padDigits(g,3) +", "+padDigits(b,3);
  }

  function hexToHex(hex){return hex.toUpperCase();}

  function hexToHsl(hex) {
      hex=hex.substring(1);
      var bigint = parseInt(hex, 16);
      var r = (bigint >> 16) & 255;
      var g = (bigint >> 8) & 255;
      var b = bigint & 255;

      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if(max == min) h = s = 0;
      else{
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
          h /= 6;
      }
      
      return padDigits(Math.round(h*360),3)+", "+padDigits(Math.round(s*100),3)+"%, "+padDigits(Math.round(l*100),3)+'%';
  }



$('#dash-refresh').click(function(){
  search(currKey,cacheClear=true);
})

function initPalette(){

  palWidth=document.documentElement.clientWidth*0.4/paletteSize+'px';
  
  clt_=0;
  plt_=1;
  var palName=['A','B','C','D','E'];

  setTimeout(function(){
    $('#dash-swatch').fadeIn(500);
    $('#dash-refresh').fadeIn(500);
    $('#dash-color-space').fadeIn(500);
  },200);
  
  $('#palette-pane').empty();
  for(var i=0;i<5;i++){
    var plt='<div class="palette-bar" id="pb-'+i+'"><div id="pa-'+i+'" class="plot-arrow">&#9664;</div><div id="ps-'+i+'" class="palette-sel"><div id="pl-'+i+'" class="plot-btn">'+palName[i]+'</div>';
    for(var j=0;j<paletteSize;j++){
      var paletteClass='palette-color';
      if(j==0)paletteClass='palette-color pc-first';
      if(j==paletteSize-1)paletteClass='palette-color pc-last';
      plt+='<div clr="'+data['palette'][clt_][i][j]+'" id="pc-'+i+'-'+j+'" class="'+paletteClass+'" style="width:'+palWidth+'; background-color:'+data['palette'][clt_][i][j]+'"></div>';
    }
    plt+='</div></div>'

    $('#palette-pane').append(plt);
  }
  
  if(mode=='dark')
    $('.plot-btn').css('color','#F5F5F5');
  else
    $('.plot-btn').css('color','#263238');

  
  $('.palette-sel').bind('click',function(){
    if(parseInt(this.id[3])==plt_)return;
    plt_=parseInt(this.id[3]);

    $('.palette-sel').removeClass('palette-sel-sel');
    $('.palette-sel').eq(plt_).addClass('palette-sel-sel');

    selectPlot(clt_,plt_);
  

    $('.plot-btn').removeClass('plot-btn-sel');
    $('.plot-arrow').removeClass('plot-arrow-sel');
    $('#pa-'+plt_).addClass('plot-arrow-sel');
    $('.plot-btn').eq(plt_).addClass('plot-btn-sel');


  });

  $('.palette-color').bind('click',function(){
    

   var clrCode=$('#'+this.id).attr('clr');
    
    if(colorSpace=='hex')clrCode=hexToHex(clrCode);
    if(colorSpace=='rgb')clrCode=hexToRgb(clrCode);
    if(colorSpace=='hsl')clrCode=hexToHsl(clrCode);

    $('.dash-copy-alert').fadeIn(10);
    setTimeout(function(){
        $('.dash-copy-alert').fadeOut(500);
    },200);
    copyToClipboard(clrCode);

  })


  $('.palette-color').bind('mouseenter',function(){
    var pal=this.id[3];
    var col=this.id[5];
    var clrCode=data['palette'][clt_][pal][col];
    
    if(colorSpace=='hex')clrCode=hexToHex(clrCode);
    if(colorSpace=='rgb')clrCode=hexToRgb(clrCode);
    if(colorSpace=='hsl')clrCode=hexToHsl(clrCode);

    $('#dash-color-code').empty();
    $('#dash-color-code').text(clrCode);
    $('#dash-color-code').append('<span class="dash-copy-alert">copied to clipoard</span>');
    $('#dash-color-code').show();



  });

  $('.dash-color-space-opt').bind('click',function(){
    colorSpace=this.id.slice(-3);
    $('.dash-color-space-opt').removeClass('dash-color-space-opt-sel');
    $('#'+this.id).addClass('dash-color-space-opt-sel');

  });



  $('.palette-color').bind('mouseleave',function(){
    $('#dash-color-code').hide();
  })

  for(var i=0;i<5;i++){
    setTimeout(function(i){
      $('#pb-'+i).css('margin-left','0vw');
    },100+(i*200),i);
  }


  setTimeout(function(){
     initClusters();
   },500);

  setTimeout(function(){
    selectPlot(clt_,1);
  },1500);


  $('.palette-sel').eq(1).addClass('palette-sel-sel');


}



function genSwatch(palette){

  var canvas=document.getElementById("palette-canvas");
  var ctx=canvas.getContext("2d");

  var bgClr='#FAFAFA';
  var txtClr='#37474F';

  if(mode=='dark'){
    bgClr='#141414';
    txtClr='#CFD8DC';
  }

  ctx.beginPath();
  ctx.fillStyle = bgClr;
  ctx.rect(0, 0, 960, 540);
  ctx.fill();
  
  clrW=600/paletteSize;
  clrH=60;
  padV=15;

  ctx.font = "1.3em Lato";
  ctx.fillStyle = txtClr;
  ctx.textAlign = "center";
  ctx.fillText("VANGOGH",canvas.width/2,50);

  ctx.font = "2.5em Lato";
  ctx.fillStyle = txtClr;
  ctx.textAlign = "center";
  ctx.fillText($('#dash-search').val(),canvas.width/2,100);

  ctx.font = "1em Lato";
  ctx.textAlign = "left";

  function drawPal(clr,x,y){

    ctx.beginPath();
    ctx.fillStyle = clr;
    ctx.rect(x, y, clrW, clrH);
    ctx.fill();
    ctx.fillStyle = invertColor(clr);

    ctx.fillText(clr.toUpperCase(),x+2,y+58);
  }

  function invertColor(hex) {
      
      hex = hex.slice(1);
    var r = parseInt(hex.slice(0, 2), 16),
          g = parseInt(hex.slice(2, 4), 16),
          b = parseInt(hex.slice(4, 6), 16);

      return ((r * 0.299 + g * 0.587 + b * 0.114) > 150) ? '#000000' :'#FFFFFF';
  }

  function padZero(str, len) {
      len = len || 2;
      var zeros = new Array(len).join('0');
      return (zeros + str).slice(-len).toUpperCase();
  }

  for(var j=0;j<5;j++)
  for(var i=0;i<paletteSize;i++)
    drawPal(palette[j][i],180+(clrW*i),130+(clrH*j)+(padV*j));
  

}

function swatchdownload(){
    var download = document.getElementById("swatch-download");
    var image = document.getElementById("palette-canvas").toDataURL("image/png")
                    .replace("image/png", "image/octet-stream");
    download.setAttribute("download",'VANGOGH-'+$('#dash-search').val().replace(/[' ']/g,'_')+'.png');
    download.setAttribute("href", image);
    
}



function initClusters(){
  $('#cluster-pane').empty();
  updatePalette(0);
	var clt='';
  for(var i=0;i<paletteSize;i++)
		clt+='<div id="clt-'+i+'" class="cluster-circle" )>'+(i+1)+'</div>';
	$('#cluster-pane').append(clt);
  	$('#pl-'+plt_).addClass('plot-btn-sel');
  	$('#pa-'+plt_).addClass('plot-arrow-sel');
    
    
    

    for(var i=0;i<4;i++)
      setTimeout(function(i){
          $('.cluster-circle').eq(i).css('transform','scale(0.5)');
          $('#clt-0').addClass('cluster-circle-sel');
      },100+200*i,i);
    
  $('.cluster-circle').bind('click',function(){
    if(this.id[4]==clt_)return;
    clt_=this.id[4];
    updatePalette(clt_);
    selectPlot(clt_,plt_);
    $('.cluster-circle').removeClass('cluster-circle-sel');
    $('#'+this.id).addClass('cluster-circle-sel');   
  })


}
function updatePalette(clt_){
  

  currCluster=data['palette'][clt_];
  genSwatch(currCluster);
	var randArray=Array.apply(null, {length: paletteSize*5}).map(Number.call, Number);
	function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  };
  //shuffleArray(randArray);


	for(var i=0;i<randArray.length;i++){
		var plt=parseInt(randArray[i]/paletteSize);
		var cl=parseInt(randArray[i]%paletteSize);
    setTimeout(function(plt,cl,clr){
			$('#pc-'+plt+'-'+cl).css('background-color',clr);
		},20*i,plt,cl,data['palette'][clt_][plt][cl])
	}
	$('.plot-btn').removeClass('plot-btn-sel');
	$('#pl-'+plt_).addClass('plot-btn-sel');
  $('.plot-arrow').removeClass('plot-arrow-sel');
  $('#pa-'+plt_).addClass('plot-arrow-sel');

  $('.palette-sel').removeClass('palette-sel-sel');
  $('.palette-sel').eq(plt_).addClass('palette-sel-sel');

}



function selectPlot(cluster,palette){

  var plot={};
  plt_=palette;

  $('#main-scatter-plot').css('opacity','0');
  setTimeout(function(){
    updatePlot(data['scatter'][cluster][palette],'main-scatter-plot');
  },100);
}

function updatePlot(data,plot_id,size_='min',setRot=false,onlyPlot=false){



  var pointSize=7;
  if(navigator.userAgent.indexOf("Firefox") != -1)pointSize=9;

  currPlot=data;

  var plot={};
  plot['x']=data[0];
  plot['y']=data[1];
  plot['z']=data[2];
  plot['c']=[];

  for(i=0;i<data[0].length;i++)
    plot['c'].push('rgb('+plot['x'][i]+','+plot['y'][i]+','+plot['z'][i]+')');

  var bg='#FAFAFA'
  if(mode=='dark')bg='#141414';
  ploted=true;
  var crds=[
      {
        x: plot['x'],
        y: plot['y'],
        z: plot['z'], 
        mode: 'markers',
        marker: {
          size: pointSize,
          opacity: 1,
          color:plot['c'],
        },
        type: 'scatter3d',
      }
  ];

  var axisRange;
  if(size_=='min')axisRange=[-50,300];
  else axisRange=[-50,280];
  if(size_=='max')axisRange=[-5,260];

  var layout = {        
        showlegend:false,
        margin:{l:0,r:0,t:0,b:0,},
        scene:{
          yaxis: {
            visible:false,
            range:axisRange,
          },
          xaxis : {
            visible:false,
            range:axisRange,
          },
          zaxis : {
            visible:false,
            range:axisRange,
          },
          bgcolor:bg,
          hovermode:false,
          autosize:true,
       }
  };

    
  


  Plotly.purge(plot_id);

  if(firstPlot||onlyPlot)
    Plotly.newPlot(plot_id,crds, layout,{displayModeBar:false});


  else
    Plotly.react(plot_id,crds, layout,{displayModeBar:false});


  firstPlot=false;

  setTimeout(function(){
    $('#'+plot_id).css('opacity','1');
    $('.rot-stop-btn').fadeIn();
    $('.full-btn').fadeIn();
  },300);
  
  var plot = document.getElementById(plot_id);

  function rotate(id, angle) {
    try {
      var scene = plot._fullLayout[id]._scene;
      var camera = scene.getCamera();    
      var rtz = xyz2rtz(camera.eye);
      rtz.t += angle;
      camera.eye = rtz2xyz(rtz);
      scene.setCamera(camera);
      return "OK";
    }
    catch{
      return "ERR";
    }
    
  }

  function xyz2rtz(xyz) {
    return {
      r: Math.sqrt(xyz.x * xyz.x + xyz.y * xyz.y),
      t: Math.atan2(xyz.y, xyz.x),
      z: xyz.z
    };
  }

  function rtz2xyz(rtz) {
    return {
      x: rtz.r * Math.cos(rtz.t),
      y: rtz.r * Math.sin(rtz.t),
      z: rtz.z
    };
  }

  function runRotate() {
    if(stopRotate)if(rotAng>=0)rotAng-=0.02;
    if(!stopRotate)if(rotAng<=1)rotAng+=0.02;
    var stat=rotate('scene', Math.PI / 180*rotAng);
    if(stat=="OK")
      requestAnimationFrame(runRotate);
  } 

  if(setRot)onRotate=false;
    
  if(onRotate)return;
  else{
    onRotate=true;
    runRotate();
  }

}



$('.full-btn').click(function(){

    $('#full-rot-btn').css('transform','scale(1)');
    $('#full-close-btn').css('transform','scale(1)')
    $('#main-full-plot').addClass('full-plot-sel');
    
    setTimeout(function(){
      updatePlot(currPlot,'main-full-plot',size_='max',setRot=true,purge=false);  
    },1000);
    
   

});

$('#full-close-btn').click(function(){
    $('#full-rot-btn').css('transform','scale(0)')
    $('#main-full-plot').removeClass('full-plot-sel');
    $('#full-close-btn').css('transform','scale(0)')
    Plotly.purge('main-full-plot');
});







$('.palette-size-opt').click(function(){
  var palS=parseInt($(this).text());
  if(palS==paletteSize)return;
  paletteSize=palS;
  $('.palette-size-opt').removeClass('palette-size-opt-sel');
  $(this).addClass('palette-size-opt-sel');

  
  if((window.location+'').indexOf('/search')!=-1){
    search(currKey);
  }
  else
    updateImgPalette(imgClrs[paletteSize-3]);

})






var searchPalette='';
function search(key,cacheClear=false){
    
    currKey=key;
    $('#dash-error-msg').hide();
    $('#main-scatter-plot').css('opacity','0');
    $('.rot-stop-btn').fadeOut();
    $('.full-btn').fadeOut();
    
    setTimeout(function(){
      $('#dash-swatch').fadeOut(500);
      $('#dash-refresh').fadeOut(500);
      $('#dash-color-space').fadeOut(500);
    },200);
    
    

    for(var i=0;i<4;i++)
      setTimeout(function(i){
        if($('.cluster-circle').eq(i).hasClass('cluster-circle-sel'))
          $('.cluster-circle').eq(i).removeClass('cluster-circle-sel');
        $('.cluster-circle').eq(i).css('transform','scale(0)');   
      },100+100*i,i);

    
    for(var i=0;i<5;i++){
    setTimeout(function(i){
      $('#pb-'+i).css('margin-left','50vw');
    },i*200,i);
    }

    window.location.hash=key.replace(/[' ']/g,'+');
    $('#dash-search').val(key);
    document.title=key.substr(0,1).toUpperCase() + key.substr(1) + ' - Vangogh' ;
    if(key==""){
        setTimeout(function(){
          $('#dash-loader').css('transform','scale(0)');  
        },1000);
        return;
    };

    setTimeout(function(){
      $('#dash-loader').css('transform','scale(1)');  
    },800);

    searchPalette=key;
    $.ajax({
        url: '/api/search',
        type: "POST",
        data: JSON.stringify({ key: key , paletteSize : paletteSize,cacheClear:cacheClear}),
        contentType: "application/json",
        success: function (colorData) {
                 if(colorData=='SEARCH_ERROR'){
                    var errText="Sorry, VANGOGH could not generate color palettes for "+key+" :(";
                    $('#dash-error-msg').text(errText).fadeIn();
                    $('#dash-loader').css('transform','scale(0)');
                 }
                 else{
                      data=colorData.data;
                      initPalette();
                      $('#dash-loader').css('transform','scale(0)');
                      $('#dash-swatch').click(function(e) {
                          swatchdownload();
                      });
                      setTimeout(function(){
                        handleCookies();
                      },4000);

                 }
        },
        error: function (request,status,error){
              console.log('req_err');
        }
    });


  }








$("#dash-search").keyup(function (e) {
      if (e.which == 13) {
        search($("#dash-search").val());
      }
});

$("#dash-search-icon").bind('click',function(){
    search($("#dash-search").val());
})



 
 if((window.location+'').indexOf('/search')!=-1){

$(document).keydown(function(e) {

    if(e.target.nodeName.toLowerCase()=='input')return;
    
    if(e.which == 32) {
        if(stopRotate){
          stopRotate=false;
          $('.rot-stop-btn').attr('src','../../static/img/icons/pause.png')
        }
        else{
          stopRotate=true;
          $('.rot-stop-btn').attr('src','../../static/img/icons/play.png')
        } 
    }
    if(e.which == 37) {
        clt_=(clt_+3)%4;
        console.log(clt_)
        updatePalette(clt_);
        selectPlot(clt_,plt_);
        $('.cluster-circle').removeClass('cluster-circle-sel');
        $('#clt-'+clt_).addClass('cluster-circle-sel');
    }
    if(e.which == 38) {
        plt_=(plt_+4)%5;;

        $('.palette-sel').removeClass('palette-sel-sel');
        $('.palette-sel').eq(plt_).addClass('palette-sel-sel');
        selectPlot(clt_,plt_);
        $('.plot-btn').removeClass('plot-btn-sel');
        $('.plot-arrow').removeClass('plot-arrow-sel');
        $('#pa-'+plt_).addClass('plot-arrow-sel');
        $('#'+this.id).addClass('plot-btn-sel');
    }
    if(e.which == 39) {
        clt_=(clt_+1)%4;
        console.log(clt_)
        updatePalette(clt_);
        selectPlot(clt_,plt_);
        $('.cluster-circle').removeClass('cluster-circle-sel');
        $('#clt-'+clt_).addClass('cluster-circle-sel');
    }
    if(e.which == 40) {
        plt_=(plt_+1)%5;;

        $('.palette-sel').removeClass('palette-sel-sel');
        $('.palette-sel').eq(plt_).addClass('palette-sel-sel');
        selectPlot(clt_,plt_);
        $('.plot-btn').removeClass('plot-btn-sel');
        $('.plot-arrow').removeClass('plot-arrow-sel');
        $('#pa-'+plt_).addClass('plot-arrow-sel');
        $('#'+this.id).addClass('plot-btn-sel');
    }
});



$(window).bind( 'hashchange', function(e){
  var key=window.location.href.split('#')[1].replace(/[^0-9A-Za-z" "+.]/g, '').replace(/[+]/g,' ');
  if($('#dash-search').val()!=key){
    $('#dash-search').val(key);
    document.title=key.substr(0,1).toUpperCase() + key.substr(1) + ' - Vangogh' ;
    search(key);
  }
 });

if(window.location.href.split('#')[1]!='')
  if(!ploted)search(window.location.href.split('#')[1].replace(/[^0-9A-Za-z" "+.]/g, '').replace(/[+]/g,' '));



}


$('#main-VANGOGH-image').bind('click',function(){
  window.location='/image'
});



$("#main-search").keyup(function (e) {
      if (e.which == 13) {
        key=$('#main-search').val();
        if(key!='')
        window.location='/search#'+key.replace(/[^0-9A-Za-z" "+.]/g, '').replace(/[' ']/g,'+');
      }
});

$("#main-search-icon").bind('click',function(){
    key=$('#main-search').val();
    if(key!='')
    window.location='/search#'+key.replace(/[^0-9A-Za-z" "+.]/g, '').replace(/[' ']/g,'+');
})








///////////// theme handler /////////////
$('#dark-btn').bind('click',function(){
  if(mode=='dark')return;
  mode='dark';
  $('#dark-btn').hide();
  $('#light-btn').show();


  
  

  $('#main-full-plot').css('background-color','#141414');
  $('#main-scatter-plot').css('opacity','0');
  $('body').css('background-color','#141414');
  $('.nav-links').css('color','#BDBDBD');
  $('.cluster-circle').css('color','white');
  $('.plot-btn').css('color','#F5F5F5');
  
  

  if((window.location+'').indexOf('/search')!=-1){
      genSwatch(currCluster);
      $('#dash-search-icon').css('filter','brightness(300%)');
      $('#dash-search').css('color','#E0E0E0')
      setTimeout(function(){
        selectPlot(clt_,plt_);
      },400);
  }

  if((window.location+'').indexOf('/image')!=-1){
        $('#image-scatter-plot').css('opacity','0');
        setTimeout(function(){
          updatePlot(currPlot,'image-scatter-plot','full');
        },0);        
  }
  
})


$('#light-btn').bind('click',function(){
  if(mode=='light')return;
  mode='light';

  
  
  $('#dark-btn').show();
  $('#light-btn').hide();

  
  $('#main-full-plot').css('background-color','#FAFAFA');
  $('#main-scatter-plot').css('opacity','0');
  $('body').css('background-color','#FAFAFA');
  $('.nav-links').css('color','#263238');
  $('.cluster-circle').css('color','black');
  $('.plot-btn').css('color','#263238');
  

  if((window.location+'').indexOf('/search')!=-1){
      genSwatch(currCluster); 
      $('#dash-search-icon').css('filter','brightness(100%)');
      $('#dash-search').css('color','#455A64')
      setTimeout(function(){
        selectPlot(clt_,plt_);
      },400);
  }

  if((window.location+'').indexOf('/image')!=-1){
        $('#image-scatter-plot').css('opacity','0');
        setTimeout(function(){
          updatePlot(currPlot,'image-scatter-plot','full');
        },0);
        
  }

})



$('.rot-stop-btn').bind('click',function(){
  if(stopRotate){
    stopRotate=false;
    $('.rot-stop-btn').attr('src','../../static/img/icons/pause.png')
  }
  else{
    stopRotate=true;
      $('.rot-stop-btn').attr('src','../../static/img/icons/play.png')
  } 
})
///////////////////////

function readURL(input) {
        if (input.files && input.files[0] && (["image/jpeg", "image/png"].indexOf(input.files[0]['type'])!=-1)) {
            var reader = new FileReader();     
            reader.onload = function (event) {  
                $('#image-preview').css('opacity','0.4');
                $('#imgload').fadeIn(300);
                previewImgUrl=event.target.result
                
            };
            reader.readAsDataURL(input.files[0]);
            var formData = new FormData();
            formData.append('file', input.files[0]);
            formData.append('type', 'userfile');
            $.ajax({
                url: '/api/img',
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (colorData) { 

                            

                         $('#image-scatter-plot').css('opacity','0');

                            $('#image-scatter-plot').css('opacity','0');

                             setTimeout(function(){
                                $('#image-preview').css('background-image', 'url('+previewImgUrl+')');
                                $('#image-preview').css('opacity','1'); 
                             },200);

                             currPlot=colorData.data['scatter'];
                              
                             paletteSize=4;
                             $('.palette-size-opt').removeClass('palette-size-opt-sel');
                             $('.palette-size-opt').eq(1).addClass('palette-size-opt-sel');
                             $('#imgload').fadeOut(300);
                             $('#image-preview').css('opacity','0');
                             imgClrs=colorData.data['palette'];
                             updateImgPalette(imgClrs[paletteSize-3]); 
                             setTimeout(function(){
                                updatePlot(currPlot,'image-scatter-plot','full');   
                             },500);


                             
                },
                error: function (request,status,error){
                      console.log('req_err');
                }
            });


        }else{
          console.log('fileType ERROR');
        }
    }


function updateImgPalette(clr){
    palWidth=document.documentElement.clientWidth*0.32/paletteSize+'px';
    
    $('#image-palette-bar').empty();
    plt='';
    for(var i=0;i<paletteSize;i++){
      var paletteClass='image-palette-colors';
      if(i==0)paletteClass='image-palette-colors pc-first';
      if(i==paletteSize-1)paletteClass='image-palette-colors pc-last';
      plt+='<div clr="'+clr[i]+'" id="imgClr'+i+'" class="'+paletteClass+'" style="width:'+palWidth+'; background-color:'+clr[i]+'"></div>';
    }
    $('#image-palette-bar').append(plt);



 $('.image-palette-colors').bind('click',function(){
    
    var col=this.id[6];
    var clrCode=imgClrs[paletteSize-3][col];
     
    if(colorSpace=='hex')clrCode=hexToHex(clrCode);
    if(colorSpace=='rgb')clrCode=hexToRgb(clrCode);
    if(colorSpace=='hsl')clrCode=hexToHsl(clrCode);

    $('.image-copy-alert').fadeIn(10);
    setTimeout(function(){
        $('.image-copy-alert').fadeOut(500);
    },200);
    copyToClipboard(clrCode);

  })


  $('.image-palette-colors').bind('mouseenter',function(){
    
    var col=this.id[6];
    var clrCode=imgClrs[paletteSize-3][col];
    
    if(colorSpace=='hex')clrCode=hexToHex(clrCode);
    if(colorSpace=='rgb')clrCode=hexToRgb(clrCode);
    if(colorSpace=='hsl')clrCode=hexToHsl(clrCode);

    $('#image-color-code').empty();
    $('#image-color-code').text(clrCode);
    $('#image-color-code').show();



  });

   $('.image-palette-colors').bind('mouseleave',function(){
        $('#image-color-code').hide();
    });

  }


$('#image-upload-btn').bind('mouseenter',function(){
  $('#image-preview').addClass('image-preview-focus');
})
$('#image-upload-btn').bind('mouseleave',function(){
  $('#image-preview').removeClass('image-preview-focus');
})




  $('.image-sample-img').bind('click',function(){


      var _id=this.id[3];
      $('.image-sample-img').removeClass('image-sample-img-sel');
      $('#ims'+_id).addClass('image-sample-img-sel');
      
      $('#image-preview').css('opacity','0.4');
      $('#imgload').fadeIn(300);

      var formData = new FormData();
                formData.append('type', 'sample'+_id);
                $.ajax({
                    url: '/api/img',
                    type: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (colorData) {  
                             
                             
                             $('#image-scatter-plot').css('opacity','0');

                             setTimeout(function(){
                                $('#image-preview').css('background-image', 'url(../../static/img/sample/sample'+_id);
                                $('#image-preview').css('opacity','1'); 
                             },200);

                             currPlot=colorData.data['scatter'];
                             paletteSize=4;
                             $('.palette-size-opt').removeClass('palette-size-opt-sel');
                             $('.palette-size-opt').eq(1).addClass('palette-size-opt-sel');
                             $('#imgload').fadeOut(300);
                             $('#image-preview').css('opacity','0');
                             imgClrs=colorData.data['palette'];
                             updateImgPalette(imgClrs[paletteSize-3]);
                             setTimeout(function(){
                                updatePlot(currPlot,'image-scatter-plot','full');   
                             },500)
                             
                             
                    },
                    error: function (request,status,error){
                          console.log('req_err');
                    }
                });


})




  $('.image-color-space-opt').bind('click',function(){
    colorSpace=this.id.slice(-3);
    $('.image-color-space-opt').removeClass('image-color-space-opt-sel');
    $('#'+this.id).addClass('image-color-space-opt-sel');

  });



  $('.image-palette-colors').bind('mouseleave',function(){
    $('#image-color-code').hide();
  })









if((window.location+'').indexOf('/image')!=-1){

    var holder = document.getElementById('image-upload-btn');
    holder.ondragover = function () { $('#image-preview').addClass('image-preview-focus'); return false; };
    holder.ondragleave = function () { $('#image-preview').removeClass('image-preview-focus'); return false; };

    holder.ondragend = function () { $('#image-preview').removeClass('image-preview-focus'); return false; };

    holder.ondrop = function (e) {
      this.className = '';
      e.preventDefault();
      readURL(e.dataTransfer);
    }


  $('#image-scatter-plot').css('opacity','0');
  setTimeout(function(){
    updatePlot(currPlot,'image-scatter-plot','full');
  },100);


  imgClrs=[
  [
    "#f99c69",
    "#d7c7b4",
    "#c47686"
  ],
  [
    "#fcbe11",
    "#f2917b",
    "#d6c8b5",
    "#b37086"
  ],
  [
    "#fcbf0f",
    "#f79678",
    "#d5c8b6",
    "#ca7685",
    "#896284"
  ],
  [
    "#fcbf0f",
    "#f69579",
    "#dbcdb7",
    "#cb667a",
    "#b39099",
    "#7f5d82"
  ],
  [
    "#fcbf0f",
    "#f89978",
    "#daccb8",
    "#d8707e",
    "#b18f99",
    "#9a5274",
    "#6e6288"
  ]
]
  
updateImgPalette(imgClrs[paletteSize-3])
setTimeout(function(){
  handleCookies();
},2000)

}

function fillArchiveList(dirList){
  var list_="";
  for(var i=0;i<dirList.length;i++)
    list_+='<div class="archive-dir-name" name="'+dirList[i]+'">'+dirList[i].replace(/_/g,' ')+'</div>'
  $('#archive-dir-list').append(list_);
  var imgList_="";
  for(var i=0;i<100;i++)
    imgList_+='<div class="archive-view-img"></div>'
  $('#archive-view-pane').append(imgList_);
  

  fillArchiveImg(archiveList[0])
  $('.archive-dir-name').eq(0).addClass('archive-dir-name-sel');
  
  $('.archive-dir-name').bind('click',function(){
    fillArchiveImg($(this).attr('name'));
    $('.archive-dir-name').removeClass('archive-dir-name-sel');
    $(this).addClass('archive-dir-name-sel');
  })
}

function fillArchiveImg(dir){
  for(var i=0;i<100;i++)
    $('.archive-view-img').eq(i).css('background-image','url("../../static/desk/'+dir+'/'+padDigits(i+1,4)+'")')  
}




if((window.location+'').indexOf('/imgcache')!=-1){
  fillArchiveList(archiveList);
}
