require_relative "boot" #loads the boot file and intializes the rails environment and dependencies

require "rails/all" #load all rails components Active Record, Action Controller
require 'dotenv/load' if %w[development test].include?(Rails.env)


# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups) #load all the gems and also ensure loaded accordingly with environments(development,test,production)

module DemoBackend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1 

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w(assets tasks))
    config.time_zone = 'Asia/Kolkata'  # local timezone IST
    config.active_record.default_timezone = :local  # Store timestamps in local time in the DB


    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true
    

    #to manage cookies in api responses
    config.middleware.use ActionDispatch::Cookies

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins 'http://localhost:5173' 
        resource '*',
                 headers: :any,
                 methods: [:get, :post, :put, :patch, :delete, :options, :head],
                 expose: ['Authorization', 'Set-Cookie'],
                 credentials: true
      end
    end
  end
end
