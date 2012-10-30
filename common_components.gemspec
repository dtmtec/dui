$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "common_components/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "common_components"
  s.version     = CommonComponents::VERSION
  s.authors     = ["Vicente Mundim", "Luis Vasconcellos"]
  s.email       = ["vicente.mundim@dtmtec.com.br", "luis.vasconcellos@dtmtec.com.br"]
  s.homepage    = "http://dtmtec.com.br"
  s.summary     = "A gem with many generic components"
  s.description = "A series of components like Feedback, MultiSelect, etc."

  s.files = Dir["{app,config,db,lib}/**/*"] + ["MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["spec/**/*"]

  s.add_dependency "rails", "~> 3.2.8"
  s.add_dependency "sass-rails"
  s.add_dependency "compass-rails"
end
