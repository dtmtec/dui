# DUI #

DTM UI provides a set of UI components for applications build upon Rails, Backbone and Twitter Bootstrap.

## Requirements ##

* Rails
* Backbone JS
* Twitter Bootsrap
* SASS
* Compass

## Installation ##

1) Add this line in your **Gemfile**:

```ruby
gem 'common_components', git: 'https://github.com/dtmconsultoria/common_components.git'
```

2) Add this line at the bottom of your **application.js** file:

```ruby
//= require common_components/all
```

3) Add this line at the bottom of your **application.css** file:

```ruby
*= require common_components/all
```

## Components ##

### 1) Feedback View ###

![Feedback View](https://raw.github.com/dtmconsultoria/common_components/readme/app/assets/images/examples/feedback_view.png)

A feedback view resolve o problema de uma flash message ser exibida fora do campo de visão do usuário, fazendo ele perder alguma notificação de alert ou notice gerada pela aplicação.

Cada notificação aparece com um efeito de slideDown e fica por um período pré-definido, e some da página utilizando um efeito de slideUp. A feedback view também sabe lidar com a exibição de multiplas mensagens, utilizando uma fila para exibir cada uma delas.

Ela foi criada para ser usado dentro da navbar do Twitter Bootstrap, mas funciona em qualquer elemento fixo da página.

#### Usage ####

Renderize o feedback view dentro de algum elemento fixo da página:

```ruby
<%= render 'feedback' %>
```
