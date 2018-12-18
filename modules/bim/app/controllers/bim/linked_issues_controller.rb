module ::Bim
  class LinkedIssuesController < BaseController
    before_action :find_project_by_project_id
    before_action :authorize

    menu_item :bim

    def index; end
    def import; end

    def perform_import
      flash[:info] = "WAT!"
      redirect_to action: :index
    end
  end
end
