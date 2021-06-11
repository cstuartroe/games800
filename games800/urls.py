from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users', views.UsersView.as_view(), name="users"),
    path('new_game', views.NewGameView.as_view(), name="new_game"),
    path('join_game', views.JoinGameView.as_view(), name="join_game"),
    path('participants', views.ParticipantsView.as_view(), name="participants"),
    path('scores', views.ScoresView.as_view(), name="scores"),

    path('feelin_lucky/search', views.feeling_lucky.SearchView.as_view(), name="feelin_lucky_search"),
    path('feelin_lucky/select', views.feeling_lucky.SelectView.as_view(), name="feelin_lucky_select"),
    path('feelin_lucky/submissions', views.feeling_lucky.SubmissionsView.as_view(), name="feelin_lucky_submissions"),
    path('feelin_lucky/guess', views.feeling_lucky.GuessView.as_view(), name="feelin_lucky_guess"),

    path('', views.react_index, name='index'),
]