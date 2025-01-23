Rails.application.routes.draw do
  # Admin Routes for Librarian Management
  post '/users/create_librarian', to: 'users#create_librarian'
  delete '/users/:id/destroy_librarian', to: 'users#destroy_librarian'
  put '/users/:id/update_librarian', to: 'users#update_librarian'
  get '/users/view_librarian', to: 'users#view_librarian'

  # User Routes
  post '/signup', to: 'users#signup'#only member
  post '/login', to: 'users#login'
  delete '/logout', to: 'users#logout'

  # Endpoint for Go service to fetch user info and validate token
  get '/users/validate_token', to: 'users#validate_token'

end
