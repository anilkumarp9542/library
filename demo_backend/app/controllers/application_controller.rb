class ApplicationController < ActionController::API
  include ActionController::Cookies
  SECRET_KEY = Rails.application.secret_key_base || ENV['SECRET_KEY_BASE'] || 'fallback_key_for_development'


  before_action :initialize_log_entry, only: [:signup, :login, :logout]
  after_action :update_log_entry, only: [:signup, :login, :logout]

  private

  def initialize_log_entry
    @request_time = Time.current
    @request_id = SecureRandom.uuid
    @ip_address = request.remote_ip

    # Default values for username and email
    username = "N/A"
    email = "N/A"
    mobile = "N/A"

    case action_name
      when "signup"
        # Extract email and username from signup request params
        if params[:user].present?
          email = params[:user][:email] if params[:user][:email].present?
          username = params[:user][:username] if params[:user][:username].present?
          mobile = params[:user][:mobile] if params[:user][:mobile].present?
        end
      when "login"
        # Extract email from login request params and find user
        email = params[:email] if params[:email].present?
        user = User.find_by(email: email)
        username = user&.username || "N/A"
        mobile = user&.mobile || "N/A"
      when "logout"
        # Extract user details from decoded JWT token if available
        decoded = decode_token
        if decoded
          user = User.find_by(id: decoded[:user_id])
          email = user&.email || "N/A"
          username = user&.username || "N/A"
          mobile = user&.mobile || "N/A"
        end
    end

    # Create log entry
    @log_entry = Log.create!(
      request_id: @request_id,
      action_type: action_name,
      ip_address: @ip_address,
      request_body: request.raw_post.presence || '{}',
      request_time: @request_time,
      username: username,
      email: email,
      mobile: mobile
    )
  end

    def update_log_entry
      if @log_entry.present?
        @log_entry.update!(
          response_body: response.body,
          response_time: Time.current
        )
      end
    end



  # Generate JWT token
  def generate_token(user)
    payload = { user_id: user.id, role: user.role, username:user.username }
    JWT.encode(payload, SECRET_KEY, 'HS256')
  end

  # Decode JWT token from cookies
  def decode_token
    token = cookies.signed[:jwt]
    return nil unless token

    decoded = JWT.decode(token, SECRET_KEY, true, algorithm: 'HS256')[0]
    HashWithIndifferentAccess.new(decoded)
    rescue JWT::ExpiredSignature, JWT::VerificationError, JWT::DecodeError
    render json: { error: 'Unauthorized: Invalid or expired token' }, status: :unauthorized
    nil
  end


  def handle_options
    head :ok
  end

  private

  def set_cors_headers
    headers['Access-Control-Allow-Origin'] = request.headers['Origin'] || '*'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization'
    headers['Access-Control-Max-Age'] = '3600'
  end
end
