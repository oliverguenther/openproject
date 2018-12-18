module Bim
  class BcfIssue < ActiveRecord::Base

    serialize :markup, Hash

    acts_as_attachable delete_permission: :manage_bim,
                       add_permission: :manage_bim
  end
end
