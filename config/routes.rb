Rails.application.routes.draw do


  get 'home/index'

  devise_for :users, :controllers => { registrations: 'registrations' }
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :destinations
  resources :spots
  resources :users, only: :show


  root to: "home#index"

end
