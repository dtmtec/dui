var ListingMeta = Listing.extend({
  initialize: function() {
    this.on('change:term change:filters', this.resetPage, this)
    this.on('change:total', this.syncItemCount, this)

    Listing.prototype.initialize.call(this)
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
