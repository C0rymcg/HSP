//**Hue Saturation Perceptual-Brightness
function RGBtoHSP(color){
	var r = color.r / 255; var g = color.g / 255; var b = color.b / 255;

	var h, s, p;
	var Pr = 0.299, Pg = 0.587, Pb = 0.114;
		//	Calculate the Perceived brightness.
	p=Math.sqrt(r*r*Pr + g*g*Pg + b*b*Pb);

	//Calculate the Hue and Saturation.
	if(r==g && r==b) {
		return {p: p, h: 0, s: 0};
	}
	if (r >= g && r >= b) {	 //	r is largest
		if (b>=g) {
			h = 6/6 - 1/6 * (b-g)/(r-g);
			s = 1 - g/r;
		} else {
			h = 0/6 + 1/6 * (g-b)/(r-b);
			s = 1 - b/r;
		}
	} else if (g >= r && g >= b) {	 //	g is largest
		if (r >= b) {
			h = 2/6 - 1/6 * (r-b)/(g-b);
			s = 1- b/g;
		} else {
			h = 2/6 + 1/6 * (b-r)/(g-r);
			s=1 - r/g;
		}
	} else {	 //	b is largest
		if (g >= r) {
				h = 4/6 - 1/6 * (g-r)/(b-r);
				s = 1 - r/b;
			} else {
			h = 4/6 + 1/6 * (r-g)/(b-g);
			s = 1 - g/b;
		}
	}

	//bend the colors to match perceptual hue distance (this part is based on my opinion)
	h = polynomialInterpolation(0,1,[{x: 0, y: 0},{x: 0.14, y: 0.13},{x: 0.5, y: 0.4},{x: 0.7, y: 0.7},{x: 1, y: 1}],h);
	return {h: h, s: s, p: p};

}
function HSPtoRGB(color){
	h = color.h; s = color.s; p = color.p;
	var Pr = 0.299, Pg = 0.587, Pb = 0.114;

	//bend the colors to match perceptual hue distance (this part is based on my opinion)
	h = polynomialInterpolation(0,1,[{x: 0, y: 0},{x: 0.13, y: 0.14},{x: 0.4, y: 0.5},{x: 0.7, y: 0.7},{x: 1, y: 1}],h);
	var part, minOverMax=1-s;
	var r, g, b;

	if (minOverMax > 0) {
		if (h < 1/6) {//	R>G>B
			h = 6 * h;
			part=1 + h*(1/minOverMax - 1.);

			b=p / Math.sqrt(Pr/(minOverMax*minOverMax) + Pg*part*part + Pb);
			r=b/minOverMax;
			g=(b) + h*(r-b);

		} else if ( h < 2/6) {	 //	G>R>B
			h = 6 *((0-h) + 2/6);
			part=1 + h*(1/minOverMax - 1);

			b=p / Math.sqrt(Pg/(minOverMax*minOverMax) + Pr*part*part + Pb);
			g=b/minOverMax;
			r=b+h*(g-b);
		} else if ( h< 3 / 6) {	 //	G>B>R
			h = 6 * (h - 2/6);
			part=1 + h*(1 / minOverMax - 1);
			r=p / Math.sqrt(Pg/(minOverMax*minOverMax) + Pb*part*part + Pr);
			g=r / minOverMax;
			b=r + h * (g-r);
		} else if (h < 4/6) {	 //	B>G>R
			h = 6 * ((0-h) + 4/6);
			part = 1 + h*(1 / minOverMax - 1);
			r = p / Math.sqrt(Pb / (minOverMax*minOverMax) + Pg*part*part + Pr);
			b = r / minOverMax;
			g=r + h *(b - r);
		} else if (h < 5/6) {	 //	B>R>G
			h = 6 * (h - 4/6);
			part = 1 + h * (1/minOverMax - 1);
			g = p / Math.sqrt(Pb/(minOverMax*minOverMax) + Pr*part*part + Pg);
			b = g / minOverMax;
			r = g + h * (b - g);
		} else {	 //	R>B>G
			h = 6 * ((0-h) + 1);
			part = 1 + h * (1/minOverMax - 1);
			g = p / Math.sqrt(Pr/(minOverMax*minOverMax) + Pb*part*part + Pg);
			r=g / minOverMax;
			b = g + h * (r-g);
		}
	}
	else {
		if ( h < 1/6) {	 //	R>G>B
			h= 6*(h -0 /6);
			r = Math.sqrt(p*p/(Pr+Pg*h*h));
			g=(r) * h;
			b=0;
		} else if (h < 2/6) {	 //	G>R>B
			h= 6 * (-h + 2/6);
			g = Math.sqrt(p*p/(Pg+Pr*h*h));
			r=(g) * h;
			b=0;
		} else if ( h < 3/6) {	 //	G>B>R
			h = 6 * (h - 2/6);
			g = Math.sqrt(p*p / (Pg+Pb*h*h));
			b=(g) * h;
			r=0.;
		} else if (h < 4/6) {	 //	B>G>R
			h = 6 * (-h + 4/6);
			b = Math.sqrt(p*p / (Pb+Pg*h*h));
			g=(b) * h;
			r=0;
		} else if (h < 5/6) {	 //	B>R>G
			h = 6 * (h - 4/6);
			b = Math.sqrt(p*p / (Pb+Pr*h*h));
			r=b * h;
			g=0;
		} else {	 //	R>B>G
			h = 6 * (-h + 6/6);
			r = Math.sqrt(p*p / (Pr+Pb*h*h));
			b=r * h;
			g = 0;
		}

	}
	r = clamp(Math.round(r*255),0, 255);
	g = clamp(Math.round(g*255),0, 255);
	b = clamp(Math.round(b*255),0, 255);
	return{r: r, g: g, b: b};
}


