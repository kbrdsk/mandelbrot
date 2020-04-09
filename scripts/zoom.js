class MandelbrotPoint{
	constructor(z, cNum){
		this.z = new ComplexNumber(z.real, z.imag);
		this.cNum = cNum;
	}
}

let canvas = document.getElementById('fractal-canvas');
let ctx = (canvas.getContext)? canvas.getContext('2d'): null;

let windowArray = [];

let iterations = 100;

let dr = 4;
let di = 2;
let r0 = -2;
let i0 = 1;

for(x = 0; x < +canvas.width; x++){
	windowArray[x] = [];
	for(y = 0; y < +canvas.height; y++){
	let z = convertCoordinates(x, y);
	windowArray[x][y] = new MandelbrotPoint(z, Infinity);
	}
}


recomputeArray(windowArray, iterations);

drawFromArray(windowArray);

canvas.addEventListener('click', (e) => zoom(e));

//drawFractal();

function zoom(click){
	iterations += 15;
	let cornerX = Math.min(Math.max(click.clientX - +canvas.width/4, 0), +canvas.width/2);
	let cornerY = Math.min(Math.max(click.clientY - +canvas.height/4, 0), +canvas.height/2);
	let newCoords = convertCoordinates(cornerX, cornerY);
	dr = dr/2;
	di = di/2;
	r0 = newCoords.real;
	i0 = newCoords.imag;
	windowArray = scale(windowArray, 2, [cornerX, cornerY]);
	updateCoords(windowArray);
	recomputeArray(windowArray, iterations);
	drawFromArray(windowArray);
}

function scale(oldArray, factor, corner){
	let newArray = [];
	let oldX = corner[0];
	let width = oldArray.length;
	let height = oldArray[0].length;
	for(let x = 0; x < width;){
		let oldY = corner[1];
		let oldColumn = oldArray[oldX];
		let newColumn = [];
		for(let y = 0; y < height;){
			for(let j = 0; j < factor; j++){
				let m = oldColumn[oldY];
				newColumn[y] = new MandelbrotPoint(m.z, m.cNum);
				y++;
				if(y >= height) break;
			}
			oldY++;
		}
		for(let i = 0; i < factor; i++){
			newArray[x] = newColumn;
			x++;
			if(x >= width) break;
		}
		oldX++;
	}
	return newArray;	
}

function checkConvergence(c, iterations){
	let z = new ComplexNumber(c.real, c.imag);
	let i;
	for(i = 0; i < iterations; i++){
		if(z.abs > 2) return i;
		z = z.mul(z);
		z = z.add(c);
	}
	return Infinity;
}

function colorFunction(cVal){
	return [(cVal * 2) % 255, (cVal * 3) % 255, (cVal * 5) % 255, 255];
	//return [0,0,0,cVal]
}

function updateCoords(fractalArray){
	for(let x in fractalArray){
		for(let y in fractalArray[x]){
			let oldcNum = fractalArray[x][y].cNum;
			let newCoords = convertCoordinates(x,y);
			fractalArray[x][y] = new MandelbrotPoint(newCoords, oldcNum);
		}
	}
}

function recomputeArray(fractalArray, iterations){
	for(let x in fractalArray){
		for(let y in fractalArray[x]){
			if(noRecompute(fractalArray, +x, +y, iterations)) continue;
			let z = fractalArray[x][y].z;
			fractalArray[x][y].cNum = checkConvergence(z, iterations);
		}
	}
}

function noRecompute(fractalArray, x, y, iterations){
	//return false;
	let p = fractalArray[x][y];

	let cNumD = (a, b) => {
		if(a < 0 || b < 0) return false;
		if(a >= 1000 || b >= 500) return false;
		let diff = Math.abs(fractalArray[a][b].cNum - p.cNum);
		return  isNaN(diff) || diff > 10;
	}

	for (let i = -10; i < 10; i++){
		if(cNumD(x - 10, y + i)) return false;
		if(cNumD(x + i, y + 10)) return false;
		if(cNumD(x - 10, y + i)) return false;
		if(cNumD(x + i, y - 10)) return false;
	}
	return true;
}

function drawFromArray(array){
	let width = array.length;
	let height = array[0].length;
	let imageData = ctx.createImageData(width, height);
	for(let x = 0; x < width; x++){
		for(let y = 0; y < height; y++){
			let cVal = convertTocVal(array[x][y].cNum, iterations);
			drawPixel(imageData, [x, y], colorFunction(cVal));
		}
	}
	ctx.putImageData(imageData, 0, 0);
}

function drawFractal (){
	let width = +canvas.width;
	let height = +canvas.height;
	let imageData = ctx.createImageData(width, height);
	for(let x = 0; x < width; x++){
		for(let y = 0; y < height; y++){
			let cVal = getcVal(x,y);
			drawPixel(imageData, [x, y], colorFunction(cVal));
		}
	}
	ctx.putImageData(imageData, 0, 0);
}

function drawPixel (imageData, [pixelX, pixelY], rgba){
	pixelPosition = pixelX * 4 + pixelY * imageData.width * 4
	for(let i = 0; i < 4; i++) imageData.data[pixelPosition + i] = rgba[i];
}


function convertCoordinates(x, y){
	let relX = x/(+canvas.width);
	let relY = y/(+canvas.height);

	return new ComplexNumber(r0 + relX * dr, i0 - relY * di);
}

function convertTocVal(cNum, iterations){
	let cN = Math.min(iterations, cNum);
	let cVal = cN/iterations * 255;
	return cVal; 
}

function getcVal(x, y, iterations = 100){
	let z = convertCoordinates(x, y);
	let cNum = Math.min(iterations, checkConvergence(z, iterations));
	let cVal = cNum/iterations * 255;
	return cVal; 
}

