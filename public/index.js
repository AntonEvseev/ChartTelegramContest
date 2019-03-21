'use strict';

let dataChart = {};
var graph = document.getElementById('fullChart1');//? delete
var canvasWidth = 0;
var canvasHeight = 0;
var chartInfos = [];
var drag = false;
var startDragX = 0;
var startDragSliderX1 = 0;
var startDragSliderX2 = 0;
var numberSlider = 0;
var paddingLeft = 20;//??
var paddingBottom = 20;//??

init();

 /*function loadJSON(callback) {  
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', './chartdata.json', true); 
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }*/
 
 function init() {
    let request = new XMLHttpRequest();
     request.open("Get", "/data", true);   
     request.setRequestHeader("Content-Type", "application/json");
     request.addEventListener("load", function () {
        let actual_JSON = JSON.parse(request.response);
        dataChart = actual_JSON;
         preDraw();        
            addButtons();
     });
     request.send();
   /* loadJSON(function(response) {    
        let actual_JSON = JSON.parse(response);
        console.log(actual_JSON);
        dataChart = actual_JSON;
        preDraw();
        
        addButtons();
    });*/
}

function preDraw() {
    for(let d = 0; d < dataChart.length; d++){
        var canvas = document.getElementById('fullChart' + d.toString());
        var screenWidth = window.screen.width;
        canvas.width = window.screen.width * 0.9; 
        canvasWidth = canvas.scrollWidth;
        canvasHeight = canvas.scrollHeight;         

        canvas.addEventListener('mousedown', function(e) {     
            drag = true;
            startDragX = e.offsetX;
            
            var currentChart = chartInfos.find(x => x.chartName == e.target.id);
            startDragSliderX1 = currentChart.sliderX1;
            startDragSliderX2 = currentChart.sliderX2;

            startDragX >= currentChart.sliderX1 && startDragX <= currentChart.sliderX1 + 10 ? numberSlider = 1 : null;
            startDragX > currentChart.sliderX2 && startDragX < currentChart.sliderX2 + 10 ? numberSlider = 2 : null;
            startDragX > currentChart.sliderX1 + 10 && startDragX < currentChart.sliderX2 ? numberSlider = 3 : null;
            startDragX < currentChart.sliderX1 && startDragX > currentChart.sliderX2 + 10 ? drag = false : null;
        });

        canvas.addEventListener('mouseout', function(e) {
            drag = false;
            numberSlider = 0;//??
        });

        canvas.addEventListener('mouseup', function(e) {
            console.log('mouseup');
            drag = false;
            numberSlider = 0;//??
         });

        canvas.addEventListener('mousemove', function(e) {
            if(drag){
                var currentChart = chartInfos.find(x => x.chartName == e.target.id);
                if(numberSlider == 1){
                    e.offsetX >= 0 && e.offsetX < currentChart.sliderX2 - 10 ? currentChart.sliderX1 = e.offsetX : null;
                }
                if(numberSlider == 2){
                    e.offsetX > currentChart.sliderX1 + 10 && e.offsetX <= canvasWidth - 10 ? currentChart.sliderX2 = e.offsetX : null;
                }
                if(numberSlider == 3){
                    var diffDistanceMove = startDragX - e.offsetX;//?? rename
                    //console.log(currentChart, currentChart.sliderX2-currentChart.sliderX1)
                    if(currentChart.sliderX1 >= 0 && currentChart.sliderX2 <= canvasWidth - 10){
                        currentChart.sliderX2 < canvasWidth - 10  ? currentChart.sliderX1 = startDragSliderX1 - diffDistanceMove : null;
                        currentChart.sliderX1 < 0 ? currentChart.sliderX1 = 0   : null; //?
                        currentChart.sliderX1 > 0 && currentChart.sliderX2 + 10 <= canvasWidth ? currentChart.sliderX2 = startDragSliderX2 - diffDistanceMove : null;
                        currentChart.sliderX2 > canvasWidth -10 ? currentChart.sliderX2 = canvasWidth - 10   : null; //?
                    } 
                }
                
                var id = e.target.id;
                var currentFullCanvas = document.getElementById(id);
                var currentFullCtx = currentFullCanvas.getContext('2d');
                currentFullCtx.clearRect(0,0,canvasWidth,canvasHeight);
                var positionElement = parseInt(id.substr(id.length - 1), 10);
                draw(currentFullCtx, dataChart[positionElement], currentChart.sliderX1, currentChart.sliderX2, false, canvasHeight, d);                

                //DRAW PART CHART Double
                var currentPartCanvas = document.getElementById('partChart' + d.toString());
                currentPartCanvas.width = window.screen.width * 0.9;                 
                var currentPartCtx = currentPartCanvas.getContext('2d');
                var currentPartCanvasHeight = currentPartCanvas.scrollHeight;
                currentPartCtx.clearRect(0,0,canvasWidth,currentPartCanvasHeight);
                draw(currentPartCtx, dataChart[positionElement], currentChart.sliderX1, currentChart.sliderX2, true, currentPartCanvasHeight, d);
            }  
          });

        if (canvas.getContext){
           var chartInfo = {};
           chartInfo.chartName = 'fullChart' + d.toString();
           chartInfo.sliderX1 = canvasWidth - 300;
           chartInfo.sliderX2 = canvasWidth - 10;
           chartInfo.disabledLines = [];
           chartInfos.push(chartInfo);

           var ctx = canvas.getContext('2d');       
           draw(ctx, dataChart[d], chartInfo.sliderX1, chartInfo.sliderX2, false, canvasHeight, d);

           //DRAW PART CHART Double
            var currentPartCanvas = document.getElementById('partChart' + d.toString());
            currentPartCanvas.width = window.screen.width * 0.9; 
            var currentPartCtx = currentPartCanvas.getContext('2d');                         
            var currentPartCanvasHeight = currentPartCanvas.scrollHeight;
            currentPartCtx.clearRect(0,0,canvasWidth,currentPartCanvasHeight);
            draw(currentPartCtx, dataChart[d], chartInfo.sliderX1, chartInfo.sliderX2, true, currentPartCanvasHeight, d);
            //         
        }
    }    
}

