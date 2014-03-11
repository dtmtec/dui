describe("ListingView", function() {
  var view, listing, orderableListingWrapper,
      paginableListingWrapper, paginationContainerEl

  beforeEach(function() {
    LoadingOverlay.fadeDuration = 10

    loadFixtures('listing_view.html')

    jasmine.Clock.useMock()
    jasmine.Ajax.useMock()

    listing                 = $('.listing-wrapper')
    orderableListingWrapper = $('.listing-wrapper-ordered')
    paginableListingWrapper = $('.listing-wrapper-paginated')

    paginationContainerEl = $('.pagination-container')
  });

  describe("A ListingView with search", function() {
    it("defines the term attribute on the model after the input value changes", function() {
      var inputField = $('.search-field')

      view = new ListingView({ el: listing, searchEl: inputField })

      inputField.val('anything').trigger('keyup')
      jasmine.Clock.tick(300)

      expect(view.model.get('term')).toEqual('anything')
    })
  });

  describe("A ListingView with pagination", function() {
    describe("when the listing model is sync", function() {
      it("reconfigures the pager", function() {
        view = new ListingView({
          el: paginableListingWrapper,
          paginationContainerEl: paginationContainerEl
        })

        spyOn(view, 'reconfigurePager')

        view.model.trigger('sync', view.model, 'some data')

        expect(view.reconfigurePager).toHaveBeenCalled()
      })
    })
  })

  describe("A ListingView with ordenation", function() {
    describe("when ListingView has initial data", function() {

      it("starts model with data-initial-listing-data", function() {
        view = new ListingView({ el: orderableListingWrapper })

        expect(view.model.get('order_field')).toEqual('parameterized-name')
        expect(view.model.get('order_direction')).toEqual('desc')
      })

      it("adds order classes to order element", function() {
        view = new ListingView({ el: orderableListingWrapper })

        var orderElement = $('[data-order=parameterized-name]')

        expect(orderElement.hasClass('selected')).toBeTruthy()
        expect(orderElement.hasClass('desc')).toBeTruthy()
      })
    });

  });

  describe("when reloading", function() {
    it("fetchs the listing model", function() {
      var data = '<table><tbody><tr><td>some listing data</td></tr></tbody></table>'

      view = new ListingView({ el: listing })
      spyOn(view.model, 'fetchList')
      view.reload()
      expect(view.model.fetchList).toHaveBeenCalled()
    });
  });

  describe('when a request to reload is made', function () {
    it("displays an overlay over the listing", function() {
      view = new ListingView({ el: listing })
      view.model.trigger('request')

      expect(listing.hasClass('loading-overlay')).toBeTruthy()
      expect(listing.hasClass('active-overlay')).toBeTruthy()
    });
  });

  describe('when the list is reloaded', function () {
    it("hides the overlay", function() {
      view = new ListingView({ el: listing })

      view.model.trigger('request')
      view.model.trigger('sync', view.model, listing.find('table').html())

      expect(listing.hasClass('active-overlay')).toBeFalsy()
    });

    it("does not close the feedback message", function() {
      var feedbackView = new FeedbackView({el: $('.feedback')})
      view = new ListingView({ el: listing, feedbackView: feedbackView })
      spyOn(feedbackView, 'close')

      view.model.trigger('request')
      view.model.trigger('sync', view.model, listing.find('table').html())

      expect(feedbackView.close).not.toHaveBeenCalled()
    });

    it("triggers a 'complete' event", function() {
      var called = false

      view = new ListingView({ el: listing })
      view.on('complete', function(){ called = true })

      view.model.trigger('request')
      view.model.trigger('sync', view.model, listing.find('table').html())

      expect(called).toBeTruthy()
    });

    describe("and the feedback view is showing a listing error", function () {
      it("closes the feedback message", function() {
        var feedbackView = new FeedbackView({el: $('.feedback')})
        view = new ListingView({ el: listing, feedbackView: feedbackView })
        spyOn(feedbackView, 'close')

        // renders the error message
        view.model.trigger('request')
        view.model.trigger('error', view.model, { statusText: 'internal-server-error' })

        // reloads the list, successfully, thus we need to remove the error message
        view.model.trigger('request')
        view.model.trigger('sync', view.model, listing.find('table').html()) // now

        expect(feedbackView.close).toHaveBeenCalled()
      });

      it("does not closes the feedback message after a second sync", function() {
        var feedbackView = new FeedbackView({el: $('.feedback')})
        view = new ListingView({ el: listing, feedbackView: feedbackView })
        spyOn(feedbackView, 'close')

        // renders the error message
        view.model.trigger('request')
        view.model.trigger('error', view.model, { statusText: 'internal-server-error' })

        // reloads the list, successfully, thus we need to remove the error message
        view.model.trigger('request')
        view.model.trigger('sync', view.model, listing.find('table').html()) // now

        // reloads the list again, successfully, no need to remove the error message now
        view.model.trigger('request')
        view.model.trigger('sync', view.model, '<tbody></tbody>') // now

        expect(feedbackView.close.calls.length).toEqual(1)
      });
    })
  });

  describe('when there is an error while reloading list', function () {
    var feedbackView

    beforeEach(function (done) {
      feedbackView = new FeedbackView({el: $('.feedback')})
    });

    describe('and it is an abort', function () {
      it("does not hides the overlay", function() {
        view = new ListingView({ el: listing, feedbackView: feedbackView })
        view.model.trigger('request')
        view.model.trigger('error', view.model, { statusText: 'abort' })

        expect(listing.hasClass('active-overlay')).toBeTruthy()
      });

      it("does not triggers a 'complete' event", function() {
        var called = false

        view = new ListingView({ el: listing, feedbackView: feedbackView })
        view.on('complete', function(){ called = true })

        view.model.trigger('request')
        view.model.trigger('error', view.model, { statusText: 'abort' })


        expect(called).toBeFalsy()
      });

      it("does not render a feedback message", function() {
        spyOn(feedbackView, 'render')

        view = new ListingView({ el: listing, feedbackView: feedbackView })

        view.model.trigger('request')
        view.model.trigger('error', view.model, { statusText: 'abort' })

        expect(feedbackView.render).not.toHaveBeenCalled()
      });
    });

    describe('and it is not an abort', function () {
      it("hides the overlay", function() {
        view = new ListingView({ el: listing, feedbackView: feedbackView })
        view.model.trigger('request')
        view.model.trigger('error', view.model, { statusText: 'internal-server-error' })

        expect(listing.hasClass('active-overlay')).toBeFalsy()
      });

      it("triggers a 'complete' event", function() {
        var called = false

        view = new ListingView({ el: listing, feedbackView: feedbackView })
        view.on('complete', function(){ called = true })

        view.model.trigger('request')
        view.model.trigger('error', view.model, { statusText: 'internal-server-error' })


        expect(called).toBeTruthy()
      });

      it("renders a feedback message", function() {
        spyOn(feedbackView, 'render')

        view = new ListingView({ el: listing, feedbackView: feedbackView })

        view.model.trigger('request')
        view.model.trigger('error', view.model, { statusText: 'internal-server-error' })

        expect(feedbackView.render).toHaveBeenCalledWith(listing.data('error-message'), 'alert-error', true)
      });
    });
  });
});

