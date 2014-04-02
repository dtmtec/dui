describe("ConfirmableModalView", function() {
  var view

  beforeEach(function() {
    view = new ConfirmableModalView()
  });

  afterEach(function () {
    $('.modal, .modal-backdrop').remove()
  })

  describe("when it has a specific id", function() {
    var otherView;

    beforeEach(function() {
      otherView = new ConfirmableModalView({
        id: "other-confirmable-modal"
      })
    });

    describe("when it is initialized", function() {
      it("sets the element id with the specific id", function() {
        otherView.render()
        expect(otherView.$el).toHaveAttr("id", "other-confirmable-modal")
      });
    })

    describe("when it is rendered", function() {
      it("appends a #other-confirmable-modal to the body", function() {
        otherView.render()

        waitsFor(function() {
          return $('#other-confirmable-modal').is(':visible')
        }, 500)

        runs(function () {
          expect($('#other-confirmable-modal')).toBeVisible()
        })
      })
    })

    it("has a different element than the default view", function() {
      view.render()
      otherView.render()
      expect(view.$el).not.toEqual(otherView.$el)
    })

    describe("and there is an another view with the same specific id", function() {
      var anotherView

      beforeEach(function() {
        anotherView = new ConfirmableModalView({
          id: "other-confirmable-modal"
        })
      })

      it("uses the same element", function() {
        anotherView.render()
        otherView.render()

        expect(otherView.$el.get(0)).toEqual(anotherView.$el.get(0))
      })
    })
  })

  describe("when it is initialized", function() {
    it("uses the default id", function() {
      view.render()
      expect(view.$el).toHaveAttr("id", "confirmable-modal")
    });
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
        expect($('#confirmable-modal').find('.modal-header h3').html().trim()).toEqual(view.defaultLabels.title)
        expect($('#confirmable-modal').find('.modal-body').html().trim()).toEqual(view.defaultLabels.body)
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

      it("does not triggers a confirmable:dismiss event after hiding it", function() {
        var dismissed = false
        view.on('confirmable:dismiss', function () {
          dismissed = true
        })

        view.render()

        waitsFor(function () {
          return $('#confirmable-modal').is(':visible')
        }, 500)

        runs(function () {
          $('#confirmable-modal').find('[data-confirmable-confirm]').click()
          $('#confirmable-modal').modal('hide')

          expect(dismissed).toBeFalsy()
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

      describe("because one clicked on the backdrop", function() {
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
            $('.modal-backdrop').click()

            expect(dismissed).toBeTruthy()
          })
        });
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
          expect($('#confirmable-modal').find('.modal-body').html().trim()).toEqual(labels.body)
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

    describe("and a confirmation text is given", function() {
      var confirmationText = "DELETE"

      beforeEach(function() {
        view = new ConfirmableModalView()
        view.render({ confirmation_text: confirmationText })
      });

      it("renders a confirmation input", function() {
        expect(view.$el.find('input[data-confirmation-text]').length).toEqual(1)
      });

      it("renders a disabled confirmation button", function() {
        expect(view.$el.find('[data-confirmable-confirm]').hasClass('disabled')).toBeTruthy()
      });

      describe("when the current text matches the confirmation text", function() {
        beforeEach(function() {
          currentText = confirmationText
        })

        it("enables the button", function() {
          view.$el.find('[data-confirmation-text]').val(currentText).trigger('keyup')

          expect(view.$el.find('[data-confirmable-confirm]').hasClass('disabled')).toBeFalsy()
        })

        it("adds a correct class", function() {
          view.$el.find('[data-confirmation-text]').val(currentText).trigger('keyup')

          expect(view.$el.hasClass('correct')).toBeTruthy()
        })
      })

      describe("when the current text doesn't match the confirmation text", function() {
        beforeEach(function() {
          currentText = 'incorrect'
        })

        it("adds an error class to the confirmation text input", function() {
          view.$el.find('[data-confirmation-text]').val(currentText).trigger('keyup')

          expect(view.$el.hasClass('error')).toBeTruthy()
        })
      });
    });

    describe("and a confirmation text is not given", function() {
      beforeEach(function() {
        view = new ConfirmableModalView()
        view.render()
      });

      it("does not render a confirmation input", function() {
        expect(view.$el.find('input[data-confirmation-text=""]').length).toEqual(0)
      });

      it("renders a enabled confirmation button", function() {
        expect(view.$el.find('[data-confirmable-confirm]').hasClass('disabled')).toBeFalsy
      })
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