function draw(ctx, data, sliderX1, sliderX2, isPartChart, height, numberArray){
        //Get Y Max and Min in arrays  
        var maxY = getMaxY(data, 0, numberArray, 1, data.columns[0].length -1);//, sliderX1, sliderX2 var minY = getMinY(data, maxY, numberArray);
    var minY = getMinY( data, maxY, numberArray, 1, data.columns[0].length -1);//, sliderX1, sliderX2 var minY = getMinY(data, maxY, numberArray);
   var maxYPart = 0;
   var minYPart = 0;
   //
    
    for(let c = 0; c < data.columns.length; c++){ 
        ctx.beginPath();
        if(!isPartChart){
            ctx.fillStyle = "rgba(242,237,237,0.1)";
            ctx.fillRect(0,0,sliderX1,150);
            ctx.fillStyle = "rgba(242,237,237,0.1)";
            ctx.fillRect((sliderX2+10),0,(canvasWidth - sliderX2 - 10),150);
                            //Draw slider
            ctx.fillStyle = "rgba(194,190,190,1)";
            ctx.fillRect(sliderX1, 0, 10, height);    
            ctx.fillStyle = "rgba(194,190,190,1)";
            ctx.fillRect(sliderX2, 0, 10, height);
            ctx.fillStyle = 'rgba(194,190,190,1)';
            ctx.fillRect(sliderX1, 0, ((sliderX2+10)-sliderX1),1);
            ctx.fillStyle = 'rgba(194,190,190,1)';
            ctx.fillRect(sliderX1, 149, ((sliderX2+10)-sliderX1),1);
                            //end draw slider
        }
        if(data.columns[c][0] == "x"){            
            var minX = data.columns[c][1];//??
            var maxX = data.columns[c][1];//??

            var filteredDataX = data.columns[c]; 

            for(let i = 0; i < filteredDataX.length; i++) {
                if(filteredDataX[i] > maxX) {
                    maxX = filteredDataX[i];
                }
                if(filteredDataX[i] < minX) {
                    minX = filteredDataX[i];
                }
            }

            if(isPartChart){           
                var cminX = convertXtoValue(sliderX1, canvasWidth, maxX, minX);
                var cmaxX = convertXtoValue(sliderX2 + 10, canvasWidth, maxX, minX);// +10??
                filteredDataX = filteredDataX.filter(x=> x >= cminX && x <= cmaxX);
                maxX = cmaxX;
                minX = cminX;
                
            //get index
           // console.log(data.columns[c]);
            //console.log(filteredDataX);
            //console.log(filteredDataX[0], filteredDataX[filteredDataX.length -1]);
            //console.log(data.columns[c].indexOf(filteredDataX[0]), data.columns[c].indexOf(filteredDataX[filteredDataX.length -1]));
             //Get Y Max and Min in arrays  
            //var testFdata =data.columns[c].filter(x=>x >=filteredDataX[0] <= filteredDataX[filteredDataX.length -1]);// rename
           // maxY = getMaxY(data, 0, numberArray);//, data.columns[c].indexOf(filteredDataX[0]), data.columns[c].indexOf(filteredDataX[filteredDataX.length -1])
           // minY = getMinY(data, maxY, numberArray);//, data.columns[c].indexOf(filteredDataX[0]), data.columns[c].indexOf(filteredDataX[filteredDataX.length -1])
          
           //
           var indexX1 = data.columns[c].indexOf(filteredDataX[0]);
           var indexX2 = data.columns[c].indexOf(filteredDataX[filteredDataX.length -1]);
          // console.log(indexX1, indexX2)
            maxYPart = getMaxY(data, 0, numberArray, indexX1, indexX2);//, sliderX1, sliderX2 var minY = getMinY(data, maxY, numberArray);
            minYPart = getMinY(data, maxYPart, numberArray, indexX1, indexX2);//, sliderX1, sliderX2 var minY = getMinY(data, maxY, numberArray);
          
            //
                //Draw Data Info                
                var stepIndex = Math.floor(filteredDataX.length/6);//?????
                stepIndex < 6 ? stepIndex = 1 : null;
                for(var i = 0; i < filteredDataX.length; i = i + stepIndex) {
                    ctx.fillText(new Date(filteredDataX[i]).toDateString(), getXPixel(filteredDataX[i], canvasWidth, maxX, minX), 300);//change height
                }
           }    
        }

        var axisValue = data.columns[c][0];    
        if(isDrawAxisLine(axisValue, numberArray) && axisValue != 'x'){
            ctx.strokeStyle = data.colors[axisValue];
            for(var i = 1; i < data.columns[c].length; i++) { 
                //console.log(getYPixel(data.columns[c][i], height, isPartChart ? maxYPart : maxY, isPartChart ? minYPart :minY));
           //     console.log(data.columns[c][i], height, isPartChart ? maxYPart : maxY, isPartChart ? minYPart :minY);
                
              ctx.lineTo(getXPixel(data.columns[0][i], canvasWidth, maxX, minX), getYPixel(data.columns[c][i], height, isPartChart ? maxYPart : maxY, isPartChart ? minYPart :minY));
            } 
            ctx.stroke();
        }        
                
        //Draw y-line and add y-text
        if(isPartChart){ 
           // var diff = (maxY - minY)/6;
           var diff = 0;
           isPartChart ? diff = (maxYPart - minYPart)/6 : diff = (maxY - minY)/6;
            var yLabels = [];
          //  console.log(maxY, minY, diff)
            //yLabels.push(minY);
           // yLabels.push(maxY);
            ctx.beginPath();
           // console.log(yLabels)
           ctx.strokeStyle = "rgba(242,242,242,0.5)";          
            for(var i = 1; i < 6; i++){
             //   console.log(i)
                var ylabel = minY + (diff*i);
                yLabels.push(ylabel);
            }     
           // console.log(yLabels)
            for(var i = 0; i < yLabels.length; i++) { 
                var offset = 5;
                //var currentY = getYPixel(yLabels[i], height, maxY, minY);
                var currentY = getYPixel(yLabels[i], height, isPartChart ? maxYPart : maxY, isPartChart ? minYPart : minY);
               // console.log(yLabels[i],maxYPart,height, minYPart, diff)
                ctx.fillText(Math.round(yLabels[i]), 55, currentY - offset);                         
                ctx.moveTo(50, currentY);
                ctx.lineTo(canvasWidth, currentY); 
                                   
            } 
           ctx.stroke();
        }
    }  
 
}


