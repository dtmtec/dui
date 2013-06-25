module Dui
  module MultiSelectHelper
    def render_multi_select(options)
      render 'dui/multi_select/multi_select', {
        available_url: options[:available_url],
        additional_classes: options[:class] || '',
        search_placeholder: i18n_for('search_placeholder', options[:scope]),
        all_label: i18n_for('all', options[:scope]),
        available_title: i18n_for('available.title', options[:scope]),
        selected_title: i18n_for('selected.title', options[:scope]),
        available_template: options[:available_template] || 'dui/multi_select/multi_select_template',
        selected_template: options[:selected_template] || 'dui/multi_select/multi_select_template',
        content_template: options[:content_template] || 'dui/multi_select/content',
        no_available_items_message: i18n_for('available.no_items_message', options[:scope]),
        no_selected_items_message: i18n_for('selected.no_items_message', options[:scope]),
        available_actions_content: options[:available_actions_content] || i18n_for('available.actions_content', options[:scope]),
        selected_actions_content: options[:selected_actions_content] || i18n_for('selected.actions_content', options[:scope]),
        data: options[:data] || {}
      }
    end

    private
      def i18n_key_for(key, scope=nil)
        scope = scope ? ".#{scope}" : ''
        "multi_select#{scope}.#{key}"
      end

      def i18n_for(key, scope=nil)
        options = { default: I18n.t(i18n_key_for(key), default: '') }

        I18n.t(i18n_key_for(key, scope), options)
      end
  end
end
