class HomeController < ApplicationController
  def index
    @months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    # params[:cases] = '5,12,5,7,7,11,10,19,14,18,16'
    # params[:ave_temp] = '34,32,35,36,32,35,34,32,36,36,34'
    # params[:humidity] = '55,64,59,66,55,60,70,66,65,60,57'
    # params[:wind_speed] = '5,10,5,3,6,7,4,3,3,3,10'
    # params[:num_vaccinated] = '53.6,54.5,55.3,57.4,58.7,59.1,59.3,62.3,64.2,65.7,67.9'
    # params[:num_vaccinated] = '53,54,55,57,58,59,59,62,64,65,67'

    params[:cases] = '154,103,75,129,129,102,126,113,113,60'
    params[:ave_temp] = '33,33,32,29,30,32,33,29,29,31'
    params[:humidity] = '83,72,73,89,86,70,76,82,87,71'
    params[:wind_speed] = '9,6,6,10,9,6,3,6,6,11'
    params[:num_vaccinated] = '53.4,55.6,56.7,60.9,62.3,57.6,59.2,58.9,60.3,61.1'
  end
end