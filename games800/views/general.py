from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from random import randrange

from games800.models import User, GameInstance, Score
from .utils import parsed_body


def react_index(request):
    return render(request, 'react_index.html')


def users(request):
    if request.method == "GET":
        userlist = [u.to_json() for u in User.objects.all()]
        return JsonResponse(userlist, safe=False)


@csrf_exempt
def new_game(request):
    if request.method == "POST":
        body = parsed_body(request)

        gameInstanceId = ""
        for i in range(4):
            gameInstanceId += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[randrange(26)]

        game = body.get("game")
        gi = GameInstance(id=gameInstanceId, game=game, accepting_joins=True)
        gi.save()

        first_participant = User.objects.get(username=body.get("username"))
        gi.add_participant(first_participant)

        return JsonResponse(gi.to_json())


@csrf_exempt
def join_game(request):
    if request.method == "POST":
        body = parsed_body(request)

        game = body.get("game")
        gameInstanceId = body.get("gameInstance").upper()
        try:
            gameInstance = GameInstance.objects.get(game=game, id=gameInstanceId)
        except GameInstance.DoesNotExist:
            return JsonResponse({"accepted": False, "message": "No such game room."})

        user = User.objects.get(username=body.get("username"))
        try:
            gameInstance.add_participant(user)
        except RuntimeError:
            return JsonResponse({"accepted": False, "message": "That room is no longer accepting new players."})

        return JsonResponse({"accepted": True, "gameInstance": gameInstance.to_json()})


@csrf_exempt
def participants(request):
    if request.method == "GET":
        try:
            game_instance = GameInstance.objects.get(id=request.GET.get("gameInstance").upper())
        except GameInstance.DoesNotExist:
            return JsonResponse({"message": "No such game room."}, status=404)

        all_participants = [user.to_json() for user in game_instance.participants.all()]
        return JsonResponse(all_participants, safe=False, status=200)


@csrf_exempt
def scores(request):
    if request.method == "GET":
        try:
            game_instance = GameInstance.objects.get(id=request.GET.get("gameInstance").upper())
        except GameInstance.DoesNotExist:
            return JsonResponse({"message": "No such game room."}, status=404)

        scores = [score.to_json() for score in Score.objects.filter(game_instance=game_instance)]
        return JsonResponse(scores, safe=False, status=200)
