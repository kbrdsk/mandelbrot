class MandelbrotPoint{
	constructor(z, divIndex){
		this.z = new ComplexNumber(z.real, z.imag);
		this.divIndex = divIndex;
	}
}

let canvas = document.getElementById('fractal-canvas'),
	ctx = (canvas.getContext)? canvas.getContext('2d'): null;

canvas.addEventListener('click', (e) => zoom(e));

let iterations,
	viewProportion,
	viewSize,
	complexCorner,
	fractalArray = [];

initializeVariables();
initializeFractalArray();
recomputeArray(fractalArray, iterations);
drawFromArray(fractalArray);

function initializeVariables() {
	fractalArray = [];
	iterations = 100;
	viewProportion = +canvas.height/+canvas.width;
	viewSize = 4;
	complexCorner = new ComplexNumber(-2, 1);
}

function initializeFractalArray(){
	for(x = 0; x < +canvas.width; x++){
		fractalArray[x] = [];
		for(y = 0; y < +canvas.height; y++){
			let z = convertCoordinates(x, y);
			fractalArray[x][y] = new MandelbrotPoint(z, Infinity);
		}
	}
}

function zoomCorner(clickLoc, dimLength){
	return Math.min(Math.max(clickLoc - dimLength/4, 0), dimLength/2);
}

function zoom(click){
	iterations *= 1.5;
	let cornerX = zoomCorner(click.clientX, +canvas.width),
		cornerY = zoomCorner(click.clientY, +canvas.height);
	complexCorner = convertCoordinates(cornerX, cornerY);
	viewSize = viewSize / 2;
	fractalArray = arrayScale(fractalArray, 2, cornerX, cornerY);
	updateCoords(fractalArray);
	recomputeArray(fractalArray, iterations);
	drawFromArray(fractalArray);
}

function arrayScale(referenceArray, factor, cornerX, cornerY){
	let newArray = [],
		refX = cornerX;

	for(let x = 0; x < referenceArray.length;){
		let refY = cornerY,
			referenceColumn = referenceArray[refX],
			newColumn = [];

		for(let y = 0; y < referenceColumn.length;){
			for(let j = 0; j < factor; j++){
				let refPt = referenceColumn[refY];
				newColumn[y] = new MandelbrotPoint(refPt.z, refPt.divIndex);
				y++;
				if(y >= referenceColumn.length) break;
			}
			refY++;
		}
		for(let i = 0; i < factor; i++){
			newArray[x] = newColumn;
			x++;
			if(x >= referenceArray.length) break;
		}
		refX++;
	}
	return newArray;	
}

function checkConvergence(c, iterations){
	let z = c,
		d = new ComplexNumber(1, 0);
	for(let i = 0; i < iterations; i++){
		if(z.abs > 2) return i;
		z = z.mul(z).add(c);
		d = z.mul(new ComplexNumber(2, 0)).mul(d);
		if(d.abs < 0.1) return Infinity;
	}
	return Infinity;
}

//see https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set

function colorFunction(cVal){
	//return [cVal % 255, Math.min(cVal + 10, 255) % 255, Math.min(cVal + 20, 255) % 255,255]
	return [(cVal * 2) % 255, (cVal * 3) % 255, (cVal * 5) % 255, 255];
	//return [0,0,0,cVal]
}

function updateCoords(fractalArray){
	for(let x in fractalArray){
		for(let y in fractalArray[x]){
			let oldDivIndex = fractalArray[x][y].divIndex;
			let newCoords = convertCoordinates(x,y);
			fractalArray[x][y] = new MandelbrotPoint(newCoords, oldDivIndex);
		}
	}
}

function recomputeArray(fractalArray, iterations){
	for(let x in fractalArray){
		for(let y in fractalArray[x]){
			if(noRecompute(fractalArray, +x, +y, iterations)) continue;
			let z = fractalArray[x][y].z;
			fractalArray[x][y].divIndex = checkConvergence(z, iterations);
		}
	}
}

function isOutOfBounds(x, y, array){
	return x < 0 || y < 0 || x >= array.length|| y >= array[0].length;
}

function noRecompute(fractalArray, x, y, iterations){
	return false;
	/*let p = fractalArray[x][y];

	let divIndexD = (a, b) => {
		if(isOutOfBounds(a, b, fractalArray)) return false;
		let diff = Math.abs(fractalArray[a][b].divIndex - p.divIndex);
		return  isNaN(diff) || diff > 10;
	}

	for (let i = -10; i < 10; i++){
		if(divIndexD(x - 10, y + i)) return false;
		if(divIndexD(x + i, y + 10)) return false;
		if(divIndexD(x - 10, y + i)) return false;
		if(divIndexD(x + i, y - 10)) return false;
	}
	return true;*/
}

function drawFromArray(array){
	let width = array.length,
		height = array[0].length;

	let imageData = ctx.createImageData(width, height);

	for(let x = 0; x < width; x++){
		for(let y = 0; y < height; y++){
			let cVal = convertTocVal(array[x][y].divIndex, iterations);
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

	return new ComplexNumber(
				complexCorner.real + relX * viewSize,
				complexCorner.imag - relY * viewSize * viewProportion);
}

function convertTocVal(divIndex, iterations){
	let cN = Math.min(iterations, divIndex);
	let cVal = cN/iterations * 255;
	return cVal; 
}

