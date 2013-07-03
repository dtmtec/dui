module Dui
  module MultiSelectHelper
    include Dui::ApplicationHelper

    def render_multi_select(options)
      render 'dui/multi_select/multi_select', {
        available_url: options[:available_url],
        additional_classes: options[:class] || '',
        search_placeholder: scoped_t('search_placeholder', options[:scope], :multi_select),
        all_label: scoped_t('all', options[:scope], :multi_select),
        available_title: scoped_t('available.title', options[:scope], :multi_select),
        selected_title: scoped_t('selected.title', options[:scope], :multi_select),
        available_template: options[:available_template] || 'dui/multi_select/multi_select_template',
        selected_template: options[:selected_template] || 'dui/multi_select/multi_select_template',
        content_template: options[:content_template] || 'dui/multi_select/content',
        no_available_items_message: scoped_t('available.no_items_message', options[:scope], :multi_select),
        no_selected_items_message: scoped_t('selected.no_items_message', options[:scope], :multi_select),
        available_actions_content: options[:available_actions_content] || scoped_t('available.actions_content', options[:scope], :multi_select),
        selected_actions_content: options[:selected_actions_content] || scoped_t('selected.actions_content', options[:scope], :multi_select),
        data: options[:data] || {}
      }
    end
  end
end
