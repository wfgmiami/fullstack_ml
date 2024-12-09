const Plan = require('./plan');

// composition pattern
function FQL (table, plan) {
  this._table = table; // query HAS a table, HAS a plan
  if (plan) {
    this._plan = plan;
  } else {
    this._plan = new Plan();
  }
}

FQL.prototype.fork = function () {
  return new FQL(this._table, this._plan.fork());
}

FQL.prototype.get = function () {
  const ids = this._plan.getStartingIds(this._table);
  const table = this._table;
  // arrow function inherit `this` from outer scope
  const rows = [];
  for (const id of ids) {
    if (!this._plan.withinLimit(rows)) break;
    const row = this._table.read(id);
    if (this._plan.matchesRow(row)) {
      const selectedRow = this._plan.selectColumns(row);
      rows.push(selectedRow);
    }
  }
  return rows;
};

FQL.prototype.count = function () {
  return this.get().length;
};

// // one approach: mutate own limit
// FQL.prototype.limit = function (amount) {
//   this._plan.setLimit(amount);
//   return this;
// };

// immutably-minded
// another approach: return new query with its own limit
FQL.prototype.limit = function (amount) {
  const fql = this.fork();
  fql._plan.setLimit(amount);
  return fql;
};

FQL.prototype.select = function (...columns) {
  const fql = this.fork();
  fql._plan.setSelected(columns);
  return fql;
};

FQL.prototype.where = function (criteria) {
  const fql = this.fork();
  const indexedCriteria = {};
  const nonIndexedCriteria = {};
  // look at each key
  Object.keys(criteria).forEach((column) => {
    // check if index table exists for that key
    if (this._table.hasIndexTable(column)) {
      indexedCriteria[column] = criteria[column];
    } else {
      nonIndexedCriteria[column] = criteria[column];
    }
  });
  fql._plan.setCriteria(nonIndexedCriteria);
  fql._plan.setIndexedCriteria(indexedCriteria);
  return fql;
};

module.exports = FQL;