function Plan () {
  this._joins = [];
}

Plan.prototype.fork = function () {
  const fork = Object.create(Plan.prototype);
  Object.keys(this).forEach(key => {
    fork[key] = typeof this[key].fork === 'function' ? this[key].fork() : this[key];
  });
  return fork;
};

Plan.prototype.setLimit = function (amount) {
  this._limit = amount;
};

Plan.prototype.withinLimit = function (rows) {
  if (this._limit === undefined) {
    return true;
  } else {
    return rows.length < this._limit;
  }
};

Plan.prototype.setSelected = function (columns) {
  this._selected = columns;
};

Plan.prototype.selectColumns = function (row) {
  if (this._selected === undefined) {
    return row;
  }
  const selectedRow = {};
  this._selected.forEach(function (column) {
    selectedRow[column] = row[column];
  });
  return selectedRow;
};

Plan.prototype.setCriteria = function (criteria) {
  this._criteria = criteria;
};

Plan.prototype.matchesRow = function (row) {
  if (this._criteria === undefined) {
    return true;
  }
  return Object.keys(this._criteria).every(column => {
    const val = row[column];
    const cond = this._criteria[column];
    if (typeof cond === 'function') {
      return cond(val);
    } else {
      return cond === val;
    }
  });
};

Plan.prototype.addJoin = function (foreignFql, rowMatcher) {
  this._joins.push({
    foreignFql,
    rowMatcher
  });
};

Plan.prototype.execJoins = function (ownRows, merge) {
  return this._joins.reduce(function (rows, join) {
    const foreignRows = join.foreignFql.get();
    const joinedRows = [];
    rows.forEach(function (row) {
      foreignRows.forEach(function (foreignRow) {
        if (join.rowMatcher(row, foreignRow)) {
          joinedRows.push(merge(row, foreignRow));
        }
      });
    });
    return joinedRows;
  }, ownRows);
};

Plan.prototype.setIndexedCriteria = function (indexedCriteria) {
  this._indexedCriteria = indexedCriteria;
};

Plan.prototype.getIndexedIds = function (table) {
  if (this._indexedCriteria === undefined || Object.keys(this._indexedCriteria).length === 0) {
    return table.getRowIds();
  }
  return Object.keys(this._indexedCriteria)
  .map(column => {
    const indexKey = this._indexedCriteria[column];
    const indexTable = table.getIndexTable(column);
    return indexTable[indexKey];
  })
  .reduce((rowIdsA, rowIdsB) => {
    return rowIdsA.filter(idA => rowIdsB.includes(idA));
  });
};

module.exports = Plan;