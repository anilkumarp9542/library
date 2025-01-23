require 'rails_helper'

RSpec.describe 'Users API', type: :request do
  let!(:admin) { create(:user, role: 'Admin', password: 'password123') } # create an Admin
  let!(:librarian) { create(:user, role: 'Librarian') } # create a Librarian
  let!(:member) { create(:user, role: 'Member') } # create a Member
  let(:headers) { { 'Content-Type' => 'application/json' } } # set the headers

  # ensure user is login before attempt to perform any action
  def auth_headers(user)
    post '/login', params: { email: user.email, password: 'password123' }.to_json, headers: headers
    token = response.cookies['jwt']
    { 'Cookie' => "jwt=#{token};  HttpOnly" }
  end

  #  signup test case with valid and invalid attributes
  describe 'POST /signup' do
    let(:valid_attributes) { { user: attributes_for(:user) } }

    context 'with valid attributes' do
      it 'creates a new user with default role Member' do
        post '/signup', params: valid_attributes.to_json, headers: headers
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['role']).to eq('Member')
      end
    end

    context 'with invalid attributes' do
      it 'returns unprocessable entity' do
        post '/signup', params: { user: { email: '' } }.to_json, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  # login test case with valid and invalid attributes
  describe 'POST /login' do
    let(:valid_credentials) { { email: admin.email, password: 'password123' } }
    let(:invalid_credentials) { { email: admin.email, password: 'wrongpassword' } }

    context 'with valid credentials' do
      it 'logs in successfully and sets JWT cookie' do
        post '/login', params: valid_credentials.to_json, headers: headers
        expect(response).to have_http_status(:ok)
        expect(response.cookies['jwt']).not_to be_nil
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized' do
        post '/login', params: invalid_credentials.to_json, headers: headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # logout test case 
  describe 'DELETE /logout' do
    it 'logs out the user successfully' do
      delete '/logout', headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(response.cookies['jwt']).to be_nil
    end
  end

  # create librarian test case with authorized and unauthorized user
  describe 'POST /users/create_librarian' do
    let(:librarian_params) do
      {
        user: {
          username: 'librarian3',
          email: 'librarian3@gmail.com',
          mobile: '82903985839',
          password: 'user@1234',
          password_confirmation: 'user@1234' 
        }
      }
    end

    context 'when authorized as admin' do
      it 'creates a librarian successfully' do
        post '/users/create_librarian', params: librarian_params, headers: auth_headers(admin)
        expect(response).to have_http_status(:created)
      end
    end

    context 'when not authorized' do
      it 'returns unauthorized status' do
        post '/users/create_librarian', params: librarian_params, headers: auth_headers(member)
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # update librarian test case with authorized and unauthorized user
  describe 'PUT /users/:id/update_librarian' do
    let(:update_params) { { user: { username: 'UpdatedName' } } }
  
    context 'when admin updates a librarian' do
      it 'updates successfully' do
        puts "Before Update - Librarian ID: #{librarian.id}, Username: #{librarian.username}"
  
        put "/users/#{librarian.id}/update_librarian", params: update_params, headers: auth_headers(admin)
        
        librarian.reload
        puts "After Update - Librarian ID: #{librarian.id}, Username: #{librarian.username}"
  
        expect(librarian.username).to eq('UpdatedName')
        expect(response).to have_http_status(:ok)
      end
    end
  
    context 'when non-admin tries to update' do
      it 'returns unauthorized' do
        puts "Before Unauthorized Update Attempt - Librarian ID: #{librarian.id}, Username: #{librarian.username}"
  
        put "/users/#{librarian.id}/update_librarian", params: update_params, headers: auth_headers(member)
  
        librarian.reload
        puts "After Unauthorized Update Attempt - Librarian ID: #{librarian.id}, Username: #{librarian.username}"
  
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
  
  # delete librarian test case with authorized and unauthorized user
  describe 'DELETE /users/:id/destroy_librarian' do
    context 'when admin deletes a librarian' do
      it 'deletes successfully' do
        delete "/users/#{librarian.id}/destroy_librarian", headers: auth_headers(admin)
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when non-admin tries to delete' do
      it 'returns unauthorized' do
        delete "/users/#{librarian.id}/destroy_librarian", headers: auth_headers(member)
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # view librarian test case with authorized and unauthorized user
  describe 'GET /users/view_librarian' do
    context 'when admin views librarians' do
      it 'returns all librarians' do
        get '/users/view_librarian', headers: auth_headers(admin)
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when non-admin tries to view librarians' do
      it 'returns unauthorized' do
        get '/users/view_librarian', headers: auth_headers(member)
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
