describe("LoadingOverlay", function() {
  var element, overlayElement

  beforeEach(function() {
    LoadingOverlay.fadeDuration = 10
    loadFixtures('loading_overlay.html')
    element = $('.element').loadingOverlay()
    overlayElement = element.parent().find('.loading-overlay')
  });

  it("creates an overlay element, appending it to the element's container", function() {
    expect(element.parent()).toContain('.loading-overlay')
  });

  it("hides the overlay element initially", function() {
    expect(overlayElement).toBeHidden()
  });

  it("does not hide the container element", function() {
    expect(element.parent()).toBeVisible()
  });

  describe("#show", function() {
    it("shows the overlay element", function() {
      runs(function () {
        $('.element').loadingOverlay('show')
      })

      waitsFor(function () {
        return overlayElement.is(':visible')
      }, "the overlay element to be shown", 100)

      runs(function () {
        expect(overlayElement).toBeVisible()
      })
    });

    it("configures the width of the overlay element to be equal to the element width", function() {
      $('.element').loadingOverlay('show')
      expect(overlayElement.width()).toEqual(element.width())
    });

    it("configures the height of the overlay element to be equal to the element height", function() {
      $('.element').loadingOverlay('show')
      expect(overlayElement.height()).toEqual(element.height())
    });

    it("configures the top of the overlay element to be equal to the element top", function() {
      $('.element').loadingOverlay('show')
      expect(overlayElement.position().top).toEqual(element.position().top)
    });

    it("configures the left of the overlay element to be equal to the element left", function() {
      $('.element').loadingOverlay('show')
      expect(overlayElement.position().left).toEqual(element.position().left)
    });
  });

  describe("#hide", function() {
    beforeEach(function() {
      $('.element').loadingOverlay('show')
    });

    it("hides the overlay element", function() {
      runs(function () {
        $('.element').loadingOverlay('hide')
      })

      waitsFor(function () {
        return overlayElement.is(':hidden')
      }, "the overlay element to be hidden", 100)

      runs(function () {
        expect(overlayElement).toBeHidden()
      })
    });
  });

  describe("when the window is resized", function() {
    beforeEach(function() {
      // jQuery can't calculate position if element is hidden
      overlayElement.show()
    });

    it("configures the width of the overlay element to be equal to the element width", function() {
      $(window).trigger('resize')
      expect(overlayElement.width()).toEqual(element.width())
    });

    it("configures the height of the overlay element to be equal to the element height", function() {
      $(window).trigger('resize')
      expect(overlayElement.height()).toEqual(element.height())
    });

    it("configures the top of the overlay element to be equal to the element top", function() {
      $(window).trigger('resize')
      expect(overlayElement.position().top).toEqual(element.position().top)
    });

    it("configures the left of the overlay element to be equal to the element left", function() {
      $(window).trigger('resize')
      expect(overlayElement.position().left).toEqual(element.position().left)
    });
  });
});