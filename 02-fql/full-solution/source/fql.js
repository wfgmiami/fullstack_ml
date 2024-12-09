const Plan = require('./plan');

function FQL (table) {
  this._table = table;
  this.plan = new Plan();
}

FQL.prototype.fork = function () {
  const fork = Object.create(FQL.prototype);
  Object.keys(this).forEach(key => {
    fork[key] = typeof this[key].fork === 'function' ? this[key].fork() : this[key];
  });
  return fork;
};

FQL.merge = function (objA, objB) {
  return Object.assign({}, objA, objB);
};

FQL.prototype.count = function () {
  return this.get().length;
};

FQL.prototype._map = function (iter) {
  const ids = this.plan.getIndexedIds(this._table);
  const rows = [];
  for (const id of ids) {
    if (!this.plan.withinLimit(rows)) break;
    const initialRow = this._table.read(id);
    if (this.plan.matchesRow(initialRow)) {
      rows.push(iter(initialRow, id));
    }
  }
  return this.plan.execJoins(rows, FQL.merge);
};

FQL.prototype.get = function () {
  return this._map(row => {
    return this.plan.selectColumns(row);
  })
};

FQL.prototype.delete = function () {
  return this._map((row, id) => {
    this._table.erase(id);
    return this.plan.selectColumns(row);
  });
};

FQL.prototype.set = function (changes) {
  return this._map((row, id) => {
    const newRow = this._table.update(id, changes);
    return this.plan.selectColumns(newRow);
  });
};

FQL.prototype.limit = function (amount) {
  const fork = this.fork();
  fork.plan.setLimit(amount);
  return fork;
};

FQL.prototype.select = function (...columns) {
  const fork = this.fork();
  if (columns[0] !== '*') {
    fork.plan.setSelected(columns);
  }
  return fork;
};

FQL.prototype.where = function (criteria) {
  const fork = this.fork();
  const indexedCriteria = {};
  const scanCriteria = {};
  Object.keys(criteria).forEach(column => {
    const cond = criteria[column];
    if (typeof cond !== 'function' && fork._table.hasIndexTable(column)) {
      indexedCriteria[column] = cond;
    } else {
      scanCriteria[column] = cond;
    }
  });
  fork.plan.setIndexedCriteria(indexedCriteria);
  fork.plan.setCriteria(scanCriteria);
  return fork;
};

FQL.prototype.innerJoin = function (foreignFql, rowMatcher) {
  const fork = this.fork();
  fork.plan.addJoin(foreignFql, rowMatcher);
  return fork;
};

module.exports = FQL;