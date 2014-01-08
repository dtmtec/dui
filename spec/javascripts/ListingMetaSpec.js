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