function clamp(x, min = 0, max = 1){
	return Math.max(min, Math.min(x, max));

}

//this does a straightforward Linear Interpolation between two values. 
//The function will automatically chose the type of value based on the components of Start and Finish.
function lerp(start, finish, amount){
	var type = "number"; //we assume it's this.

	if (isNaN(start)){
		type = "hexcolor"; //maybe it's this.
		if(!ValidateHexColor(start)) {
			type="hspcolor";
			if(!(start.hasOwnProperty("h") && start.hasOwnProperty("s") && start.hasOwnProperty("p"))){
				type = "rgbcolor";//try this
				if(!(start.hasOwnProperty("r") && start.hasOwnProperty("g") && start.hasOwnProperty("b"))){
					type = "coords"; //try coords
					if(!(start.hasOwnProperty("x") && start.hasOwnProperty("y"))){
						type = "degrees"; //final try...
						if(!(start.hasOwnProperty("degrees"))){
					 		console.log("'start' is not a valid data type.");
				 			type = "invalid";
				 		}
					}
				}
			}
		}
	}

	switch(true){
		case isNaN(amount):
			console.log("'amount':" + amount + " is not a valid number.");
			break;
		case (type=="number" && isNaN(finish)):
			console.log( "'finish' is not a valid number.");
			break;
		case (type == "hexcolor" && !ValidateHexColor(finish)):
			console.log("'finish' is not a valid color, but 'start' is.");
			break;
		case (type == "coords" && !(finish.hasOwnProperty("x") && finish.hasOwnProperty("y"))):
			console.log("'finish' is not a valid coordinate, but 'start' is.");
			break;
		case (type=="degrees" && !(finish.hasOwnProperty("degrees"))):
			console.log("'finish' is not a valid degree rotation, but 'start' is.");
			break;
		default:
			//tests passed..
			amount = clamp(amount); //normalize to between 0 and 1
			if (type == "number"){
				return start+(finish-start)*amount;
			} else if (type == "coords"){
				var result = {x: 0, y: 0};
				result.x = start.x+(finish.x-start.x)*amount;
				result.y = start.y + (finish.y - start.y) * amount;
				return result;
			} else if (type == "hexcolor"){
				//make later
			} else if (type == "hspcolor"){
				var result = {};

				start.h = start.h%1;

				var difference = finish.h - start.h;
				while(difference < -0.5){difference += 1;}
				while(difference > 0.5){difference -= 1;}

				var result = {};
				result.h = start.h + (difference*amount);
				result.s = start.s + (finish.s - start.s)* amount;
				result.p = start.p + (finish.p - start.p)* amount;

				result.h = result.h % 1;
				return result;

			}else if(type == "rgbcolor"){
				var result = {};
				result.r = Math.round(start.r + (finish.r - start.r) * amount);
				result.g = Math.round(start.g + (finish.g - start.g) * amount);
				result.b = Math.round(start.b + (finish.b - start.b) * amount);
				return result;

			}else if(type == "degrees"){
				//normalize rotations...
				while(start.degrees < 0){ start.degrees+=360;}
				start.degrees = start.degrees % 360;
				var difference = finish.degrees - start.degrees;
				while(difference < -180){difference += 360;}
				while(difference > 180){difference -= 360;}
				var result = difference * amount;
				return {degrees: result + start.degrees};
			}
	}

}

function ValidateHexColor(c){
	var result	= /(^#[0-9A-F]{8}$)|(^#[0-9A-F]{6}$)|(^#[0-9A-F]{4}$)|(^#[0-9A-F]{3}$)/i.test(c);
}

function ValidateRGBColor(c){
	return (c.hasOwnProperty("r") && c.hasOwnProperty("g") && c.hasOwnProperty("b"));

}

//this returns a value in between min and max, selected using X, and 'bent' using Points. Think of the Curves function from Photoshop.
function polynomialInterpolation(min, max, points, x){
	var numinators = [];
	var denominators = [];

	for (var i = 0; i < points.length; i++){
		var newNumin = 1;
		var newDenom = 1;
		for(var j = 0; j < points.length;j++){
			if (j == i) j++; //we don't want to be muliplying in (x-x[j])/(x[i]-x[j])
			if (j == points.length) continue; //make sure the previous step doesn't push us out of bounds
			newNumin *= x - points[j].x;
			newDenom *= points[i].x - points[j].x;
		}
		numinators.push(newNumin);
		denominators.push(newDenom);

	}

	var result = 0;
	for (var i = 0; i < points.length; i++){
		result += points[i].y * (numinators[i]/denominators[i]);
	}
	
	return lerp(min, max, result);
}

realMod = function(x, n) {
	return ((x%n)+n)%n;
};

