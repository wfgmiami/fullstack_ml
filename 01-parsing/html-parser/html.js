function HTMLParser() {
  // Variables shared by the parsing functions
  // to keep track of the data
  var pos = 0,
    input = '';

  // Used in your parser to throw errors
  var assert = function(condition) {
    if (!condition) {
      throw new Error("test failed");
    }
  }

  function parse(html) {
    pos = 0;
    input = html;

    var nodes = parseNodes();

    // wrap nodes in HTML if not a single root node
    if (nodes.length === 1) {
      return nodes[0];
    } else {
      return new ElementNode('html', [], nodes);
    }
  }

  // parse a sequence of sibling nodes
  // <div><p>hello</p><p>world</p><p>this is david</p></div>
  function parseNodes() {
    var nodes = [];
    for(var i=0; i < 100; i++) {
    // while(!end_of_file())
      consumeWhiteSpace();
      if (eof() === true || startsWith('</') === true) {
        break;
      }

      nodes.push(parseNode());
    }
    return nodes;
  }

  // Step 1:
  // Parse a single node, either an element or text node
  function parseNode() {
    var node;
    // if the first char is a <, parse an Element
    if(input[pos] == "<") {
      node = parseElement();
    } else {
      node = parseText();
    }
    // else parseText
    return node;
  }


  // Step 2:
  // Parse a single element tag
  function parseElement() {
    // check that we're starting with a <
    assert(consumeChar() === '<');

    // parseTagName
    var tagName = parseTagName();

    // TODO: parseAttributes
    var attrs = parseAttributes();

    // check that we've got an end >
    // 
    // <div class="MyClass"><h1>adsfs</h1>aflsdajkflsjdfkldjfkladsf</div>
    assert(consumeChar() === '>');

    // TODO: Parse all it's children Nodes (using parseNodes)
    var children = parseNodes();

    // check that we have a matching end tag
    // and that the tag is the same 
    // hint:
    //   use parseTagName to get the tagName and match it to the previous one
    assert(consumeChar() === '<');
    assert(consumeChar() === '/');
    assert(parseTagName() === tagName);
    // <div>Hello</div             >
    assert(consumeChar() === '>');
    // class="banner top"

    return new ElementNode(tagName, attrs, children);
  }

  // this will return the tagName as a String
  function parseTagName() {
    function isTagNameChar(str) {
      var nextChar = str.charAt(0);
      return /[A-Za-z0-9]/.test(nextChar);
    }

    return consumeWhile(isTagNameChar);
  }

  // Step 3: Parse a set of attributes inside the element
  // e.g. class="my-class" id="testId"
  // Hint:
  // - You have continue parsing until you find the >
  // - Consume White Space until you find an Attribute  
  // 
  // attributes = attr*
  function parseAttributes() {
    var attributes = {};
    // PARSE ATTRIBUTES
    //     v
    // <div>
    //                    v
    // <div class="banner">
    //                                 v
    // <div class="banner"             id="topBanner">

    consumeWhiteSpace();
    if(nextChar() === ">") { return attributes; }

    // we have some attributes
    while(nextChar() !== ">") {
      var attr = parseAttribute();
      attributes[attr.name] = attr.value;
      consumeWhiteSpace();
    }

    return attributes;
  }

  // Step 4: Parse a single attribute assignment
  // e.g. class="myClass"
  function parseAttribute() {
    var name, value;

    name = consumeWhile(function(char) {
      return char !== "=";
    })
    assert(consumeChar() === '=');

    value = parseAttributeValue();
    return {
      name: name,
      value: value
    };
  }


  // Step 5: Parse a Quoted Value "myClass"
  // class="sectionTitle slider-image"
  function parseAttributeValue() {
    // check for a quote
    assert(consumeChar() === '"');
    // similar to parseTagName - get everything that's not an end-quote: "
    var attrValue = consumeWhile(function(char) {
      return char !== '"';
      // "my Name includes a double quote and it's Da\"vid"
    })    
    // check for end quote 
    assert(consumeChar() === '"');

    return attrValue;

  }

  /*
    Consume text and create a TextNode
   */
  function parseText() {
    var innerText = consumeWhile(isTextChar);
    return new TextNode(innerText);
  }


  // Given Utility Functions for your Parser
  // These should be pretty clear
  function isTextChar(c) {
    return c !== '<';
  }

  function consumeWhiteSpace() {
    consumeWhile(isWhiteSpace);
  }

  function isWhiteSpace(c) {
    return c === ' ' || c === '\n';
  }


  // consumeWhile(isWhiteSpace);
  // for(var pos = 0; input[pos] !== " "; pos++) {
  //    str += input[pos]
  // }
  function consumeWhile(testFn) {
    var result = '';

    while (!eof() && testFn(nextChar())) {
      result += consumeChar();
    }
    return result;
  }

  // equiv of this.get()
  function consumeChar() {
    return input.charAt(pos++);
  }

  // equiv of this.peek()
  function nextChar() {
    return input.charAt(pos);
  }

  function startsWith(str) {
    return input.substr(pos).indexOf(str) === 0;
  }

  function eof() {
    return pos >= input.length;
  }

  return {
    parse: parse
  }

}