function addButtons() {
    for(var i = 0; i < dataChart.length; i++){
        for (var prop in dataChart[i].colors) {
            if (dataChart[i].colors.hasOwnProperty(prop)) {
                var blockButtonsId = 'buttons' + i.toString();
                var svg = '<svg id="svg-' + i.toString() + '-' + dataChart[i].names[prop] + '" class="icon" width="255" height="24"><circle r="12" cx="12" cy="12" fill=' + dataChart[i].colors[prop] +' /><line x1="7" y1="12" x2="11" y2="16" stroke="#ffffff" stroke-width="1" /><line x1="11" y1="16" x2="18" y2="8" stroke="#ffffff" stroke-width="1" /></svg>'
                
                var blockButtontHTML = '<div id="' + i.toString() + '-' + dataChart[i].names[prop] + '" data-position="' + i.toString() + '" data-color="' + dataChart[i].colors[prop] + '" class="btn" data-name="' + prop + '" data-disable="' + false + '">' + svg + '<span class="btnText">'+ dataChart[i].names[prop] +'</span></div>';
                var element = document.getElementById(blockButtonsId);
                element.insertAdjacentHTML('beforeend', blockButtontHTML);
                var buttonsToSubs = document.getElementById(i.toString() + '-' + dataChart[i].names[prop].toString());
                                        //Subscription Btn Click
                buttonsToSubs.addEventListener('mousedown', function(e) { 

                    var id = e.target.id;
                    if (e.currentTarget !== e.target) {
                        id = e.currentTarget.id;
                    } 
                    var button = document.getElementById(id);
                    var position = button.getAttribute("data-position");
                    var nameLine = button.getAttribute("data-name");
                    var color = button.getAttribute("data-color");
                    var isDisabled = button.getAttribute("data-disable");
                    var childSvg = document.getElementById("svg-" + id);
                    var svgDisable = '<svg id="svg-' + id + '" class="icon" width="255" height="24"><circle stroke-width="3" r="10" fill="#ffffff" cx="12" cy="12" stroke=' + color +' /></svg>';
                    var svg = '<svg id="svg-' + id + '" class="icon" width="255" height="24"><circle r="12" cx="12" cy="12" fill=' + color +' /><line x1="7" y1="12" x2="11" y2="16" stroke="#ffffff" stroke-width="1" /><line x1="11" y1="16" x2="18" y2="8" stroke="#ffffff" stroke-width="1" /></svg>'

                    var currentChart = chartInfos.find(x => x.chartName == 'fullChart' + position.toString());
                    if(isDisabled == 'false') {
                        button.removeChild(childSvg);
                        button.insertAdjacentHTML('afterbegin', svgDisable);
                        button.setAttribute("data-disable", "true");
                        currentChart.disabledLines.push(nameLine);
                    } 
                    if(isDisabled == 'true'){
                        button.removeChild(childSvg);
                        button.insertAdjacentHTML('afterbegin', svg);
                        button.setAttribute("data-disable", "false");
                        var index = currentChart.disabledLines.indexOf(nameLine)
                        index > -1 ? currentChart.disabledLines.splice(index, 1) : null;
                    }
                                    //ReDraw 
                    var currentFullCanvas = document.getElementById('fullChart' + position.toString());
                    var currentFullCtx = currentFullCanvas.getContext('2d');
                    currentFullCtx.clearRect(0,0,canvasWidth,canvasHeight);
                    draw(currentFullCtx, dataChart[position], currentChart.sliderX1, currentChart.sliderX2, false, canvasHeight, position);
                  //  console.log(position, nameLine, isDisabled)

                        //DRAW PART CHART Double
                    var currentPartCanvas = document.getElementById('partChart' + position.toString());
                     // currentPartCanvas.width = window.screen.width * 0.9;                 
                    var currentPartCtx = currentPartCanvas.getContext('2d');
                    var currentPartCanvasHeight = currentPartCanvas.scrollHeight;
                    currentPartCtx.clearRect(0,0,canvasWidth,currentPartCanvasHeight);
                    draw(currentPartCtx, dataChart[position], currentChart.sliderX1, currentChart.sliderX2, true, currentPartCanvasHeight, position);
                }, false);
            }
        }
    }
}

