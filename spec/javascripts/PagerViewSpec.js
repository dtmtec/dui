describe("PagerView", function() {
  var $paginationContainerEl, pagerLabels, model, view

  beforeEach(function() {
    loadFixtures('pager_view.html')

    $paginationContainerEl = $('.pagination-container')
    pagerLabels = $paginationContainerEl.data('labels')
    model = new Pager({ item_count: 10, per_page: 2 })
  })

  it("renders the correct number of pager items", function() {
    view  = new PagerView({
      model:  model
    })

    $paginationContainerEl.html(view.render().$el)

    expect($('li', $paginationContainerEl).length).toEqual(model.get('items').length)
  })

  it("renders with default labels", function() {
    view  = new PagerView({
      model:  model
    })

    $paginationContainerEl.html(view.render().$el)

    expect($('.pager-item-first    span').text()).toEqual(model.get('labels').first)
    expect($('.pager-item-previous span').text()).toEqual(model.get('labels').previous)

    expect($('.pager-item-next     a').text()).toEqual(model.get('labels').next)
    expect($('.pager-item-last     a').text()).toEqual(model.get('labels').last)
  })

  it("renders with custom labels", function() {
    view  = new PagerView({
      model:  model,
      labels: pagerLabels
    })

    $paginationContainerEl.html(view.render().$el)

    expect($('.pager-item-first    span').text()).toEqual(pagerLabels.first)
    expect($('.pager-item-previous span').text()).toEqual(pagerLabels.previous)

    expect($('.pager-item-next     a').text()).toEqual(pagerLabels.next)
    expect($('.pager-item-last     a').text()).toEqual(pagerLabels.last)
  })

  it("renders when the item count changes", function() {
    spyOn(PagerView.prototype, 'render')

    view  = new PagerView({
      model:  model,
      labels: pagerLabels
    })

    model.set('item_count', 4)

    expect(view.render).toHaveBeenCalled()
  })

  it("renders when the current page changes", function() {
    spyOn(PagerView.prototype, 'render')

    view  = new PagerView({
      model:  model,
      labels: pagerLabels
    })

    model.set('current_page', 2)

    expect(view.render).toHaveBeenCalled()
  })

  it("changes the current page when a pager item is clicked", function() {
    view  = new PagerView({
      model:  model
    })

    $paginationContainerEl.html(view.render().$el)

    expect(model.get('current_page')).toEqual(1)

    $('.pagination-container ul li:nth-child(5) a').trigger('click')

    expect(model.get('current_page')).toEqual(3)
  })

  describe("when the pager is at the first page", function() {
    it("disables the current page, the previous page and the first page", function() {
        view  = new PagerView({
        model:  model
      })

      $paginationContainerEl.html(view.render().$el)

      var disabledPagerItems = $('.disabled-pager-item', $paginationContainerEl)

      var firstPagerItem    = $('.pager-item-first       span')
      var previousPagerItem = $('.pager-item-previous    span')
      var currentPagerItem  = $('.pager-item-page.active span')

      expect(disabledPagerItems.length).toEqual(3)

      expect($(firstPagerItem).text()).toEqual('First')
      expect($(previousPagerItem).text()).toEqual('Previous')
      expect($(currentPagerItem).text()).toEqual('1')
    })
  })

  describe("when the pager is at the last page", function() {
    it("disables the current page, the next page and the last page", function() {
      view  = new PagerView({
      model:  model
      })

      $paginationContainerEl.html(view.render().$el)

      var disabledPagerItems = $('.disabled-pager-item', $paginationContainerEl)

      var firstPageItem    = disabledPagerItems[0]
      var previousPageItem = disabledPagerItems[1]
      var currentPageItem  = disabledPagerItems[2]

      expect(disabledPagerItems.length).toEqual(3)

      expect($(firstPageItem).text()).toEqual('First')
      expect($(previousPageItem).text()).toEqual('Previous')
      expect($(currentPageItem).text()).toEqual('1')
      model.set('current_page', 5)

      view  = new PagerView({
        model:  model
      })

      $paginationContainerEl.html(view.render().$el)

      var disabledPagerItems = $('.disabled-pager-item', $paginationContainerEl)

      var lastPagerItem    = $('.pager-item-last        span')
      var nextPagerItem    = $('.pager-item-next        span')
      var currentPagerItem = $('.pager-item-page.active span')

      expect(disabledPagerItems.length).toEqual(3)

      expect($(lastPagerItem).text()).toEqual('Last')
      expect($(nextPagerItem).text()).toEqual('Next')
      expect($(currentPagerItem).text()).toEqual('5')
    })
  })

  it("doesn't render when there is only one page", function() {
    model.set({ item_count: 1 })

    view  = new PagerView({
      model: model
    })

    $paginationContainerEl.html(view.render().$el)

    expect($paginationContainerEl.find('li').length).toEqual(0)
  })

  it("renders the correct pager class", function() {
    view  = new PagerView({
      model: model,
      size: 'large'
    })

    $paginationContainerEl.html(view.render().$el)
    expect($paginationContainerEl.find('ul').attr('class')).toEqual('pagination pagination-lg')

    view  = new PagerView({
      model: model,
      size: 'small'
    })

    $paginationContainerEl.html(view.render().$el)
    expect($paginationContainerEl.find('ul').attr('class')).toEqual('pagination pagination-sm')

    view  = new PagerView({
      model: model,
    })

    $paginationContainerEl.html(view.render().$el)
    expect($paginationContainerEl.find('ul').attr('class')).toEqual('pagination')
  })
})