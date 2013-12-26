module Dui
  class Engine < ::Rails::Engine
    isolate_namespace Dui

    config.dui = Dui
  end
end
