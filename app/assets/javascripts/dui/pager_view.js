var PagerView = Backbone.View.extend({
  tagName: 'div',
  className: 'pagination',

  events: {
    'click li a': 'paginate'
  },

  render: function() {
    this.clearEl()

    this.$el.append('<ul>')

    this.model.getItems().each(function(item) {
      var pagerItemView = new PagerItemView({ model: item })
      this.$('ul').append(pagerItemView.render().$el)
    }, this)

    return this
  },

  clearEl: function() {
    this.$el.html('')
  },

  paginate: function(e) {
    var currentPage = $(e.currentTarget).data('real-value')

    this.model.set({ currentPage: parseInt(currentPage) })

    return false
  }
})