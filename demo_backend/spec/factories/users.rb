FactoryBot.define do
  factory :user do
    username { Faker::Internet.unique.username }
    email { Faker::Internet.unique.email }
    mobile { Faker::Number.unique.number(digits: 10).to_s }
    password { 'password123' }
    password_confirmation { 'password123' }
    
    # Default role to Member, but can be overridden
    role { 'Member' }

    trait :admin do
      role { 'Admin' }
    end

    trait :librarian do
      role { 'Librarian' }
    end

  end
end
