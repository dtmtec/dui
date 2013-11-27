var Pager = Backbone.Model.extend({
  defaults: function () {
    return {
      perPage: 10,
      currentPage: 1,
      items: new Backbone.Collection
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

    this.addLeftArrow()
    this.addNumbers()
    this.addRightArrow()
  },

  clearPagerItems: function() {
    this.set('items', new Backbone.Collection)
  },

  addNumbers: function() {
    _(this.totalPageCount()).times(function(i) {
        this.get('items').add(new PagerItem({
          value: i + 1,
          realValue: i + 1,
          disabled: this.isDisabled(i) }))
      }, this)
  },

  addLeftArrow: function() {
    this.get('items').add(new PagerItem({
      value: '<',
      realValue: 1,
      disabled: this.isDisabled('<')
    }))
  },

  addRightArrow: function() {
    this.get('items').add(new PagerItem({
      value: '>',
      realValue: this.totalPageCount(),
      disabled: this.isDisabled('>')
    }))
  },

  isDisabled: function(i) {
    if (_(i).isNumber()) {
      return (i + 1) === this.get('currentPage')
    } else {
      if (i ===  '<') {
        return _(this.previousPage()).isUndefined()
      } else if (i === '>') {
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