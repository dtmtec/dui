beforeEach(function() {
  this.addMatchers({
    toBeAnInstanceOf: function (expected) {
      return this.actual instanceof expected
    },

    toBeBlank: function () {
      return _(this.actual).isUndefined() || _(this.actual).isEmpty()
    }
  });
});
