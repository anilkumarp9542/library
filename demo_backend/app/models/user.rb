
class User < ApplicationRecord
  has_secure_password # adds authentication feature to User model, hash and securely store password in DB using BCrypt

  ROLES = %w[Admin Librarian Member] # predefined roles

  # uniqueness and integrity in fields 
  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :mobile, presence: true, uniqueness: true
  validates :password, presence: true, on: :create
  validates :role, presence: true, inclusion: { in: ROLES }

end
