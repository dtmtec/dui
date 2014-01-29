describe('EnhancedListingView', function () {
  var view, $listing, $paginationContainerEl, $searchEl, feedbackView, collection

  beforeEach(function() {
    loadFixtures('listing_view.html')

    jasmine.Clock.useMock()

    $listing               = $('.enhanced-listing-wrapper')

    $searchEl              = $('.search-field')
    $paginationContainerEl = $('.pagination-container')
    feedbackView           = new FeedbackView({ el: $('.feedback') })
  });

  function createView(collectionClass) {
    return new EnhancedListingView({
      el: $listing,
      paginationContainerEl: $paginationContainerEl,
      searchEl: $searchEl,
      feedbackView: feedbackView,
      collectionClass: collectionClass,
      collectionViewClass: ListingTableCompositeView
    })
  }

  it('creates a ListingCollection for the view', function () {
    view = createView()

    expect(view.collection instanceof ListingCollection).toBeTruthy()
  });

  it('allows one to change which collection class is used', function (done) {
    var MyCollection = ListingCollection.extend({})

    view = createView(MyCollection)
    expect(view.collection instanceof MyCollection).toBeTruthy()
  });

  it('configures the listing collection URL to be the listing element data-url attribute', function () {
    expect(view.collection.url).toEqual($listing.data('url'))
  });

  it('creates a PagerView, rendering it inside the paginationContainerEl', function () {
    view = createView()

    expect(view.pagerView instanceof PagerView).toBeTruthy()
  });

  it('configures the meta object as model of PagerView', function (done) {
    view = createView()

    expect(view.pagerView.model).toEqual(view.collection.meta)
  });

  it('renders the PagerView $el and put it inside the pagination container', function (done) {
    view = createView()

    expect($paginationContainerEl.find('> .pagination')).toExist()
  });

  it('creates a collection view based on the given class', function (done) {
    view = createView()
    expect(view.collectionView instanceof Marionette.CollectionView).toBeTruthy()
  });

  it('renders the collection view inside the element', function (done) {
    view = createView()

    expect(view.$el.find('> ' + view.collectionView.tagName)).toExist()
  });

  it('passes the collection to the collection view', function (done) {
    view = createView()

    expect(view.collectionView.collection).toEqual(view.collection)
  });

  describe('when rendering', function () {
    it('renders the collection view', function (done) {
      view = createView()
      spyOn(view.collectionView, 'render')

      view.render()

      expect(view.collectionView.render).toHaveBeenCalled()
    });
  });

  describe('when the collection is reset', function () {
    beforeEach(function (done) {
      Backbone.Marionette.Renderer.render = function(template, data) {
        if ($(template).length == 0) {
          window.console && window.console.error("Could not found template: ", template, data)
          return ''
        }

        return $.mustache($(template).html(), data)
      }
    });

    it('renders the collection view items', function (done) {
      view = createView()
      view.render()

      view.collection.reset([{ name: "item 1", description: "desc 1" }, { name: "item 2", description: "desc 2" }])

      expect(view.$('table tbody tr').length).toEqual(2)
      expect(view.$('table tbody tr:nth-child(1) td:first-child')).toHaveText('item 1')
      expect(view.$('table tbody tr:nth-child(1) td:last-child')).toHaveText('desc 1')
      expect(view.$('table tbody tr:nth-child(2) td:first-child')).toHaveText('item 2')
      expect(view.$('table tbody tr:nth-child(2) td:last-child')).toHaveText('desc 2')
    });
  });

  describe('when the collection is being loaded', function () {
    it('displays a loading overlay', function (done) {
      view = createView()
      view.collection.trigger('request')

      expect(view.$el).toHaveClass('loading-overlay')
      expect(view.$el).toHaveClass('active-overlay')
    });
  });

  describe('when the collection is loaded', function () {
    it('displays a loading overlay', function (done) {
      view = createView()
      view.collection.trigger('request')
      view.collection.trigger('sync')

      expect(view.$el).not.toHaveClass('active-overlay')
    });

    it('closes the feedback view', function (done) {
      view = createView()
      spyOn(feedbackView, 'close')

      view.collection.trigger('request')
      view.collection.trigger('sync')

      expect(feedbackView.close).toHaveBeenCalled()
    });
  });

  describe('when there is an error while loading the collection', function () {
    describe('because the loading was aborted', function () {
      it('does not hide the loading overlay', function (done) {
        view = createView()

        view.collection.trigger('request')
        view.collection.trigger('error', view.collection, { statusText: 'abort' })

        expect(view.$el).toHaveClass('active-overlay')
      });

      it('does not render a feedback message', function (done) {
        view = createView()

        spyOn(feedbackView, 'render')

        view.collection.trigger('request')
        view.collection.trigger('error', view.collection, { statusText: 'abort' })

        expect(feedbackView.render).not.toHaveBeenCalled()
      });
    });

    describe('because of another type of error', function () {
      it('hides the loading overlay', function (done) {
        view = createView()

        view.collection.trigger('request')
        view.collection.trigger('error', view.collection, { statusText: 'internal-server-error' })

        expect(view.$el).not.toHaveClass('active-overlay')
      });

      it('renders a feedback error message', function (done) {
        view = createView()

        spyOn(feedbackView, 'render')

        view.collection.trigger('request')
        view.collection.trigger('error', view.collection, { statusText: 'internal-server-error' })

        expect(feedbackView.render).toHaveBeenCalledWith(view.$el.data('error-message'), 'alert-error', true)
      });
    });
  });

  describe('when typing on the search field element', function () {
    it('sets the term on the meta model', function (done) {
      jasmine.Clock.useMock()

      view = createView()

      $searchEl.val('some term').trigger('keyup')
      jasmine.Clock.tick(300)

      expect(view.collection.meta.get('term')).toEqual('some term')
    });
  });

  describe('when clicking on an element with [data-order] attribute', function () {
    it('changes the order on the meta collection', function (done) {
      view = createView()
      view.render()
      spyOn(view.collection.meta, 'changeOrder')

      view.$('[data-order=name]').click()

      expect(view.collection.meta.changeOrder).toHaveBeenCalledWith('name')

      view.$('[data-order=description]').click()

      expect(view.collection.meta.changeOrder).toHaveBeenCalledWith('description')
    });
  });

  describe('when the collection meta order field and direction is changed', function () {
    it('properly configure the headers cells', function (done) {
      view = createView()
      view.render()

      view.collection.meta.set({ order_field: 'name', order_direction: 'asc' })
      expect(view.$('[data-order=name]')).toHaveClass('selected asc')
      expect(view.$('[data-order=description]').attr('class')).toBeBlank()

      view.collection.meta.set({ order_field: 'description', order_direction: 'desc' })
      expect(view.$('[data-order=name]').attr('class')).toBeBlank()
      expect(view.$('[data-order=description]')).toHaveClass('selected desc')
    });
  });
});
