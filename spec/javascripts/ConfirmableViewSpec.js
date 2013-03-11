describe("ConfirmableView", function() {
  var view, container, link

  beforeEach(function() {
    loadFixtures('confirmable_view.html')

    container = $('#confirmable')
    link = container.find('a')
  });

  afterEach(function () {
    $('.modal, .modal-backdrop').remove()
  })

  describe("when it is clicked", function() {
    it("renders a modal", function() {
      view = new ConfirmableView({ el: container })
      spyOn(view.modal, "render")

      link.click()

      expect(view.modal.render).toHaveBeenCalled()
    });

    describe("when the modal is confirmed", function() {
      var request

      beforeEach(function() {
        jasmine.Ajax.useMock()
      });

      it("triggers a confirmable:confirm event on the link", function() {
        view = new ConfirmableView({ el: container })

        var confirmed = false
        link.on('confirmable:confirm', function () {
          confirmed = true
        })

        link.click()

        waitsFor(function () {
          return $('#confirmable-modal').is(':visible')
        }, 500)

        runs(function () {
          $('#confirmable-modal').find('[data-confirmable-confirm]').click()

          expect(confirmed).toBeTruthy()
        })
      });

      it("sends an ajax DELETE request with the link href as URL", function() {
        view = new ConfirmableView({ el: container })

        link.click()

        waitsFor(function () {
          return $('#confirmable-modal').is(':visible')
        }, 500)

        runs(function () {
          $('#confirmable-modal').find('[data-confirmable-confirm]').click()

          request = mostRecentAjaxRequest();
          request.response({status: 200, responseText: ''})

          expect(request.url).toBe(link.attr('href'))
          expect(request.method).toBe('DELETE')
        })
      });

      describe("with a different method on the link", function() {
        it("sends a ajax request with the given method on the link", function() {
          container = $('#confirmable-post')
          link = container.find('a')
          view = new ConfirmableView({ el: container })

          link.click()

          waitsFor(function () {
            return $('#confirmable-modal').is(':visible')
          }, 500)

          runs(function () {
            $('#confirmable-modal').find('[data-confirmable-confirm]').click()

            request = mostRecentAjaxRequest();
            request.response({status: 200, responseText: ''})

            expect(request.url).toBe(link.attr('href'))
            expect(request.method).toBe('POST')
          })
        });
      });

      describe("after the ajax call returns", function() {
        describe("successfully", function() {
          it("triggers a confirmable:confirmed event on the link", function() {
            view = new ConfirmableView({ el: container })

            var confirmed = false
            link.on('confirmable:confirmed', function (event, data) { confirmed = data })

            link.click()

            waitsFor(function () {
              return $('#confirmable-modal').is(':visible')
            }, 500)

            runs(function () {
              $('#confirmable-modal').find('[data-confirmable-confirm]').click()

              var data = { some: 'data' }

              request = mostRecentAjaxRequest();
              request.response({status: 200, responseText: JSON.stringify(data)})

              expect(confirmed.some).toBe(data.some)
            })
          });

          it("triggers a confirmable:confirmed event", function() {
            view = new ConfirmableView({ el: container })

            var confirmed = false
            view.on('confirmable:confirmed', function (data) { confirmed = data })

            link.click()

            waitsFor(function () {
              return $('#confirmable-modal').is(':visible')
            }, 500)

            runs(function () {
              $('#confirmable-modal').find('[data-confirmable-confirm]').click()

              var data = { some: 'data' }

              request = mostRecentAjaxRequest();
              request.response({status: 200, responseText: JSON.stringify(data)})

              expect(confirmed.some).toBe(data.some)
            })
          });

          it("renders a feedback message", function() {
            var feedbackView = new FeedbackView({el: $('.feedback')})
            view = new ConfirmableView({ el: container, feedbackView: feedbackView })
            view.messages = { notice: 'some notice message' }
            spyOn(feedbackView, 'render')

            link.click()

            waitsFor(function () {
              return $('#confirmable-modal').is(':visible')
            }, 500)

            runs(function () {
              $('#confirmable-modal').find('[data-confirmable-confirm]').click()

              request = mostRecentAjaxRequest();
              request.response({status: 200, responseText: ''})

              expect(feedbackView.render).toHaveBeenCalledWith(view.messages.notice, 'alert-success', true)
            })
          });
        });

        describe("with an error", function() {
          it("does triggers a confirmable:error event on the link", function() {
            view = new ConfirmableView({ el: container })

            var error = false
            link.on('confirmable:error', function (event, jqXHR) { error = $.parseJSON(jqXHR.responseText) })

            link.click()

            waitsFor(function () {
              return $('#confirmable-modal').is(':visible')
            }, 500)

            runs(function () {
              $('#confirmable-modal').find('[data-confirmable-confirm]').click()

              var data = { some: 'data' }

              request = mostRecentAjaxRequest();
              request.response({status: 500, responseText: JSON.stringify(data)})

              expect(error.some).toBe(data.some)
            })
          });

          it("triggers a confirmable:error event", function() {
            view = new ConfirmableView({ el: container })

            var error = false
            view.on('confirmable:error', function (jqXHR) { error = $.parseJSON(jqXHR.responseText) })

            link.click()

            waitsFor(function () {
              return $('#confirmable-modal').is(':visible')
            }, 500)

            runs(function () {
              $('#confirmable-modal').find('[data-confirmable-confirm]').click()

              var data = { some: 'data' }

              request = mostRecentAjaxRequest();
              request.response({status: 500, responseText: JSON.stringify(data)})

              expect(error.some).toBe(data.some)
            })
          });

          it("renders a feedback message", function() {
            var feedbackView = new FeedbackView({el: $('.feedback')})
            view = new ConfirmableView({ el: container, feedbackView: feedbackView })
            view.messages = { alert: 'some notice message' }
            spyOn(feedbackView, 'render')

            link.click()

            waitsFor(function () {
              return $('#confirmable-modal').is(':visible')
            }, 500)

            runs(function () {
              $('#confirmable-modal').find('[data-confirmable-confirm]').click()

              request = mostRecentAjaxRequest();
              request.response({status: 500, responseText: ''})

              expect(feedbackView.render).toHaveBeenCalledWith(view.messages.alert, 'alert-error', true)
            })
          });
        });
      });
    });

    describe("with custom labels", function() {
      var labels

      beforeEach(function() {
        container = $('#confirmable-custom-labels')
        link = container.find('a')
        view = new ConfirmableView({ el: container })

        labels = container.data('confirmable-labels')
      });

      it("renders modal with default title, body and button labels", function() {
        spyOn(view.modal, "render")

        link.click()

        expect(view.modal.render).toHaveBeenCalledWith(labels)
      });
    });

    describe("with multiple links", function() {
      beforeEach(function() {
        container = $('#confirmable-multiple')
        view = new ConfirmableView({ el: container })
      });

      it("displays modals for each [data-confirmable]", function() {
        spyOn(view.modal, "render")
        container.find('a[data-confirmable]:first').click()
        expect(view.modal.render).toHaveBeenCalled()
      });

      it("does not display modals for non [data-confirmable]", function() {
        spyOn(view.modal, "render")
        container.find('a:not([data-confirmable])').click()
        expect(view.modal.render).not.toHaveBeenCalled()
      });
    });

    describe("and a modal was given", function() {
      var modal

      beforeEach(function() {
        modal = new ConfirmableModalView()
        view = new ConfirmableView({ el: container, modal: modal })
      });

      it("renders the given modal", function() {
        spyOn(modal, 'render')
        expect(view.modal).toEqual(modal)

        view.render()
        expect(modal.render).toHaveBeenCalled()
      });
    });
  });
});