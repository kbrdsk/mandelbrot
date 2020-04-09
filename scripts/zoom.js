let canvas = document.getElementById('fractal-canvas');
let ctx = (canvas.getContext)? canvas.getContext('2d'): null;

let dr = 4;
let di = 2;
let r0 = -2;
let i0 = 1;

canvas.addEventListener('click', (e) => zoom(e));

drawFractal();

function zoom(click){
	dr = dr/2;
	di = di/2;
	let newCoords = convertCoordinates(click.clientX, click.clientY);
	r0 = newCoords[0];
	i0 = newCoords[1];
	drawFractal();
}

function checkConvergence(c, iterations){
	let z = new ComplexNumber(c.real, c.imag);
	let i;
	for(i = 0; i < iterations; i++){
		if(z.abs > 2) break;
		z = z.mul(z);
		z = z.add(c);
	}
	return i;
}

function drawFractal (){
	let width = +canvas.width;
	let height = +canvas.height;
	let imageData = ctx.createImageData(width, height);
	for(let x = 0; x < width; x++){
		for(let y = 0; y < height; y++){
			let cVal = colorPixel(x,y);
			drawPixel(imageData, [x, y], [(cVal * 2) % 255, (cVal * 3) % 255, (cVal * 5) % 255, 255]);
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
	let relY = -y/(+canvas.height);

	return [r0 + relX * dr, i0 + relY * di];
}

function colorPixel(...coords){
	let z = new ComplexNumber(...convertCoordinates(...coords));
	let iterations = 100;
	let alpha = checkConvergence(z, iterations)/iterations * 255;
	return alpha; 
}