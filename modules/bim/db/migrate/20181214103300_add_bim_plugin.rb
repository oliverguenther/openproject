class AddBimPlugin < ActiveRecord::Migration[5.1]

  def change
    create_table :bim_linked_issues do |t|
      t.text :uuid, index: true

      t.text :markup

      t.belongs_to :work_package, index: { unique: true }
    end
  end
end
