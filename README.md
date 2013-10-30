# DUI

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/dtmtec/dui/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

DTM UI provides a set of UI components for applications built with Rails, Backbone and Twitter Bootstrap.

## Requirements

* Rails
* jQuery
* Backbone JS (>= 1.0.0)
* Twitter Bootsrap
* SASS
* Compass
* [Inherited Resources][https://github.com/josevalim/inherited_resources]

## Installation

1) Add this line in your **Gemfile**:

```ruby
gem 'dui', git: 'https://github.com/dtmtec/dui.git'
```

2) Add this line at the bottom of your **application.js** file:

```ruby
//= require dui/all
```

3) Add this line at the bottom of your **application.css** file:

```ruby
*= require dui/all
```

DTM UI does not depend on any backbone or bootstrap gem, so that you can include them the way you like, but if you want you may use these gems to include them:

* [rails-backbone](https://github.com/codebrew/backbone-rails)
* [bootstrap-sass](https://github.com/thomas-mcdonald/bootstrap-sass)

## Components

### Feedback View

![Feedback View](https://raw.github.com/dtmtec/dui/master/doc/images/feedback_view.png)

FeedbackView is a Backbone.js view component that displays a flash message for a user. It uses [Twitter Bootstrap alert](http://twitter.github.io/bootstrap/components.html#alerts) style with a slide effect, displayed right above the top menu bar. It is best fit to be used on fixed top bars, so that the message is always displayed for the user, even when it has scrolled through the page.

It can handle multiple messages by queueing them up, then showing each of them for a small period.

#### Usage

To render a default FeedbackView you can use the `dui/feedback` partial:

```ruby
<%= render 'dui/feedback' %>
```

This will check for an `flash[:alert]` or `flash[:notice]` and display the message for the user once the page is loaded. It will also render the feedback template, which will be used to display messages programmatically:

```javascript
// creates a feedback view instance
var feedbackView = new FeedbackView({ el: $('.feedback') })

// render it
feedbackView.render('some message', 'alert-success')
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
