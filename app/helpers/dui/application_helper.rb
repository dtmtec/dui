module Dui
  module ApplicationHelper
    def scoped_t(key, scope, prefix)
      options = { default: I18n.t(scoped_key_for(key, nil, prefix), default: '') }

      I18n.t(scoped_key_for(key, scope, prefix), options)
    end

    def scoped_key_for(key, scope, prefix)
      scope = scope ? ".#{scope}" : ''
      "#{prefix}#{scope}.#{key}"
    end
  end
end
