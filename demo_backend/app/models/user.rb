
class User < ApplicationRecord
  has_secure_password

  ROLES = %w[Admin Librarian Member]

  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :mobile, presence: true, uniqueness: true
  validates :password, presence: true, on: :create
  validates :role, presence: true, inclusion: { in: ROLES }

end
