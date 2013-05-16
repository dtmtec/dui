describe("ConfirmableModalView", function() {
  var view

  beforeEach(function() {
    view = new ConfirmableModalView()
  });

  afterEach(function () {
    $('.modal, .modal-backdrop').remove()
  })

  describe("when it is rendered", function() {
    it("appends a #confirmable-modal to the body", function() {
      view.render()

      waitsFor(function () {
        return $('#confirmable-modal').is(':visible')
      }, 500)

      runs(function () {
        expect($('#confirmable-modal')).toBeVisible()
      })
    });

    it("renders modal with default title, body and button labels", function() {
      view.render()

      waitsFor(function () {
        return $('#confirmable-modal').is(':visible')
      }, 500)

      runs(function () {
        expect($('#confirmable-modal').find('.modal-header h3').html()).toEqual(view.defaultLabels.title)
        expect($('#confirmable-modal').find('.modal-body').html()).toEqual(view.defaultLabels.body)
        expect($('#confirmable-modal').find('.modal-footer [data-dismiss]').text()).toEqual(view.defaultLabels.cancel)
        expect($('#confirmable-modal').find('.modal-footer .btn-danger').text()).toEqual(view.defaultLabels.confirm)
      })
    });

    describe("when there is already a #cofirmable-modal", function() {
      beforeEach(function() {
        $('body').append('<div id="confirmable-modal" class="modal fade hide"></div>')
      });

      it("does not add another", function() {
        view.render()

        waitsFor(function () {
          return $('#confirmable-modal').is(':visible')
        }, 500)

        runs(function () {
          expect($('#confirmable-modal').length).toEqual(1)
        })
      });
    });

    describe("and it is confirmed", function() {
      it("triggers a confirmable:confirm event", function() {
        var confirmed = false
        view.on('confirmable:confirm', function () {
          confirmed = true
        })

        view.render()

        waitsFor(function () {
          return $('#confirmable-modal').is(':visible')
        }, 500)

        runs(function () {
          $('#confirmable-modal').find('[data-confirmable-confirm]').click()

          expect(confirmed).toBeTruthy()
        })
      });
    });

    describe("and it is not confirmed", function() {
      it("triggers a confirmable:dismiss event", function() {
        var dismissed = false
        view.on('confirmable:dismiss', function () {
          dismissed = true
        })

        view.render()

        waitsFor(function () {
          return $('#confirmable-modal').is(':visible')
        }, 500)

        runs(function () {
          $('#confirmable-modal').find('[data-dismiss=modal]').click()

          expect(dismissed).toBeTruthy()
        })
      });
    });

    describe("with custom labels", function() {
      var labels = {
        title: "Custom Title",
        body: "<p>Custom Body</p>",
        cancel: "Custom Cancel",
        confirm: "Custom Confirm"
      }

      it("renders modal with default title, body and button labels", function() {
        view.render(labels)

        waitsFor(function () {
          return $('#confirmable-modal').is(':visible')
        }, 500)

        runs(function () {
          expect($('#confirmable-modal').find('.modal-header h3').html()).toEqual(labels.title)
          expect($('#confirmable-modal').find('.modal-body').html()).toEqual(labels.body)
          expect($('#confirmable-modal').find('.modal-footer [data-dismiss]').text()).toEqual(labels.cancel)
          expect($('#confirmable-modal').find('.modal-footer .btn-danger').text()).toEqual(labels.confirm)
        })
      });
    });

    describe("when a different template is given", function() {
      var template = '<h3>{{title}}</h3>{{{body}}}<a data-dismiss="modal">{{cancel}}</a><a class="btn-danger">{{confirm}}</a>'

      beforeEach(function() {
        view = new ConfirmableModalView({template: template})
      });

      it("renders the modal with the given template", function() {
        view.render()
        expect(view.$el.html()).toEqual($.mustache(template, view.defaultLabels))
      });
    });

    describe("when a content is given", function() {
      var content = '<h3>Title</h3> <p>Body that will not be templated, even when giving {{body}} or {{title}}</p>'

      beforeEach(function() {
        view = new ConfirmableModalView({content: content})
      });

      it("uses this content as is when rendering the modal", function() {
        view.render()
        expect(view.$el.html()).toEqual(content)
      });
    });

    describe("when it is rendered", function() {
      it("delegates events", function() {
        spyOn(view, "delegateEvents");
        view.render()
        expect(view.delegateEvents).toHaveBeenCalled()
      });
    });

    describe("when it is hidden", function() {
      it("undelegates events", function() {
        spyOn(view, "undelegateEvents");
        view.hide()
        expect(view.undelegateEvents).toHaveBeenCalled()
      });
    });
  });
});