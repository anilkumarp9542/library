
class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :username
      t.string :email
      t.string :mobile
      t.string :password_digest
      t.string :role

      t.timestamps
    end
  end
end
