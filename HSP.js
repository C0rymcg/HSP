//nebula formula:spherical 10,julia 6, perp/hyp.Lower perp=more clouds

const TAU = 6.2831853;
const PI = TAU/2;

var canv=document.getElementById("imgCanvas");
var ctx= canv.getContext("2d");
var colorArray;




init = function(){
	CreateColorArray();
}


clearScreen=function(){
	ctx.clearRect(0, 0, canv.width, canv.height);
}

//this is triggered by a button on the html, it demos the HSP color method by creating a rainbow image from left to right
generateColorstrip = function(){

	var imgData = ctx.getImageData(0,0, canv.width, canv.height);	//create a virtual representation of the canvas's array of pixels

	clearScreen();
	var stripHeight = canv.height/2;

	//process each pixel. J is used with half of the canvas height because I mirror the result vertically
	for (var i = 0 ; i < canv.width; i++){
		for (var j = 0; j <= stripHeight; j++){
			
			var bright = 1-(j / stripHeight);
			bright = 1 - bright*bright; //The edges of the displayed gradient will be shaded. this line bends the shading to make it look more round.
			
			var color = HSPtoRGB({h: i / canv.width, s: 0.8, p: lerp(0.2,0.5,bright)}); 
			
			//find the index needed for imgData, and set the pixel colors appropriately
			var newI = XYtoINDEX({x: i, y: j});
			imgData.data[newI]	 = color.r;
			imgData.data[newI + 1] = color.g;
			imgData.data[newI + 2] = color.b;
			imgData.data[newI + 3] = 255;

			//Do the same thing for the bottom half of the canvas
			newI = XYtoINDEX({x: i, y: canv.height - j});
			imgData.data[newI]	 = color.r;
			imgData.data[newI + 1] = color.g;
			imgData.data[newI + 2] = color.b;
			imgData.data[newI + 3] = 255;
		}
	}

	//apply the changed data to the screen
	ctx.putImageData(imgData,0,0);
}


//this is triggered by a button on the html, it demos the HSP color method by showing a pre-set gradient
generateGradient = function(){
var imgData = ctx.getImageData(0,0, canv.width, canv.height);
	clearScreen();

	for (var i = 0 ; i < canv.width; i++){
		for (var j = 0; j <= canv.height/2; j++){

			var ind = (i / canv.width)* (colorArray.length-1);
			var color1 = colorArray[Math.floor(ind)];
			var color2 = colorArray[Math.floor(ind+1)];
			
			//blend between the two gradient locations 			
			var color = lerp(color1, color2, ind%1);

			var newPos1 = {x: i, y: j};
			var newPos2 = {x: i, y: canv.height - j};
			var newI = XYtoINDEX(newPos1); 

			//calculate multiplier for rounded effect
			var bright = 1-(j / (canv.height/2));
			bright = 1-bright*bright;
			
			//apply the color choice to the appropriate pixels
			imgData.data[newI    ] = color.r*bright;
			imgData.data[newI + 1] = color.g*bright;
			imgData.data[newI + 2] = color.b*bright;
			imgData.data[newI + 3] = 255;
			
			newI = XYtoINDEX(newPos2);
			imgData.data[newI]     = color.r*bright;
			imgData.data[newI + 1] = color.g*bright;
			imgData.data[newI + 2] = color.b*bright;
			imgData.data[newI + 3] = 255;
		}
	}
	ctx.putImageData(imgData,0,0);

}

//todo: Use polynomial interpolation or cubic splines instead of lerp to make the changes less triangular-looking
CreateColorArray = function(){

	//these colors are examples of colors inputted by a user, or by a gradient file
	var colorstops = [{r: 0, g: 96, b: 248}, {r: 42, g: 42, b: 135}, {r: 213, g: 98, b: 89}, {r: 195, g: 225, b: 174},{r: 0, g: 96, b: 255}];
	var results = [];

//nColors decides how many steps to calculate ahead of time. 
//This then sets up colors in between the inputted ones using HSP calculations to find visually pleasing in-between colors
//Any further in-betweens can then be selected at run-time with a much less expensive linear interpolation between the saved rgb values, and this way have a gradient rendered with any arbitrary length.

	var nColors=32;
	var divisor = nColors / (colorstops.length-1);
	for (var i = 0; i < nColors; i++){
		var c1 = RGBtoHSP(colorstops[Math.floor(i/divisor)]);
		var c2 = RGBtoHSP(colorstops[Math.floor(i/divisor)+1]);
		var between = i/divisor % 1;
		var result = {};
		result = lerp(c1,c2,between);
		result = HSPtoRGB(result);
		results.push(result);
	}
	colorArray = results;

}

//changes a pixel position variable to an Index as used by canvas's getImageData method
XYtoINDEX = function(v){
	return Math.round((v.y * canv.width + v.x) * 4);
}

//changes a getImageData index to the pixel position associated with it.
INDEXtoXY = function(i){
	i = Math.floor(i/4);
	var x = i % canv.width;
	var y = Math.floor(i / canv.width);
	return {x: x, y: y};
}


init();

