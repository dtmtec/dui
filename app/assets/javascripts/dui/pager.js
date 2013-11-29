var Pager = Backbone.Model.extend({
  defaults: function () {
    return {
      displayedPages: 4,
      current_page: 1,
      items: new Backbone.Collection,
      labels: { first: 'First', previous: 'Previous', ellipsis: '&hellip;', next: 'Next', last: 'Last' }
    }
  },

  totalPageCount: function() {
    if (this.get('per_page') === 0) {
      return 0
    } else if (_(this.get('item_count')).isUndefined()) {
      return 0
    } else {
      return Math.ceil(this.get('item_count') / this.get('per_page'))
    }
  },

  nextPage: function() {
    if (this.get('current_page') < this.totalPageCount()) {
      return this.get('current_page') + 1
    }
  },

  previousPage: function() {
    if (this.get('current_page') > 1) {
      return this.get('current_page') - 1
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

    if (this.shouldAddPreviousElipsis()) {
      this.addEllipis()
    }

    this.addNumbers()

    if (this.shouldAddNextElipsis()) {
      this.addEllipis()
    }

    this.addNextPage()
    this.addLastPage()
  },

  clearPagerItems: function() {
    this.get('items').reset()
  },

  addNumbers: function() {
    _(this.pageRange()).each(function(page) {
        this.get('items').add(new PagerItem({
          type: 'page',
          value: page,
          realValue: page,
          current: this.get('current_page') == page,
          disabled: this.isDisabled(page)
        }))
      }, this)
  },

  addEllipis: function () {
    this.get('items').add(new PagerItem({
      type: 'ellipsis',
      value: this.get('labels')['ellipsis'],
      disabled: true
    }))
  },

  addFirstPage: function() {
    this.get('items').add(new PagerItem({
      type: 'first',
      value: this.get('labels')['first'],
      realValue: 1,
      disabled: this.isDisabled('first')
    }))
  },

  addPreviousPage: function() {
    this.get('items').add(new PagerItem({
      type: 'previous',
      value: this.get('labels')['previous'],
      realValue: this.previousPage(),
      disabled: this.isDisabled('first')
    }))
  },

  addNextPage: function() {
    this.get('items').add(new PagerItem({
      type: 'next',
      value: this.get('labels')['next'],
      realValue: this.nextPage(),
      disabled: this.isDisabled('last')
    }))
  },

  addLastPage: function() {
    this.get('items').add(new PagerItem({
      type: 'last',
      value: this.get('labels')['last'],
      realValue: this.totalPageCount(),
      disabled: this.isDisabled('last')
    }))
  },

  pageRange: function () {
    var currentPage = this.get('current_page'),
        displayedPages = this.get('displayedPages'),
        start = Math.max(currentPage - displayedPages, 1),
        end   = Math.min(currentPage + displayedPages, this.totalPageCount()) + 1

    if (this.totalPageCount() == 1) {
      return []
    }

    return _.range(start, end)
  },

  shouldAddPreviousElipsis: function() {
    return this.get('current_page') > this.get('displayedPages') + 1
  },

  shouldAddNextElipsis: function() {
    return this.get('current_page') < this.totalPageCount() - this.get('displayedPages')
  },

  isDisabled: function(page) {
    if (_(page).isNumber()) {
      return this.get('current_page') === page
    } else {
      if (page ===  'first') {
        return _(this.previousPage()).isUndefined()
      } else if (page === 'last') {
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