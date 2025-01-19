class Log
  include Mongoid::Document
  include Mongoid::Timestamps  

  field :request_id, type: String
  field :action_type, type: String   # login, signup, logout
  field :ip_address, type: String
  field :request_body, type: String
  field :response_body, type: String
  field :request_time, type: DateTime
  field :response_time, type: DateTime
  field :username, type: String   
  field :email, type: String      
  field :mobile, type: String
end
