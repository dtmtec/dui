describe("Pager", function() {
  var pager

  beforeEach(function() {
    pager = new Pager()
  })

  describe("#totalPageCount", function() {
    it("returns the total page count", function() {
      pager.set({ itemCount: 0, perPage: 0, currentPage: 1 })
      expect(pager.totalPageCount()).toEqual(0)

      pager.set({ itemCount: 10, perPage: 0, currentPage: 1 })
      expect(pager.totalPageCount()).toEqual(0)

      pager.set({ itemCount: 10, perPage: 1, currentPage: 1 })
      expect(pager.totalPageCount()).toEqual(10)

      pager.set({ itemCount: 10, perPage: 2, currentPage: 1 })
      expect(pager.totalPageCount()).toEqual(5)

      pager.set({ itemCount: 10, perPage: 10, currentPage: 1 })
      expect(pager.totalPageCount()).toEqual(1)
    })
  })

  describe("#nextPage", function() {
    it("returns the next page", function() {
      pager.set({ itemCount: 0, perPage: 0, currentPage: 0 })
      expect(pager.nextPage()).toEqual(undefined)

      pager.set({ itemCount: 10, perPage: 5, currentPage: 1 })
      expect(pager.nextPage()).toEqual(2)

      pager.set({ itemCount: 10, perPage: 5, currentPage: 1 })
      expect(pager.nextPage()).toEqual(2)

      pager.set({ itemCount: 10, perPage: 2, currentPage: 3 })
      expect(pager.nextPage()).toEqual(4)

      pager.set({ itemCount: 10, perPage: 2, currentPage: 5 })
      expect(pager.nextPage()).toEqual(undefined)
    })
  })

  describe("#previousPage", function() {
    it("returns the next page", function() {
      pager.set({ itemCount: 0, perPage: 0, currentPage: 0 })
      expect(pager.nextPage()).toEqual(undefined)

      pager.set({ itemCount: 10, perPage: 5, currentPage: 1 })
      expect(pager.previousPage()).toEqual(undefined)

      pager.set({ itemCount: 10, perPage: 2, currentPage: 3 })
      expect(pager.previousPage()).toEqual(2)

      pager.set({ itemCount: 10, perPage: 2, currentPage: 5 })
      expect(pager.previousPage()).toEqual(4)

      pager.set({ itemCount: 1, perPage: 1, currentPage: 1 })
      expect(pager.previousPage()).toEqual(undefined)
    })
  })

  describe("#getItems", function() {
    it("returns the correct pager items count", function() {
      pager.set({ itemCount: 10, perPage: 2, currentPage: 1 })

      expect(pager.getItems().length).toEqual(7)
    })

    it("returns the correct item value", function() {
      pager.set({ itemCount: 10, perPage: 2, currentPage: 1 })

      expect(pager.getItems().pluck('value')).toEqual(['<', 1, 2, 3, 4, 5, '>'])
    })

    it("returns the correct disabled pager item", function() {
      pager.set({ itemCount: 10, perPage: 2, currentPage: 4 })

      expect(pager.getItems().pluck('disabled')).toEqual([false, false, false, false, true, false, false])
    })

    it("returns the correct disabled pager item", function() {
      pager.set({ itemCount: 10, perPage: 2, currentPage: 1 })

      expect(pager.getItems().pluck('disabled')).toEqual([true, true, false, false, false, false, false])
    })

    it("returns the correct disabled pager item", function() {
      pager.set({ itemCount: 10, perPage: 2, currentPage: 5 })

      expect(pager.getItems().pluck('disabled')).toEqual([false, false, false, false, false, true, true])
    })
  })
})