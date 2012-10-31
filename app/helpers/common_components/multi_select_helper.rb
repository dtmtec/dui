module CommonComponents
  module MultiSelectHelper
    def render_multi_select(options)
      render 'common_components/multi_select/multi_select', {
        multi_select_available_url: options[:available_url],
        multi_select_search_placeholder: i18n_for('search_placeholder', options[:scope]),
        multi_select_all_label: i18n_for('all', options[:scope]),
        multi_select_available_title: i18n_for('available.title', options[:scope]),
        multi_select_selected_title: i18n_for('selected.title', options[:scope]),
        multi_select_no_available_items_message: i18n_for('available.no_items_message', options[:scope]),
        multi_select_no_selected_items_message: i18n_for('selected.no_items_message', options[:scope]),
        multi_select_selected_actions_content: i18n_for('selected.actions_content', options[:scope])
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