describe("DestroyableListingView", function() {
  var view, listing

  beforeEach(function() {
    LoadingOverlay.fadeDuration = 10
    loadFixtures('listing_view.html')
    jasmine.Ajax.useMock()

    listing = $('.listing-wrapper')
  });

  it("is a ListingView", function() {
    expect(new DestroyableListingView({el: listing})).toBeAnInstanceOf(ListingView)
  });

  it("has a ConfirmableModalView", function() {
    view = new DestroyableListingView({el: listing})
    expect(view.confirmableModalView).toBeAnInstanceOf(ConfirmableModalView)
  });

  it("has a ConfirmableView", function() {
    view = new DestroyableListingView({el: listing})
    expect(view.confirmableView).toBeAnInstanceOf(ConfirmableView)
  });

  it("has a configured with the ConfirmableModalView", function() {
    view = new DestroyableListingView({el: listing})
    expect(view.confirmableView.modal).toBeAnInstanceOf(ConfirmableModalView)
  });

  it("uses the same listing element to the ConfirmableView", function() {
    view = new DestroyableListingView({el: listing})
    expect(view.confirmableView.el).toBe(view.el)
  });

  it("reloads the list when confirmable view is confirmed", function() {
    var data = '<table><tbody><tr><td>some listing data</td></tr></tbody></table>'

    view = new DestroyableListingView({el: listing})
    spyOn(view.model, 'fetchList')
    view.confirmableView.trigger('confirmable:confirmed')

    expect(view.model.fetchList).toHaveBeenCalled()
  });

  describe("when customizing the modal", function() {
    it("passes these options to the ConfirmableModalView", function() {
      view = new DestroyableListingView({ el: listing, modalOptions: { content: 'modal-content' } })
      expect(view.confirmableModalView.options.content).toBe('modal-content')
    });
  });
});
