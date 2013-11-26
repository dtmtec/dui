var PagerItemView = Backbone.View.extend({
  tagName: 'li',

  initialize: function() {
    this.templates = {
      enabled:  $('<script type="text/html"><a href="#" data-real-value="{{realValue}}">{{value}}</a></script>'),
      disabled: $('<script type="text/html"><span>{{value}}</span></script>')
    }
  },

  render: function() {
    var template = this.model.get('disabled') ? 'disabled' : 'enabled'

    this.$el.html(this.templates[template].mustache(this.model.toJSON()))

    return this
  }
})