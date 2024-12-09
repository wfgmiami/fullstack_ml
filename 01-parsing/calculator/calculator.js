// Based on http://en.wikipedia.org/wiki/Recursive_descent_parser

function Calculator(expression) {
  this.expressionToParse = expression.replace(/\s+/g, '').split('');
};

Calculator.prototype.run = function () {
  return this.expression();
};

Calculator.prototype.peek = function () {
  return this.expressionToParse[0] || '';
};

Calculator.prototype.get = function () {
  return this.expressionToParse.shift();
};

/*
  Grammar Rule:
  number = [0-9] {[0-9.]} 
  Hint: remember this means we need to get the first number
    followed by any number of numbers (or the period .)
 */
Calculator.prototype.number = function () {
  var result = "";
  var numbers = "0123456789.";
  while(/[0-9.]/.test(this.peek())) {
    result += this.get();
  }
  // console.log(typeof result);
  return Number(result);

};

/*
 Grammar Rule:
  factor = number
          | "(" expression ")"
          | - factor
  Hints:
    - If we see a number, produce a number 
    - If we see a (  then consume it and an expression
    - If we see a "-", return the negative of the factor
 */
Calculator.prototype.factor = function () {
  if(this.peek() === "-") {
    this.get();
    return -1 * this.factor();
  } else if(this.peek() === "(") {
    this.get(); // pulls off the (
    var exprResult = this.expression(); // (12+3*(1+3))+23
    this.get(); // <--- closing parens
    return exprResult;
  } else if(/[0-9]/.test(this.peek()) ) {
    return this.number();
  } else {
    throw new Error("Did not find a factor in token string.");
  }


};

/*
  term = factor {(*|/) factor}
 */
Calculator.prototype.term = function () {

  var result = this.factor();

  while(this.peek() == '*' || this.peek() == '/') {
    if(this.get() == '*') {
      result *= this.factor();
    } else {
      result /= this.factor();
    }
  }  
  return result;
};


/* Grammar Rules
    expression = term {(+|-) term}
*/
Calculator.prototype.expression = function () {
  var result = this.term();
  while (this.peek() == '+' || this.peek() == '-') {
    if (this.get() == '+') {
      result += this.term();
    } else {
      result -= this.term();
    }
  }
  return result;
};








