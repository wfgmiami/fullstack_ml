'use strict';

const { getSha1 } = require('./util');

class ListNode {
  constructor(value, next) {
    this.value = value;
    this.next = next || null;
    this.id = getSha1(value);
  }

// iterative approach (see ES5 solution for recursive approach)
  toString() {
    const arr = [];

    let currentNode = this;
    while (currentNode) {
      arr.push(currentNode.id);
      currentNode = currentNode.next;
    }

    return "[" + arr.join(' ') + "]";
  }

  // (1) => null
  // (2) => (1) => null
  // (3) => (2) => (1) => null
  length() {
    if (!this.next) return 1;
    else return 1 + this.next.length()
  }

  // green => pink => blue
  // green.prepend(red)
  // red => green => pink => blue
  prepend(value) {
    return new ListNode(value, this);
  }

  // green => pink => blue
  // green.append(red)
  // green' => pink' => blue' => red
  append(list) {
    if (!this.next) return new ListNode(this.value, list);
    else return new ListNode(this.value, this.next.append(list));
  }

  // blue => null
  // blue.remove(blue) => null
  // green => pink => blue
  // green.remove(pink)
  // green'
  remove(id) {
    if (this.id === id) return this.next;
    else return new ListNode(this.value, this.next ? this.next.remove(id) : null);
  }

  // green.splitAt(pink)
  // green => pink => blue
  // green'
  splitAt(id) {
    if (this.id === id) return null;
    else return new ListNode(this.value, this.next ? this.next.splitAt(id) : null);
  }

  find(id) {
    if (this.id === id) return this;
    else return this.next ? this.next.find(id) : null;
  }

  // green => pink => blue
  // green.insertAt(pink.id, red)
  // green' => red' => pink => blue
  insertAt(id, list) {
    // append remainder of the list to the newly added list
    // this = pink
    // list = red
    if (this.id === id) return list.append(this);
    else return new ListNode(this.value, this.next ? this.next.insertAt(id, list) : null);
  }

  // this: green => pink => blue
  // list: green' => pink => blue
  // pink
  intersection(list) {
    const found = list.find(this.id);
    if (found) return found;
    else return this.next ? this.next.intersection(list) : null;
  }
}

module.exports = { ListNode };
