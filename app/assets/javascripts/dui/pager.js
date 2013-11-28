var Pager = Backbone.Model.extend({
  defaults: function () {
    return {
      currentPage: 1,
      items: new Backbone.Collection,
      labels: { first: 'First', previous: 'Previous', next: 'Next', last: 'Last' }
    }
  },

  totalPageCount: function() {
    if (this.get('perPage') === 0) {
      return 0
    } else {
      return Math.ceil(this.get('itemCount') / this.get('perPage'))
    }
  },

  nextPage: function() {
    if (this.get('currentPage') < this.totalPageCount()) {
      return this.get('currentPage') + 1
    }
  },

  previousPage: function() {
    if (this.get('currentPage') > 1) {
      return this.get('currentPage') - 1
    }
  },

  getItems: function() {
    this.configurePagerItems()

    return this.get('items')
  },

  configurePagerItems: function() {
    this.clearPagerItems()

    this.addFirstPage()
    this.addPreviousPage()
    this.addNumbers()
    this.addNextPage()
    this.addLastPage()
  },

  clearPagerItems: function() {
    this.get('items').reset()
  },

  addNumbers: function() {
    _(this.totalPageCount()).times(function(i) {
        this.get('items').add(new PagerItem({
          value: i + 1,
          realValue: i + 1,
          disabled: this.isDisabled(i)
        }))
      }, this)
  },

  addFirstPage: function() {
    this.get('items').add(new PagerItem({
      value: this.get('labels')['first'],
      realValue: 1,
      disabled: this.isDisabled('first')
    }))
  },

  addPreviousPage: function() {
    this.get('items').add(new PagerItem({
      value: this.get('labels')['previous'],
      realValue: this.previousPage(),
      disabled: this.isDisabled('first')
    }))
  },

  addNextPage: function() {
    this.get('items').add(new PagerItem({
      value: this.get('labels')['next'],
      realValue: this.nextPage(),
      disabled: this.isDisabled('last')
    }))
  },

  addLastPage: function() {
    this.get('items').add(new PagerItem({
      value: this.get('labels')['last'],
      realValue: this.totalPageCount(),
      disabled: this.isDisabled('last')
    }))
  },

  isDisabled: function(i) {
    if (_(i).isNumber()) {
      return (i + 1) === this.get('currentPage')
    } else {
      if (i ===  'first') {
        return _(this.previousPage()).isUndefined()
      } else if (i === 'last') {
        return _(this.nextPage()).isUndefined()
      }
    }
  },

  shouldPaginate: function() {
    return this.totalPageCount() > 1
  },

  toJSON: function () {
    var attributes = _(this.attributes).clone()
    delete attributes['items']

    return attributes
  }
})