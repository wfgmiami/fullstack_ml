describe("calculator", function() {

  /* These tests are called unit tests, and they directly test the number function */
  describe('number', function() {
    it("can parse a a single digit number", function() {
      expect((new Calculator("4")).number()).toEqual(4);
    });

    it("can parse a number without a decimal", function() {
      expect((new Calculator("428")).number()).toEqual(428);
    });

    it("can parse a number with a decimal", function() {
      expect((new Calculator("428.27")).number()).toEqual(428.27);
    });
    it("Negative number() returns 0", function() {
      debugger;
      expect((new Calculator("-123")).number()).toEqual(0);
    });
  });
  
  /* These unit tests directly test the factor function */
  describe('factor', function() {
    it("it calls the number() function when parsing numbers", function() {
      var calc = new Calculator("4");
      spyOn(calc, 'number');
      calc.factor();
      expect(calc.number.calls.count()).toEqual(1);
    });
  
    it("it recursively calls the factor() function after detecting a negative sign", function() {
      var calc = new Calculator("-1");
      spyOn(calc, 'factor').and.callThrough();
      calc.factor(); // We call factor once, and factor should call itself
      expect(calc.factor.calls.count()).toEqual(2);
    });

    it("it calls the expression function after detecting an open parenthesis", function() {
      var calc = new Calculator("(123)");
      spyOn(calc, 'expression');
      calc.factor();
      expect(calc.expression.calls.count()).toEqual(1);
    });

    it("it returns -1 for the string '-1'", function() {
      var calc = new Calculator("-1");
      // spyOn(calc, 'expression');
      // debugger;
      // calc.factor();
      expect(calc.factor()).toEqual(-1);
    });

    it("returns the result of the number function when parsing numbers", function() {
        var calc = new Calculator("484");
        // Modify the number function to always return the string "number was called".
        spyOn(calc, 'number').and.returnValue(484);
        expect(calc.factor()).toEqual(484);
    });

    it("returns the result of the expression function when parsing expressions", function() {
        var calc = new Calculator("(453)");
        // Modify the number function to always return the string "expression was called".
        spyOn(calc, 'expression').and.returnValue(453);

        // function spyOn(obj, prop) {
        //   var possibleReturnValue;
        //   var deadFunction = function() {
        //     return possibleReturnValue;
        //   };
        //   obj[prop] = deadFunction;

        //   return {
        //     and: {
        //       returnValue: function(value) {
        //         possibleReturnValue = value;
        //       }
        //     }
        //   }
        // }

        expect(calc.factor()).toEqual(453);
    });

    it("it appropriately consumes a parenthesis token before and after parsing an expression", function() {
        var calc = new Calculator("(123)");
        // factor has a rule that consumes the left and right paren an expr inside
        // this means you aren't using the real expression function but a fake one
        // that always returns 123
        spyOn(calc, 'expression').and.callFake(function() {
          // expression() would have removed the 123 and left you with the right paren
          calc.expressionToParse.shift();
          calc.expressionToParse.shift();
          calc.expressionToParse.shift();
          return 123;
        });

      expect(calc.factor()).toEqual(123);
      expect(calc.expressionToParse).toEqual([]); // did you parse all the symbols?
    });
  });

  /* These unit tests directly test the term function */
  describe('term', function() {
   it("calls the factor funtion at least once for any input and returns its value", function() {
      var calc = new Calculator("842");
      spyOn(calc, 'factor').and.returnValue(842);
      expect(calc.term()).toEqual(842);
      expect(calc.factor).toHaveBeenCalled();
    });

   it("calls the factor funtion twice when there are two factors", function() {
      var calc = new Calculator("1*4");

      //Modify factor so that all it does is remove the first token, the only token it would have parsed. 
      spyOn(calc, 'factor').and.callFake(function() {
        calc.expressionToParse.shift();

        //The expected return value from factor
        return 1;
      });
      calc.term();
      expect(calc.factor.calls.count()).toEqual(2);
    });
  });

  /* These tests directly test the expression function */
  describe('expression', function() {
   it("calls the term funtion at least once for any input and returns its value", function() {
      var calc = new Calculator("132");
      spyOn(calc, 'term').and.returnValue(734);
      expect(calc.expression()).toEqual(734);
      expect(calc.term).toHaveBeenCalled();
    });

   it("calls the term funtion twice when there are two terms", function() {
      var calc = new Calculator("1+4");

      //Modify term so that all it does is remove the first token, the only token it would have parsed.
      spyOn(calc, 'term').and.callFake(function() {
        calc.expressionToParse.shift();

        //The expected return value from factor
        return 1;
      });
      calc.expression();
      expect(calc.term.calls.count()).toEqual(2);
    });
  });

  /* These tests start from run and go through expression() */
  it("handles negative numbers", function() {
    expect((new Calculator("-3")).run()).toEqual(-3);
  });

  it("can handle addition of two numbers", function() {
    expect((new Calculator("1+2")).run()).toEqual(3);
  });

  it("can handle subtraction of two numbers", function() {
    expect((new Calculator("4-2")).run()).toEqual(2);
  });

  it("handles any number of addition and subtraction statements", function() {
    expect((new Calculator("4+2+1-2+2")).run()).toEqual(7);
  });

  it("handles multiplication statements", function() {
    expect((new Calculator("1+2*3")).run()).toEqual(7);
  });                            ^

  it("handles division statements", function() {
    expect((new Calculator("8/2")).run()).toEqual(4);
  });

  it("handles any number of multiplication statements", function() {
    expect((new Calculator("5*3*4*8*2")).run()).toEqual(960);
  });

  it("handles any number of division statements", function() {
    expect((new Calculator("100/2/5/5")).run()).toEqual(2);
  });

  it("handles a math expression with parentheses", function() {
    expect((new Calculator("(5-3*4)")).run()).toEqual(-7);
  });

  it("handles more complicated mathmatical expressions", function() {
    expect((new Calculator("(5 - -(3 + (2 * 2 / 2) *(4 / 2)))")).run()).toEqual(12);
  });
});
