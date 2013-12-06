describe("Listing", function() {
  beforeEach(function() {
    listing = new Listing({ order_field: 'test', order_direction: 'desc' })
    listing.url = '/test'
  })

  describe("the model events", function() {
    it("calls fetchList when the term changes", function() {
      spyOn(Listing.prototype, 'fetchList')
      var listing = new Listing()

      listing.set('term', 'a term filter')
      expect(listing.fetchList).toHaveBeenCalled()
    })

    it("calls fetchList when the current_page changes", function() {
      spyOn(Listing.prototype, 'fetchList')
      var listing = new Listing()

      listing.set('current_page', 2)
      expect(listing.fetchList).toHaveBeenCalled()
    })

    it("calls fetchList when the order_field changes", function() {
      spyOn(Listing.prototype, 'fetchList')
      var listing = new Listing()

      listing.set('order_field', 'name')
      expect(listing.fetchList).toHaveBeenCalled()
    })

    it("calls fetchList when the order_direction changes", function() {
      spyOn(Listing.prototype, 'fetchList')
      var listing = new Listing()

      listing.set('order_direction', 'asc')
      expect(listing.fetchList).toHaveBeenCalled()
    })

    it("doesn't call fetchList when the items changes", function() {
      spyOn(Listing.prototype, 'fetchList')
      var listing = new Listing()

      listing.set('items', [])
      expect(listing.fetchList).not.toHaveBeenCalled()
    })
  })

  describe("changeOrder", function() {
    describe("when change order field", function () {
      it("changes order field and order direction", function() {
        listing.changeOrder('other_test')

        expect(listing.get('order_field')).toEqual('other_test')
        expect(listing.get('order_direction')).toEqual('asc')

        expect(listing.hasChanged('order_field')).toBeTruthy()
        expect(listing.hasChanged('order_direction')).toBeTruthy()
      })
    })

    describe("when not change order field", function () {
      it("changes only order direction", function () {
        listing.changeOrder('test')

        expect(listing.get('order_field')).toEqual('test')
        expect(listing.get('order_direction')).toEqual('asc')

        expect(listing.hasChanged('order_field')).toBeFalsy()
        expect(listing.hasChanged('order_direction')).toBeTruthy()
      })
    })
  })
})