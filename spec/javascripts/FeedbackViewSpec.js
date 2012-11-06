describe("FeedbackView", function() {
  var view

  beforeEach(function() {
    loadFixtures('feedback_view.html')
    view = new FeedbackView({el: $('.feedback')})
  });

  it("hides the feedback element", function() {
    expect($('.feedback')).toBeHidden()
  });

  describe("when rendering", function() {
    it("displays the feedback message", function() {
      view.render()
      expect($('.feedback')).toBeVisible()
    });

    describe("with a message", function() {
      it("renders the feedback message template, with the message", function() {
        var message = 'My new message'
        view.render(message)
        expect($('.feedback').text()).toMatch(message)
      });

      describe("and a message_type", function() {
        it("renders the feedback message with the message type", function() {
          view.render('some message', 'alert-success')

          expect($('.feedback .feedback-content .alert')).toHaveClass('alert-success')
        });
      });
    });
  });
});