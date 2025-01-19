class UsersController < ApplicationController

  before_action :authorize_admin, only: [:create_librarian, :destroy_librarian, :update_librarian, :view_librarian]

  # Validate token and return user info for GoLang service
  def validate_token
    decoded = decode_token
    if decoded
      user = User.find_by(id: decoded[:user_id])
      if user
        render json: { 
          user_id: user.id, 
          username: user.username, 
          role: user.role, 
          email: user.email,
          mobile: user.mobile,
        }, status: :ok
      else
        render json: { error: 'User not found' }, status: :not_found
      end
    else
      render json: { error: 'Unauthorized: Invalid or expired token' }, status: :unauthorized
    end
  end

  # Admin can create a librarian
  def create_librarian
    librarian = User.new(user_params)
    librarian.role = 'Librarian'

    if librarian.save
      render json: { message: "Librarian created successfully", user: librarian }, status: :created
    else
      render json: { errors: librarian.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Admin can delete a librarian
  def destroy_librarian
    librarian = User.find_by(id: params[:id], role: 'Librarian')

    if librarian
      librarian.destroy
      render json: { message: "Librarian deleted successfully" }, status: :ok
    else
      render json: { error: "Librarian not found" }, status: :not_found
    end
  end

  # Admin can update a librarian (partial updtaes are also allowed)
  def update_librarian
    librarian = User.find_by(id: params[:id], role: 'Librarian')

    if librarian
      if librarian.update(update_params)
        render json: { message: "Librarian updated successfully", user: librarian }, status: :ok
      else
        render json: { errors: librarian.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Librarian not found" }, status: :not_found
    end
  end

  #Admin can view all librarian

  def view_librarian
    librarians = User.where(role: 'Librarian').select(:id, :username, :email, :mobile, :role)
  
    if librarians.any?
      render json: { librarians: librarians }, status: :ok
    else
      render json: { message: 'No librarians found' }, status: :not_found
    end
  end
  

  # Member signup
  def signup
    user = User.new(user_params)
    user.role = 'Member'

    if user.save
      token = generate_token(user)
      set_auth_cookie(token)
      render json: { 
        message: "Account created and logged in successfully", 
        role: user.role,
        username: user.username
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # User login (includes members and librarians)
  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = generate_token(user)
      set_auth_cookie(token)
      render json: { message: "Login successful", role: user.role, username: user.username }, status: :ok
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end


  # User logout
  def logout
    
    clear_auth_cookie
    render json: { message: "User logged out successfully." }, status: :ok
  end


  # Authorization for admin actions
  def authorize_admin
    decoded = decode_token
    admin = User.find_by(id: decoded[:user_id]) if decoded

    unless admin&.role == 'Admin'
      render json: { error: "Unauthorized: Admin access required" }, status: :unauthorized
    end
  end

  private

  # Set authentication cookie
  def set_auth_cookie(token)
    cookies.signed[:jwt] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      expires: 24.hours.from_now
    }
  end

  # Clear authentication cookie
  def clear_auth_cookie
    cookies.delete(:jwt, httponly: true)
  end

  # Parameter handling for user creation and updates
  def user_params
      params.require(:user).permit(:username, :email, :mobile, :password, :password_confirmation)
  end

  # Parameters for partial updates (includes removing empty fields)
  def update_params
    permitted = if params[:user]
                  params.require(:user).permit(:username, :email, :mobile, :password, :password_confirmation)
                else
                  params.permit(:username, :email, :mobile, :password, :password_confirmation)
                end
    permitted.reject { |_, value| value.blank? } # Ignore empty fields
  end
end
