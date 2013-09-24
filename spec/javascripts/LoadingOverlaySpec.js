describe("LoadingOverlay", function() {
  var element, overlayElement

  beforeEach(function() {
    loadFixtures('loading_overlay.html')
    element = $('.element').loadingOverlay()
  });

  it("adds an loading-overlay class to the element", function() {
    expect(element.hasClass('loading-overlay')).toBeTruthy()
  });

  it("does not activate the overlay initially", function() {
    expect(element.hasClass('active-overlay')).toBeFalsy()
  });

  describe("#show", function() {
    it("activates the overlay", function() {
      $('.element').loadingOverlay('show')

      expect(element.hasClass('active-overlay')).toBeTruthy()
    });
  });

  describe("#hide", function() {
    beforeEach(function() {
      $('.element').loadingOverlay('show')
    });

    it("deactivates the overlay", function() {
      $('.element').loadingOverlay('hide')

      expect(element.hasClass('active-overlay')).toBeFalsy()
    });
  });
});
