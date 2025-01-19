class ApplicationController < ActionController::API
  include ActionController::Cookies
  SECRET_KEY = Rails.application.secret_key_base || ENV['SECRET_KEY_BASE'] || 'fallback_key_for_development'

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

# Authorize any logged-in user
# def authorize_user
#   decoded = decode_token
#   @current_user = User.find_by(id: decoded[:user_id]) if decoded

#   render json: { error: 'Unauthorized: Please log in' }, status: :unauthorized unless @current_user
# end

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
