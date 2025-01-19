class Log
  include Mongoid::Document
  include Mongoid::Timestamps  # Adds `created_at` and `updated_at` fields automatically

  field :request_id, type: String
  field :action_type, type: String   # login, signup, logout
  field :ip_address, type: String
  field :request_body, type: String
  field :response_body, type: String
  field :request_time, type: DateTime
  field :response_time, type: DateTime
  field :username, type: String   # New field for tracking user actions
  field :email, type: String      # New field for tracking user actions
  field :mobile, type: String
end
