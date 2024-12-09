function Plan () {}

// this is immutably-minded
Plan.prototype.fork = function () {
  const plan = new Plan();
  Object.assign(plan, this);
  return plan;
};

Plan.prototype.setLimit = function (amount) {
  this._rowLimit = amount;
};

Plan.prototype.withinLimit = function (rows) {
  if (!this.hasOwnProperty('_rowLimit')) return true;
  return rows.length < this._rowLimit;
};

Plan.prototype.setSelected = function (columns) {
  if (columns.includes('*')) delete this._selectedColumns;
  else this._selectedColumns = columns;
};

Plan.prototype.selectColumns = function (row) {
  if (!this.hasOwnProperty('_selectedColumns')) return row;
  const selected = {};
  this._selectedColumns.forEach(function (column) {
    selected[column] = row[column];
  });
  return selected;
};

Plan.prototype.setCriteria = function (criteria) {
  this._searchCriteria = criteria;
};

Plan.prototype.setIndexedCriteria = function (criteria) {
  this._indexedCriteria = criteria;
};

Plan.prototype.getStartingIds = function (table) {
  if (!this._indexedCriteria || !Object.keys(this._indexedCriteria).length) {
    return table.getRowIds();
  }
  const allIds = Object.keys(this._indexedCriteria)
  .map((column) => {
    const indexTableKey = this._indexedCriteria[column];
    const indexTable = table.getIndexTable(column);
    const idsArray = indexTable[indexTableKey];
    const idsSet = new Set(idsArray);
    return idsSet;
  });
  const jointIdSet = allIds.reduce(function (accumulatedIds, moreIds) {
    const jointSet = new Set();
    for (const id of accumulatedIds) {
      if (moreIds.has(id)) {
        jointSet.add(id);
      }
    }
    return jointSet;
  });
  return jointIdSet;
};

// Plan.prototype.matchesRow = function (row) {
//   // returns true if there are no criteria
//   if (!this.hasOwnProperty('_searchCriteria')) return true;
//   // or if every column in the row matches the corresponding criterion
//   const columns = Object.keys(this._searchCriteria);
//   const isMatch = columns.every(function (column) {
//     return this._searchCriteria[column] === row[column];
//   }, this); // <<= neat trick with many array methods
//   return isMatch;
// };

Plan.prototype.matchesRow = function (row) {
  // returns true if there are no criteria
  if (!this.hasOwnProperty('_searchCriteria')) return true;
  // or if every column in the row matches the corresponding criterion
  const columns = Object.keys(this._searchCriteria);
  const isMatch = columns.every((column) => {
    const condition = this._searchCriteria[column];
    if (typeof condition === 'function') {
      return condition(row[column]);
    } else {
      return condition === row[column];
    }
  });
  return isMatch;
};

module.exports = Plan;