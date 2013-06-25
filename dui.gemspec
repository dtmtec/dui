$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "dui/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "dui"
  s.version     = Dui::VERSION
  s.authors     = ["Vicente Mundim", "Luis Vasconcellos"]
  s.email       = ["vicente.mundim@dtmtec.com.br", "luis.vasconcellos@dtmtec.com.br"]
  s.homepage    = "http://dtmtec.com.br"
  s.summary     = "DTM UI provides a set of UI components for applications built with Rails, Backbone and Twitter Bootstrap."
  s.description = "DTM UI provides a set of UI components for applications built with Rails, Backbone and Twitter Bootstrap."

  s.files = Dir["{app,config,db,lib}/**/*"] + ["MIT-LICENSE", "Rakefile", "README.md"]
  s.test_files = Dir["spec/**/*"]

  s.add_dependency "rails", "~> 3.2.8"
  s.add_dependency "sass-rails"
  s.add_dependency "compass-rails"
end
