describe('HTMLParser', function () {

    // Careful, once you uncomment this, you'll get an infinite loop
    // because of the while(true) in parseNodes
    // see if you can parseNode, parseElement implemented and then uncomment this
    it('should parse <html> tags', function () {
        var nodes = HTMLParser().parse('<html></html>');
        expect(nodes.children).toEqual([]);
        expect(nodes.attributes).toEqual({});
        expect(nodes.tagName).toEqual('html');
    });

    it('should parse html with newlines', function () {
        var nodes = HTMLParser().parse('<html>\n</html>');
        expect(nodes.children).toEqual([]);
        expect(nodes.attributes).toEqual({});
        expect(nodes.tagName).toEqual('html');
    });

    it('should parse nested tags', function () {
        var nodes = HTMLParser().parse('<html><body></body></html>');
        expect(nodes.children[0].tagName).toEqual('body');
        expect(nodes.children[0].children).toEqual([]);
        expect(nodes.attributes).toEqual({});
        expect(nodes.tagName).toEqual('html');
    });

    it('should parse text nodes', function () {
        var nodes = HTMLParser().parse('<html>hello</html>');
        // ElementNode
        //  .tagName = "html"
        //  .attributes = {id:undefined, class:undefined}
        //  children =
        //      [TextNode.text = "hello"]

        expect(nodes.children[0].text).toEqual("hello");
        expect(nodes.attributes).toEqual({});
        expect(nodes.tagName).toEqual('html');
    });

    it('should parse attributes with quoted values', function () {
        var nodes = HTMLParser().parse('<html lang="us"></html>');
        expect(nodes.children).toEqual([]);
        expect(nodes.attributes).toEqual({
            lang: 'us'
        });
        expect(nodes.tagName).toEqual('html');
    });

    it('should create a root element if sibling nodes are parsed', function () {
        var nodes = HTMLParser().parse('<div></div><div></div>');
        expect(nodes.tagName).toEqual('html');
        expect(nodes.children.length).toEqual(2);
    });


});
