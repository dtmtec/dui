(function (window) {
  var $ = window.jQuery;

  function SearchableField(field) {
    this.field = $(field);
    this.field.data('search-term', '');
    this.closeButton = this.field.parent().find('.clear-search');

    this.setup();
  }

  SearchableField.prototype = {
    setup: function () {
      this.field.keyup(_(this.search).bind(this));

      this.field.on('searchable.clear', _(this.clear).bind(this));
      this.field.on('searchable.abort', _(this.abort).bind(this));

      this.closeButton.on('click', _(this.clear).bind(this));
    },

    search: function () {
      var term         = $.trim(this.field.val()),
          previousTerm = this.field.data('search-term');

      this.closeButton.toggle(term.length > 0);

      if (previousTerm !== term) {
        this.field.data('search-term', term);

        this.abort();
        this.timeoutId = setTimeout(_(this.load).bind(this), 300);
      }
    },

    load: function () {
      this.abort();
      this.field.trigger('searchable.search', this.field.data('search-term'));
    },

    clear: function () {
      var term = this.field.val();
      this.field.data('search-term', '');

      if (term && term.length > 0) {
        this.field.val('');
        this.load();
      }

      this.closeButton.hide();

      return false;
    },

    abort: function () {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;

        this.field.trigger('searchable.aborted');
      }
    }
  };

  window.SearchableField = SearchableField;

  window.jQuery.fn.searchableField = function () {
    return $(this).each(function () {
      new SearchableField(this);
    });
  };
})(window);