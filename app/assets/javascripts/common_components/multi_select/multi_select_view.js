//= require common_components/movable
//= require common_components/searchable_field
//= require common_components/multi_select/multi_select

var MultiSelectView = Backbone.View.extend({
  itemTagName: 'li',
  containerTagName: 'ul',

  events: function() {
    return _({}).extend(
      this.eventsConfigurationForMove(),
      this.eventsConfigurationForMoveAll()
    )
  },

  initialize: function () {
    _(this).bindAll()

    this.configureElements()
    this.configureModel()
    this.configureMovable()
    this.configureSearch()
  },

  reset: function (params, selected) {
    this.params = params
    this.clearSearch()
    this.model.reset(_(selected).clone())
    this.model.fetchAvailable(params)
  },

  search: function (event, term) {
    var searchParams = _({term: term}).extend(this.params)
    this.model.fetchAvailable(searchParams)
  },

  clearSearch: function () {
    this.$searchField.trigger('searchable.clear');
  },

  abort: function () {
    this.$searchField.trigger('searchable.abort');
    this.model.abort()
  },

  render: function () {
    this.renderAvailable()
    this.renderSelected()
    this.trigger('render')
    return this
  },

  configureElements: function () {
    this.$availableContainer = this.$('.available ' + this.containerTagName)
    this.$selectedContainer  = this.$('.selected ' + this.containerTagName)

    this.$availableTemplate = this.$('.available script')
    this.$selectedTemplate  = this.$('.selected script')
  },

  configureModel: function () {
    this.model = this.model || new MultiSelect
    this.model.availableUrl = this.$('.available').data('url')

    this.model.on('multi-select:loading', this.showLoading, this)
    this.model.on('multi-select:loaded', this.hideLoading, this)
    this.model.on('multi-select:loaded', this.render, this)
  },

  configureMovable: function () {
    this.movable = new Movable(_(this.options).extend({
      available: {
        get: this.getAvailable,
        set: this.setAvailable,
        container: this.$availableContainer,
        render: this.renderedAvailable
      },
      selected: {
        get: this.getSelected,
        set: this.setSelected,
        container: this.$selectedContainer,
        render: this.renderedSelected
      }
    }));
  },

  configureSearch: function () {
    this.$searchField = $('input[name=search]');

    this.$searchField.searchableField()
      .on('searchable.search', this.search)
      .on('searchable.aborted', this.abort);
  },

  renderAvailable: function () {
    this.$availableContainer.html(this.renderedAvailable())
  },

  renderSelected: function () {
    this.$selectedContainer.html(this.renderedSelected())
  },

  renderedAvailable: function (data) {
    return this.$availableTemplate.mustache({items: data || this.getAvailable()})
  },

  renderedSelected: function (data) {
    return this.$selectedTemplate.mustache({items: data || this.getSelected()})
  },

  moveToSelected: function (event) {
    var element = $(event.currentTarget)

    element = element.is(this.itemTagName) ? element : element.parents(this.itemTagName)

    this.movable.moveToSelected(element)
    this.trigger('move:selected', element)
  },

  moveToAvailable: function (event) {
    var element = $(event.currentTarget)

    element = element.is(this.itemTagName) ? element : element.parents(this.itemTagName)

    this.movable.moveToAvailable(element)
    this.clearSearch()
    this.trigger('move:available', element)
  },

  moveAllToSelected: function (event) {
    this.movable.moveAllToSelected()
    this.trigger('moveAll:selected')
    return false
  },

  moveAllToAvailable: function (event) {
    this.movable.moveAllToAvailable()
    this.clearSearch()
    this.trigger('moveAll:available')
    return false
  },

  showLoading: function () {
    this.$availableContainer.html('').addClass('loading')
  },

  hideLoading: function () {
    this.$availableContainer.removeClass('loading')
  },

  getAvailable: function () {
    return this.model.get('available')
  },

  setAvailable: function (items) {
    return this.model.set('available', items)
  },

  getSelected: function () {
    return this.model.get('selected')
  },

  setSelected: function (items) {
    return this.model.set('selected', items)
  },

  eventsConfigurationForMove: function () {
    var availableSelector = 'click .available ' + this.itemTagName,
        selectedSelector  = 'click .selected '  + this.itemTagName,
        events            = {}

    events[availableSelector] = 'moveToSelected'
    events[selectedSelector]  = 'moveToAvailable'

    return events
  },

  eventsConfigurationForMoveAll: function () {
    return {
      'click .available .multi-select-all-button': 'moveAllToSelected',
      'click .selected .multi-select-all-button': 'moveAllToAvailable'
    }
  }
})