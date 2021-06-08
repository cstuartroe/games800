from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users', views.users, name="users"),
    path('new_game', views.new_game, name="new_game"),
    path('join_game', views.join_game, name="join_game"),
    path('participants', views.participants, name="participants"),
    path('scores', views.scores, name="scores"),

    path('feelin_lucky/search', views.feeling_lucky.search, name="feelin_lucky_search"),
    path('feelin_lucky/select', views.feeling_lucky.select, name="feelin_lucky_select"),
    path('feelin_lucky/submissions', views.feeling_lucky.submissions, name="feelin_lucky_submissions"),
    path('feelin_lucky/guess', views.feeling_lucky.guess, name="feelin_lucky_guess"),

    path('', views.react_index, name='index'),
]