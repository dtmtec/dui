(function (window) {
  function Movable(options) {
    this.tag         = options.tag         || 'li';
    this.sortByField = options.sortByField || 'value';
    this.sortOrder   = options.sortOrder   || 'asc';    // this only works if sortByField points to a number field
    this.available   = options.available;
    this.selected    = options.selected;
  };

  Movable.prototype = {
    moveToSelected: function (element) {
      this._move(element, this.available, this.selected);
    },

    moveAllToSelected: function () {
      this._moveAll(this.available, this.selected);
    },

    moveToAvailable: function (element) {
      this._move(element, this.selected, this.available);
    },

    moveAllToAvailable: function () {
      this._moveAll(this.selected, this.available);
    },

    _move: function (element, from, to) {
      var value         = element.data('value').toString(),
          fromValues    = _(from.get()).chain().pluck('value'),
          fromIndex     = fromValues.indexOf(value).value(),
          item          = from.get()[fromIndex],
          toValues      = _(to.get()).chain().pluck(this.sortByField),
          toIndex       = this._sortedIndexFor(toValues, item),
          maxToIndex    = toValues.value().length;

      if (fromIndex !== -1) {
        this._removeEmptyMessage(to);
        this._moveInMemory(from, fromIndex, to, toIndex);
        this._remove(element);
        this._renderWhenFromListIsEmpty(from);
        this._add(item, to, toIndex, maxToIndex);
      }
    },

    _sortedIndexFor: function (toValues, item) {
      var orderMultiplier = this.sortOrder == 'asc' ? 1 : -1;

      return toValues.sortedIndex(item[this.sortByField], function (value) {
        // only change order if value is a number
        return _(value).isNumber() ? value * orderMultiplier : value;
      }).value();
    },

    _moveAll: function (from, to) {
      if (!_(from).isEmpty()) {
        var items = to.get().concat(from.get().splice(0, from.get().length));

        items = _(items).sortBy(this.sortByField);

        if (this.sortOrder == 'desc') {
          items = items.reverse();
        }

        to.set(items);

        from.container.html(from.render());
        to.container.html(to.render());
      }
    },

    _removeEmptyMessage: function (to) {
      if (_(to.get()).isEmpty()) {
        to.container.html('');
      }
    },

    _moveInMemory: function (from, fromIndex, to, toIndex) {
      to.get().splice(toIndex, 0, from.get().splice(fromIndex, 1)[0]);
    },

    _remove: function (element) {
      element.remove();
    },

    _renderWhenFromListIsEmpty: function (from) {
      if (_(from.get()).isEmpty()) {
        from.container.html(from.render());
      }
    },

    _renderTemplatedItem: function (item, to) {
      return to.render([item]);
    },

    _add: function (item, to, toIndex, maxToIndex) {
      var templatedItem = this._renderTemplatedItem(item, to);

      if (toIndex == 0) {
        to.container.prepend(templatedItem);
      } else if (toIndex >= maxToIndex) {
        to.container.append(templatedItem);
      } else {
        to.container.find(this.tag).eq(toIndex).before(templatedItem);
      }
    }
  };

  window.Movable = Movable;
})(window);