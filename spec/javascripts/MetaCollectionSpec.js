describe("Backbone.MetaCollection", function() {
  var collection, meta

  beforeEach(function() {
    collection = new Backbone.MetaCollection
  })

  it("uses a Backbone.Model as its meta object", function() {
    expect(collection.meta instanceof Backbone.Model).toBeTruthy()
  })

  it("triggers any event on the meta object prefixed by 'meta:'", function() {
    var called = false

    collection.on('meta:foo', function () { called = true })
    collection.meta.trigger('foo')

    expect(called).toBeTruthy()
  })

  describe("when a different model is specified as meta", function() {
    var MyModel = Backbone.Model.extend({}),
        MyCollection = Backbone.MetaCollection.extend({ metaModel: MyModel })

    beforeEach(function() {
      collection = new MyCollection
    })

    it("uses it", function() {
      expect(collection.meta instanceof MyModel).toBeTruthy()
    })
  })

  describe("when setting parsed data for the collection", function() {
    describe("and a meta key is present", function() {
      it("will set data in the meta key to the meta object", function() {
        collection.set({ my_models: [], meta: { foo: 'bar' } }, { parse: true })

        expect(collection.meta.attributes).toEqual({ foo: 'bar' })
      })

      describe("when a rootKey is set", function() {
        it("sets data for the collection under it", function() {
          collection.rootKey = 'my_models'
          collection.set({ my_models: [{ some: 'attr' }], meta: { foo: 'bar' } }, { parse: true })

          expect(collection.length).toEqual(1)
          expect(collection.at(0).attributes).toEqual({ some: 'attr' })
        })
      })

      describe("when a rootKey is not set", function() {
        it("sets data for the collection", function() {
          collection.set({ my_models: [{ some: 'attr' }], meta: { foo: 'bar' } }, { parse: true })

          expect(collection.length).toEqual(0)
        })
      })
    })

    describe("and a meta key is not present", function() {
      it("will not set data to the meta object", function() {
        collection.meta.set({ some: 'key' })

        collection.set({ my_models: [] }, { parse: true })

        expect(collection.meta.attributes).toEqual({ some: 'key' })
      })
    })
  })
})
