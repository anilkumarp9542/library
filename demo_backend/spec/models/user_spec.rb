# spec/models/user_spec.rb
require 'rails_helper'

RSpec.describe User, type: :model do
  let(:user) { build(:user) }

  context 'validations' do
    # ensure record is valid with correct attributes
    it 'is valid with valid attributes' do
      expect(user).to be_valid
    end

    # if username is not given
    it 'is invalid without a username' do
      user.username = nil
      expect(user).not_to be_valid
    end

    # if email is not given
    it 'is invalid without an email' do
      user.email = nil
      expect(user).not_to be_valid
    end

    # if mobile is not given
    it 'is invalid without a mobile' do
      user.mobile = nil
      expect(user).not_to be_valid
    end

    # if password is not given
    it 'is invalid without a password on creation' do
      user.password = nil
      expect(user).not_to be_valid
    end

    # if duplicate email is given
    it 'is invalid with a duplicate email' do
      create(:user, email: user.email)
      expect(user).not_to be_valid
    end

    # if duplicate username is given
    it 'is invalid with a duplicate username' do
      create(:user, username: user.username)
      expect(user).not_to be_valid
    end

    # if duplicate mobile is given
    it 'is invalid with a duplicate mobile' do
      create(:user, mobile: user.mobile)
      expect(user).not_to be_valid
    end
  end
end
