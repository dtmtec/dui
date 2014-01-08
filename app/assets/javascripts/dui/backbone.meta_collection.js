(function (Backbone) {
  var MetaCollectionMixin = {
    parse: function (response) {
      this.meta.set(response.meta)

      return response[this.rootKey]
    }
  }

  Backbone.metaCollection = function (collection) {
    var MetaModel = collection.metaModel || Backbone.Model,
        meta      = new MetaModel()

    collection.meta = meta

    _(collection).extend(MetaCollectionMixin)

    collection.listenTo(meta, 'all', function (event, model, changed_collection, options) {
      collection.trigger('meta:' + event, model, changed_collection, options)
    })
  }

  Backbone.MetaCollection = Backbone.Collection.extend({
    initialize: function () {
      Backbone.metaCollection(this)
    }
  })
})(Backbone)

