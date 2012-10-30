var MultiSelect = Backbone.Model.extend({
  defaults: {
    available: [],
    selected: []
  },

  initialize: function () {
    _(this).bindAll()

  },

  reset: function (selected) {
    this.set({selected: selected, available: []})
  },

  fetchAvailable: function (params) {
    this.abort()
    this.set({available: []})
    this.trigger('multi-select:loading')

    this.currentAjax = $.ajax({
      url: this.availableUrl,
      data: params,
      dataType: 'json',
      success: this.availableLoaded,
      error: this.availableError,
      complete: this.availableComplete
    })
  },

  abort: function () {
    if (this.currentAjax) {
      this.currentAjax.abort()
      this.currentAjax = undefined
    }
  },

  availableLoaded: function (data) {
    this.set('available', this.withoutSelected(data))
  },

  availableError: function (jqXHR) {
    this.trigger('multi-select:load-error', jqXHR)
  },

  availableComplete: function () {
    this.trigger('multi-select:loaded')
  },

  withoutSelected: function (data) {
    var selectedValues = _(this.get('selected')).pluck('value')

    return _(data).select(function (item) {
      return !_(selectedValues).include(item.value)
    })
  }
})