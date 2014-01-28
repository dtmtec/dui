var ListingCollection = Backbone.MetaCollection.extend({
  rootKey: 'listing',
  metaModel: ListingMeta,

  initialize: function () {
    Backbone.MetaCollection.prototype.initialize.call(this)

    this.on('meta:fetch', this.fetch, this)
  },

  fetch: function (options) {
    if (this.lastRequest) {
      this.lastRequest.abort()
    }

    this.lastRequest = Backbone.MetaCollection.prototype.fetch.call(this, _.extend({
      reset: true,
      parse: true,
      data: this.meta.toJSON()
    }, options))

    return this.lastRequest
  }
})
