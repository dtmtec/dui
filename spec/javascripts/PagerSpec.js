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

      expect(pager.getItems().length).toEqual(9)
    })

    it("returns the correct item value", function() {
      pager.set({ itemCount: 10, perPage: 2, currentPage: 1 })

      expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', 1, 2, 3, 4, 5, 'Next', 'Last'])
    })

    it("returns the correct item real value", function() {
      pager.set({ itemCount: 10, perPage: 2, currentPage: 1 })
      expect(pager.getItems().pluck('realValue')).toEqual([1, undefined, 1, 2, 3, 4, 5, 2, 5])

      pager.set({ itemCount: 10, perPage: 2, currentPage: 4 })
      expect(pager.getItems().pluck('realValue')).toEqual([1, 3, 1, 2, 3, 4, 5, 5, 5])

      pager.set({ itemCount: 10, perPage: 2, currentPage: 5 })
      expect(pager.getItems().pluck('realValue')).toEqual([1, 4, 1, 2, 3, 4, 5, undefined, 5])
    })

    it("returns the correct disabled pager item", function() {
      pager.set({ itemCount: 10, perPage: 2, currentPage: 4 })
      expect(pager.getItems().pluck('disabled')).toEqual([false, false, false, false, false, true, false, false, false])

      pager.set({ itemCount: 10, perPage: 2, currentPage: 1 })
      expect(pager.getItems().pluck('disabled')).toEqual([true, true, true, false, false, false, false, false, false])

      pager.set({ itemCount: 10, perPage: 2, currentPage: 5 })
      expect(pager.getItems().pluck('disabled')).toEqual([false, false, false, false, false, false, true, true, true])
    })

    describe("when there are many pages", function () {
      it("returns at most 4 previous pages and 4 next pages and ellipis where needed", function () {
        pager.set({ itemCount: 2, perPage: 2, currentPage: 1 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([true, true, true, true])
        expect(pager.getItems().pluck('realValue')).toEqual([1, undefined, undefined, 1])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 1 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', 1, 2, 3, 4, 5, '&hellip;', 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([true, true, true, false, false, false, false, true, false, false])
        expect(pager.getItems().pluck('realValue')).toEqual([1, undefined, 1, 2, 3, 4, 5, undefined, 2, 12])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 2 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', 1, 2, 3, 4, 5, 6, '&hellip;', 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([false, false, false, true, false, false, false, false, true, false, false])
        expect(pager.getItems().pluck('realValue')).toEqual([1, 1, 1, 2, 3, 4, 5, 6, undefined, 3, 12])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 4 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', 1, 2, 3, 4, 5, 6, 7, 8, '&hellip;', 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([false, false, false, false, false, true, false, false, false, false, true, false, false])
        expect(pager.getItems().pluck('realValue')).toEqual([1, 3, 1, 2, 3, 4, 5, 6, 7, 8, undefined, 5, 12])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 5 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', 1, 2, 3, 4, 5, 6, 7, 8, 9, '&hellip;', 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([false, false, false, false, false, false, true, false, false, false, false, true, false, false])
        expect(pager.getItems().pluck('realValue')).toEqual([1, 4, 1, 2, 3, 4, 5, 6, 7, 8, 9, undefined, 6, 12])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 6 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', '&hellip;', 2, 3, 4, 5, 6, 7, 8, 9, 10, '&hellip;', 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([false, false, true, false, false, false, false, true, false, false, false, false, true, false, false])
        expect(pager.getItems().pluck('realValue')).toEqual([1, 5, undefined, 2, 3, 4, 5, 6, 7, 8, 9, 10, undefined, 7, 12])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 7 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', '&hellip;', 3, 4, 5, 6, 7, 8, 9, 10, 11, '&hellip;', 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([false, false, true, false, false, false, false, true, false, false, false, false, true, false, false])
        expect(pager.getItems().pluck('realValue')).toEqual([1, 6, undefined, 3, 4, 5, 6, 7, 8, 9, 10, 11, undefined, 8, 12])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 8 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', '&hellip;', 4, 5, 6, 7, 8, 9, 10, 11, 12, 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([false, false, true, false, false, false, false, true, false, false, false, false, false, false])
        expect(pager.getItems().pluck('realValue')).toEqual([1, 7, undefined, 4, 5, 6, 7, 8, 9, 10, 11, 12, 9, 12])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 10 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', '&hellip;', 6, 7, 8, 9, 10, 11, 12, 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([false, false, true, false, false, false, false, true, false, false, false, false])
        expect(pager.getItems().pluck('realValue')).toEqual([1, 9, undefined, 6, 7, 8, 9, 10, 11, 12, 11, 12])

        pager.set({ itemCount: 24, perPage: 2, currentPage: 12 })
        expect(pager.getItems().pluck('value')).toEqual(['First', 'Previous', '&hellip;', 8, 9, 10, 11, 12, 'Next', 'Last'])
        expect(pager.getItems().pluck('disabled')).toEqual([false, false, true, false, false, false, false, true, true, true])
        expect(pager.getItems().pluck('realValue')).toEqual([1, 11, undefined, 8, 9, 10, 11, 12, undefined, 12])
      })
    })
  })
})