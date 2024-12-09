# Database vocab

## DBMS

Database management system: software for handling read / write / queries to a database.

## Database

Data that persists and is queryable by some kind of computer.

Sometimes we say "SQL database" but really we sort of mean SQL DBMS.

## Query language

SQL is an example.

## Relation

Being able to search for something, when we say `FROM movies`, `movies` is the relation. Relation is just another word for table.

Sometimes "assocations" are called relations.

## Query plan

The method by which the DMBS "plans" to execute the query.

E.g. our query might look like `SELECT * FROM movies`. Our query plan, might look like:

```
Step 1: scan table movies
```

Can and will be different for different SQL dialects.

---

# The workshop

Building a DBMS in javascript, and also sort of a query language.

## Data

You've got JSON files inside a folder. Think of each JSON file as a "row", the folder containing it a "table", and the folder containing that a "database"

## Classes

- `Table`: persist data to and from the file system
- `FQL`: have a rich querying "language"
- `Plan`: assist the query in remembering and responding to execution details

## Logistics

- Work on parts I and II 3:00PM EST
- Take midday break for an hour or so
- Review parts I and II 3-3:30
- Lecture on indexing 3:30-4
- Work on parts III and IV 4:00-6:00
- Review parts III and IV 6:00-6:30

---

# Javascript

## Class methods (static methods)

Something you might call on the `Array` class, e.g. `Array.isArray` (not `[].isArray`).

## Instance methods

Something you might call on an `Array` instance, e.g. `[].push()` (not `Array.push()`).

## Instance v class methods

```js
var allThings = [];
function Thing (name, secretPassword, secretCatchPhrase) {
  this.name = name;
  // alternative instance method declaration syntax
  this.sing = function () {
    this.isSinging = true;
    console.log(this.name, 'is singing');
  };
  // another example
  this.sayCatchPhrase = function (passwordAttempt) {
    if (passwordAttempt === secretPassword) {
      return secretCatchPhrase;
    } else {
      throw Error('Incorrect password');
    }
  };
  allThings.push(thing);
}

// `jump` is an instance method
Thing.prototype.jump = function () {
  this.isJumping = true;
  console.log(this.name, 'is jumping');
};
Thing.jump(); // does not work
var thingOne = new Thing('thing one');
thingOne.jump(); // does work!
var thingTwo = new Thing('thing two');

// `find` is a class method
Thing.find = function (searchName) {
  for (var i = 0; i < allThings.length; i++) {
    if (allThings[i].name === searchName) {
      return allThings[i];
    }
  }
};

var foundThing = Thing.find('thing one');
```

Why...? When do we know to define something as an instance method or a class method? How to decide?

Analogy: cars. A class is like a factory, so think a car factory. An instance is like the thing that factory produces, a car.

Car "instances" might have a method like: "openDriverDoor". Instance methods will always be specific to an instance.

Car "classes" might have a method like: "unlockFactory", "lookupCarBySerialNumber". Class methods will always be _generic_, they don't necessarily operate on any particular instance.

How about instance methods directly attached as properties in the constructor vs. instance methods defined on the internal prototype?

Defined on the internal prototype will be shared, defined directly on instance will be custom for each one.

If we need access to some data _only_ available in the constructor, we're stuck with the "instance methods directly attached as properties in the constructor" approach. Otherwise, the prototype approach is preferable, because:

1. Single source of truth
2. Memory sharing—all instance will share access to the same method, doesn't take up extra space

## What is JSON

Javascript Object Notation: we use it in Javascript only, right? False.

JSON is a format for passing data around. It uses the Javascript Object syntax (or notation), but is not a Javascript intepreter.

It looks like: `'{"something": "a value here"}'`. Different from `{something: "a value here"}`.

Sending data between remote agents (e.g. client server), or for storing data on files (or in databases).

```js
// JSON.stringify(<Object>) => <String>
JSON.stringify({name: "robot"}); // '{"name": "robot"}'
// JSON.parse(<String>) => <Object>
JSON.parse('{"name": "robot"}'); // {name: "robot"}
```

## File system

We're going to be reading from files, and we'll be using `fs.readFileSync`.

What does that do? Reads the contents of a file in a synchronous fashion—blocking, everything stops until we've read the file.

We're doing that because it simplifies the problem at hand—we're focusing on JS, data persistence, understanding how a DBMS might work internally. If you're brave enough, feel free to take on the async challenge, but I don't recommend it.

It's also maybe sort-of OK for a DBMS to be blocking like this.

---

# Indexing

Provides a performance boost when looking up things in our tables, especially useful for repeated queries!

"Pre-orders" the database according a column or certain column—effectively prepared for fast querying on *that* particualr column. (Sorted index, could be a BST.)

Hashed index, think: glossary. Additional record not directly in the same table, but still accessible, that will allow us to query THAT "glossary" instead of simply searching through the whole "book".

With an index, we look in the "index table" first to VASTLY narrow our search space.

Is it all rainbows?

Well: we have to manage them. If we update any row in a table that has been indexed, we also need to update the "index table". SO if we add a row, change one, or delete one.

Also: space. This index table is a lot of redundant information. Every index table will add `O(n)` space where `n` is the number of rows in the table.

Some downsides:

1. Write operations will be (slightly) more expensive
2. It will be larger

For "enumerable" columns with a small set of values, indexing can actually slow things down.
