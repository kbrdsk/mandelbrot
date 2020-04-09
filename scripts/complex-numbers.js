class ComplexNumber {
  constructor(real, imag) {
    this.real = real;
    this.imag = imag;
  }

  add(number) {
    let real = this.real + number.real;
    let imag = this.imag + number.imag;
    return new ComplexNumber(real, imag);
  }

  sub(number) {
    let real = this.real - number.real;
    let imag = this.imag - number.imag;
    return new ComplexNumber(real, imag);  
  }

  div(number) {
    let numerator = this.mul(number.conj);
    let real = numerator.real/(number.abs * number.abs);
    let imag = numerator.imag/(number.abs * number.abs);
    return new ComplexNumber(real, imag); 
  }

  mul(number) {
    let real = this.real * number.real - this.imag * number.imag;
    let imag = this.real * number.imag + this.imag * number.real;
    return new ComplexNumber(real, imag);  
  }

  get abs() {
    return Math.sqrt(this.real*this.real + this.imag*this.imag);
  }

  get conj() {
    let imag = (this.imag === 0)? 0: -this.imag;
    return new ComplexNumber(this.real, imag);
  }

  get exp() {
    let real = Math.exp(this.real) * Math.cos(this.imag);
    let imag = Math.exp(this.real) * Math.sin(this.imag);
    return new ComplexNumber(real, imag);  
  }
}
