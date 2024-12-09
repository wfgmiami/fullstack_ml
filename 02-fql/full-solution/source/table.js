const fs = require('fs');
const rmrf = require('rimraf');

function Table (folder) {
  this._folder = folder;
  if (!fs.existsSync(this._folder)) {
    fs.mkdirSync(this._folder);
  }
  this._indexFolder = `${folder}__index`;
  if (!fs.existsSync(this._indexFolder)) {
    fs.mkdirSync(this._indexFolder);
  }
}

Table.toId = function (filename) {
  return filename.slice(0,-5);
};

Table.toFilename = function (id) {
  return `${id}.json`;
};

Table.prototype._filepath = function (id) {
  return `${this._folder}/${Table.toFilename(id)}`;
};

Table.prototype.read = function (id) {
  const filepath = this._filepath(id);
  if (!fs.existsSync(filepath)) return;
  const contents = fs.readFileSync(filepath);
  return JSON.parse(contents);
};

Table.prototype.getRowIds = function () {
  return fs.readdirSync(this._folder).map(Table.toId);
};

Table.prototype._indexTablePath = function (column) {
  return `${this._indexFolder}/${column}.json`
};

Table.prototype.addIndexTable = function (column) {
  const indexTable = {};
  this.getRowIds().forEach(id => {
    const row = this.read(id);
    const indexKey = row[column];
    indexTable[indexKey] = indexTable[indexKey] || [];
    indexTable[indexKey].push(id);
  });
  const filepath = this._indexTablePath(column);
  fs.writeFileSync(filepath, JSON.stringify(indexTable));
};

Table.prototype.hasIndexTable = function (column) {
  return fs.existsSync(this._indexTablePath(column));
};

Table.prototype.getIndexTable = function (column) {
  const filepath = this._indexTablePath(column);
  return JSON.parse(fs.readFileSync(filepath));
};

Table.prototype.drop = function () {
  rmrf.sync(this._folder);
  rmrf.sync(this._indexFolder);
};

Table.prototype.erase = function (id) {
  return this.write(id, undefined);
};

Table.prototype._updateIndexes = function (id, prevRow, nextRow) {
  const columns = []
  .concat(Object.keys(prevRow || {}))
  .concat(Object.keys(nextRow || {}))
  .forEach(column => {
    const prevVal = prevRow && prevRow[column];
    const nextVal = nextRow && nextRow[column];
    if (prevVal === nextVal || !this.hasIndexTable(column)) return;
    const indexTable = this.getIndexTable(column);
    if (prevRow) {
      indexTable[prevVal] = indexTable[prevVal].filter(indexedId => {
        return indexedId !== id;
      });
    }
    if (nextRow) {
      indexTable[nextVal] = indexTable[nextVal] || [];
      indexTable[nextVal].push(id);
    }
    const filepath = this._indexTablePath(column);
    fs.writeFileSync(filepath, JSON.stringify(indexTable));
  });
};

Table.prototype.write = function (id, nextRow, indentation = null) {
  const prevRow = this.read(id);
  const filepath = this._filepath(id);
  if (nextRow) {
    const contents = JSON.stringify(nextRow, null, indentation);
    fs.writeFileSync(filepath, contents);
  } else {
    fs.unlinkSync(filepath);
  }
  this._updateIndexes(id, prevRow, nextRow);
  return nextRow;
};

Table.prototype.update = function (id, changes) {
  const currRow = this.read(id);
  const nextRow = Object.assign(currRow, changes);
  return this.write(id, nextRow);
};

Table.prototype.insert = function (row) {
  let nextId = 1 + this.getRowIds().reduce((a, b) => Math.max(a, b), -1);
  nextId = `000${nextId}`.slice(-4);
  row.id = nextId;
  return this.write(nextId, row);
};

Table.prototype.removeIndexTable = function (column) {
  const filepath = this._indexTablePath(column);
  rmrf.sync(filepath);
};

module.exports = Table;