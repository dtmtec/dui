var PagerItemView = Backbone.View.extend({
  tagName: 'li',

  initialize: function() {
    this.templates = {
      enabled:  $('<script type="text/html"><a href="#" data-real-value="{{realValue}}">{{{value}}}</a></script>'),
      disabled: $('<script type="text/html"><span class="disabled-pager-item">{{{value}}}</span></script>')
    }
  },

  render: function() {
    this.$el.html(this.templates[this.templateName()].mustache(this.model.toJSON()))
            .addClass('pager-item-' + this.model.get('type'))
            .toggleClass('active', this.model.get('current') == true)
            .toggleClass('pager-item-disabled', this.model.get('disabled'))

    return this
  },

  templateName: function() {
    return this.model.get('disabled') ? 'disabled' : 'enabled'
  }
})