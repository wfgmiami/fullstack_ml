const fs = require('fs');
const upsidedown = require('upsidedown');

function Table (folderPath) {
  // `_propertyName` is an idiom for signalling an "internal" property
  this._folderPath = folderPath;
  this._indexTables = {};
}

Table.toFilename = function (id) {
  return id + '.json';
};

Table.toId = function (filename) {
  return filename.slice(0, -5);
};

Table.prototype.read = function (id) {
  const filename = Table.toFilename(id);
  const fullpath = this._folderPath + '/' + filename;
  const doesExist = fs.existsSync(fullpath);
  if (!doesExist) return undefined;
  const buffer = fs.readFileSync(fullpath);
  const filestr = buffer.toString();
  const row = JSON.parse(filestr);
  return row;
};

Table.prototype.getRowIds = function () {
  const filenames = fs.readdirSync(this._folderPath);
  const ids = filenames.map(function (filename) {
    return Table.toId(filename);
  });
  return ids;
};

Table.prototype.hasIndexTable = function (column) {
  return this._indexTables.hasOwnProperty(column);
};

Table.prototype.getIndexTable = function (column) {
  return this._indexTables[column];
};

Table.prototype.addIndexTable = function (column) {
  const indexTable = {};
  const ids = this.getRowIds();
  // run through all the table rows
  ids.forEach((id) => {
    const row = this.read(id);
    // throw all the row values for that column into a hash table as keys
    const indexTableKey = row[column];
    // throw all the row ids into the hash tables' values
    if (!indexTable[indexTableKey]) {
      indexTable[indexTableKey] = [id];
    } else {
      indexTable[indexTableKey].push(id);
    }
  });
  this._indexTables[column] = indexTable;
};

const originalLog = console.log.bind(console);
const topsturvy = function (...args) {
  const flipped = args.map((arg) => {
    return upsidedown(JSON.stringify(arg));
  });
  originalLog.apply(console, flipped);
};

Table['(╯°□°）╯︵ ┻━┻'] = function () {
  console.log = topsturvy;
};

Table['┬─┬ノ( º _ ºノ)'] = function () {
  console.log = originalLog;
};

// const moviesTable = new Table('film-database/movies-table');

// Table['(╯°□°）╯︵ ┻━┻']();
// logRows();
// Table['┬─┬ノ( º _ ºノ)']();
// logRows();

// function logRows () {
//   moviesTable.getRowIds()
//   .forEach((id) => {
//     const row = moviesTable.read(id);
//     console.log(row);
//   });
// }

module.exports = Table;