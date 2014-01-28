describe('ListingCollection', function () {
  var collection

  beforeEach(function () {
    collection = new ListingCollection
  });

  it('uses listing rootKey by default', function () {
    expect(collection.rootKey).toEqual('listing')
  });

  it('uses ListingMeta as metaModel by default', function () {
    expect(collection.metaModel).toEqual(ListingMeta)
  });

  describe('when meta:fetch is triggered', function () {
    it('fetches the collection', function () {
      spyOn(Backbone.MetaCollection.prototype, 'fetch')
      collection.trigger('meta:fetch')
      expect(Backbone.MetaCollection.prototype.fetch).toHaveBeenCalled()
    });
  });

  describe('fetch', function () {
    it('resets, parses and sends meta data as params by default', function () {
      var metaJSON = { some: 'data' }
      spyOn(collection.meta, 'toJSON').andReturn(metaJSON)

      spyOn(Backbone.MetaCollection.prototype, 'fetch')
      collection.fetch()
      expect(Backbone.MetaCollection.prototype.fetch).toHaveBeenCalledWith({
        reset: true,
        parse: true,
        data: metaJSON
      })
    });

    it('overrides defaults when passing options', function () {
      var metaJSON = { some: 'data' }
      spyOn(collection.meta, 'toJSON').andReturn(metaJSON)

      spyOn(Backbone.MetaCollection.prototype, 'fetch')
      collection.fetch({ reset: false, data: { my: 'data' } })
      expect(Backbone.MetaCollection.prototype.fetch).toHaveBeenCalledWith({
        reset: false,
        parse: true,
        data: { my: 'data' }
      })
    });

    it('stores the last request', function (done) {
      var request = {}
      spyOn(Backbone.MetaCollection.prototype, 'fetch').andReturn(request)
      collection.fetch()
      expect(collection.lastRequest).toEqual(request)
    });

    describe('when there is a previous request', function () {
      it('aborts it', function (done) {
        var lastRequest = { abort: function () {} }
        collection.lastRequest = lastRequest
        spyOn(Backbone.MetaCollection.prototype, 'fetch')
        spyOn(lastRequest, 'abort')
        collection.fetch()
        expect(lastRequest.abort).toHaveBeenCalled()
      });
    });
  });
});
