OpenProject::Application.routes.draw do
  get 'projects/:project_id', to: 'overviews/overviews#show', as: :project_overview
end
