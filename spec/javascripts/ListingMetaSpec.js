describe("ListingMeta", function() {
  var listingMeta, called

  beforeEach(function() {
    called = false
    listingMeta = new ListingMeta
  })

  it("is a listing", function() {
    expect(listingMeta instanceof Listing).toBeTruthy()
  })

  describe("when a term is changed", function() {
    beforeEach(function() {
      listingMeta.set({ current_page: 4 })
    })

    it("resets the current page silently", function() {
      listingMeta.set({ term: 'something' })
      expect(listingMeta.get('current_page')).toEqual(1)
    })

    it("triggers a pager_reset event", function() {
      listingMeta.on('pager_reset', function () { called = true })
      listingMeta.set({ term: 'something' })
      expect(called).toBeTruthy()
    })
  })

  describe("when a filters are changed", function() {
    beforeEach(function() {
      listingMeta.set({ current_page: 4 })
    })

    it("resets the current page silently", function() {
      listingMeta.set({ filters: { some: 'filter' } })
      expect(listingMeta.get('current_page')).toEqual(1)
    })

    it("triggers a pager_reset event", function() {
      listingMeta.on('pager_reset', function () { called = true })
      listingMeta.set({ filters: { some: 'filter' } })
      expect(called).toBeTruthy()
    })

    it("fetchs the list", function() {
      listingMeta.on('fetch', function () { called = true })
      listingMeta.set({ filters: { some: 'filter' } })
      expect(called).toBeTruthy()
    })
  })

  describe("when toggling a filter", function() {
    describe("and it is not set", function() {
      it("sets it", function() {
        listingMeta.toggleFilters('aType', 'aValue')
        expect(listingMeta.get('filters')).toEqual({ aType: 'aValue' })
      })
    })

    describe("and it is set", function() {
      beforeEach(function () {
        listingMeta.set({ filters: { aType: 'aValue' } })
      })

      describe("with the same value", function() {
        it("unsets it", function() {
          listingMeta.toggleFilters('aType', 'aValue')
          expect(listingMeta.get('filters')).toEqual({})
        })
      })

      describe("with other value", function() {
        it("sets it with the new value", function() {
          listingMeta.toggleFilters('aType', 'otherValue')
          expect(listingMeta.get('filters')).toEqual({ aType: 'otherValue' })
        })
      })
    })

    describe("and there is another filter type set", function() {
      beforeEach(function () {
        listingMeta.set({ filters: { otherType: 'otherValue' } })
      })

      it("sets a new one, and keep the the other filter type", function() {
        listingMeta.toggleFilters('aType', 'aValue')
        expect(listingMeta.get('filters')).toEqual({ otherType: 'otherValue', aType: 'aValue' })
      })
    })
  })

  describe("when total is changed", function() {
    it("sets the item count to its value", function() {
      listingMeta.set({ total: 123 })
      expect(listingMeta.get('item_count')).toEqual(123)
    })
  })

  describe("when fetching list", function() {
    it("triggers a fetch event", function() {
      listingMeta.on('fetch', function () { called = true })
      listingMeta.fetchList()
      expect(called).toBeTruthy()
    })

    it("doesn't fetch model", function() {
      spyOn(listingMeta, "fetch")
      listingMeta.fetchList()
      expect(listingMeta.fetch).not.toHaveBeenCalled()
    })
  })
})
