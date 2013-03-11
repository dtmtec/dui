describe("ConfirmableView", function() {
  var view, link

  beforeEach(function() {
    loadFixtures('confirmable_view.html')

    link = $('a#confirmable')
    view = new ConfirmableView({ el: link })
  });

  afterEach(function () {
    $('.modal, .modal-backdrop').remove()
  })

  describe("when it is clicked", function() {
    it("renders a modal", function() {
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

      it("triggers a confirmable:confirmed event on the link", function() {
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

      it("sends a ajax request with the given method on the link", function() {
        link = $('a#confirmable-post')
        view = new ConfirmableView({ el: link })

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

    describe("with custom labels", function() {
      var labels

      beforeEach(function() {
        link = $('a#confirmable-custom-labels')
        view = new ConfirmableView({ el: link })

        labels = link.data('confirmable-labels')
      });

      it("renders modal with default title, body and button labels", function() {
        spyOn(view.modal, "render")

        link.click()

        expect(view.modal.render).toHaveBeenCalledWith(labels)
      });
    });

    describe("and a modal was given", function() {
      var modal

      beforeEach(function() {
        modal = new ConfirmableModalView()
        view = new ConfirmableView({ el: link, modal: modal })
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