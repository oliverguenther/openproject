require 'open_project/plugins'

module OpenProject::Bim
  class Engine < ::Rails::Engine
    engine_name :openproject_bim

    include OpenProject::Plugins::ActsAsOpEngine

    register 'openproject-bim',
             author_url: 'http://openproject.com',
             settings: {
               default: {
               }
             } do

      project_module :bim do
        permission :view_linked_issues,
                   'bim/linked_issues': :index

        permission :manage_bim,
                   'bim/linked_issues': %i[index import perform_import]
      end

      menu :project_menu,
           :bim,
           { controller: '/bim/linked_issues', action: :index },
           caption: :'bim.linked_issues',
           param: :project_id,
           icon: 'icon2 icon-backlogs'
    end
  end
end