function convertXtoValue(x, width, maxX, minX) {
    return x*((maxX - minX)/width) + minX;
}

function getXPixel(val, width, maxX, minX) {
    return (val-minX)/((maxX - minX)/width);   
}

function getYPixel(val, height, maxY, minY) {
 //   console.log(val, height, maxY, minY);
  //  console.log(height - (val-minY)/((maxY - minY)/height))
    return height - (val-minY)/((maxY - minY)/height);  
}

function getMaxY(data, initValue, numberArray, indexX1, indexX2){ 
    var maxValue= initValue;
    for(var c = 0; c < data.columns.length; c++){ 
        if(data.columns[c][0] != "x" && isDrawAxisLine(data.columns[c][0], numberArray)){
          //  console.log(data.columns[c].slice(indexX1, indexX2))
          for(var i = indexX1; i <= indexX2; i++) {
               if(data.columns[c][i] > maxValue) {
                //   console.log(data.columns[c][i]);
                maxValue = data.columns[c][i];
               }
           }
       }
    }
    return maxValue;

    /*var maxValue= initValue;
    for(var c = 0; c < data.columns.length; c++){ 
        if(data.columns[c][0] != "x" && isDrawAxisLine(data.columns[c][0], numberArray)){
          for(var i = 1; i < data.columns[c].length; i++) {
               if(data.columns[c][i] > maxValue) {
                maxValue = data.columns[c][i];
               }
           }
       }
    }
    return maxValue;*/
}

