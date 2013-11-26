describe("Listing", function() {
  beforeEach(function() {
    listing = new Listing({ order_field: 'test', order_direction: 'desc' })
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
    });

    describe("when not change order field", function () {
      it("changes only order direction", function () {
        listing.changeOrder('test')

        expect(listing.get('order_field')).toEqual('test')
        expect(listing.get('order_direction')).toEqual('asc')

        expect(listing.hasChanged('order_field')).toBeFalsy()
        expect(listing.hasChanged('order_direction')).toBeTruthy()
      })
    });
  });
})