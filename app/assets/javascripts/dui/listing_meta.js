var ListingMeta = Listing.extend({
  initialize: function() {
    this.on('change:term change:filters', this.resetPage, this)
    this.on('change:total', this.syncItemCount, this)

    Listing.prototype.initialize.call(this)

    this.on('change:filters', this.fetchList, this)
  },

  toggleFilters: function (filterType, filterValue) {
    var currentFilters = this.get('filters') || {}
    var newFilters = _.clone(currentFilters)

    if (currentFilters[filterType] === filterValue) {
      newFilters = _(newFilters).omit(filterType)
    } else {
      newFilters[filterType] = filterValue
    }

    this.set({ filters: newFilters })
  },

  resetPage: function () {
    this.set({ current_page : 1 }, { silent: true })
    this.trigger('pager_reset')
  },

  syncItemCount: function() {
    this.set('item_count', this.get('total'))
  },

  fetchList: function(model, value) {
    this.trigger('fetch')
  }
})
