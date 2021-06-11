from django.http import JsonResponse

from random import randrange

from games800.models import User, GameInstance
from games800.views.mixins import MixableView, JsonPostable


class NewGameView(MixableView, JsonPostable):
    REQUIRED_POST_PARAMS = {"game": str, "username": str}

    def post(self, request):
        print(request.params)

        gameInstanceId = ""
        for i in range(4):
            gameInstanceId += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[randrange(26)]

        game = request.params["game"]
        gi = GameInstance(id=gameInstanceId, game=game, accepting_joins=True)
        gi.save()

        first_participant = User.objects.get(username=request.params["username"])
        gi.add_participant(first_participant)

        return JsonResponse(gi.to_json())