function getMinY(data, initValue, numberArray, indexX1, indexX2){ 
      var minValue = initValue;
    for(let c = 0; c < data.columns.length; c++){ 
        if(data.columns[c][0] != "x" && isDrawAxisLine(data.columns[c][0], numberArray)){
           for(var i = indexX1; i <= indexX2; i++){
              if(data.columns[c][i] < minValue) {
                minValue = data.columns[c][i];
               }
           }
       }
    }
    return minValue;
   /* var minValue = initValue;
    for(let c = 0; c < data.columns.length; c++){ 
        if(data.columns[c][0] != "x" && isDrawAxisLine(data.columns[c][0], numberArray)){
           for(let i = 1; i < data.columns[c].length; i++){
              if(data.columns[c][i] < minValue) {
                minValue = data.columns[c][i];
               }
           }
       }
    }
    return minValue;*/
}

function isDrawAxisLine(axisValue, numberArray){   
    var currentChart = chartInfos.find(x => x.chartName == 'fullChart' + numberArray.toString());
    var index = currentChart.disabledLines.indexOf(axisValue);
    return index == -1 ? true : false;
}

/* 2

I suspect it's already mentioned in some of the answers, but I'll slightly modify this to have complete working answer (easier to find and use).

Go to: https://nodejs.org/en/download/. Install nodejs.

Install http-server by running command from command prompt npm install -g http-server.

Change into your working directory, where index.html/yoursome.html resides.

Start your http server by running command http-server -c-1

Open web browser to http://localhost:8080 or http://localhost:8080/yoursome.html - depending on your html filename. */
