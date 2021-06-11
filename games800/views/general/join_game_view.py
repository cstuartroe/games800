from django.http import JsonResponse

from games800.models import User, GameInstance
from games800.views.mixins import MixableView, JsonPostable


class JoinGameView(MixableView, JsonPostable):
    REQUIRED_POST_PARAMS = {"gameInstance": str, "username": str}

    def post(self, request):
        gameInstanceId = request.params["gameInstance"].upper()
        try:
            gameInstance = GameInstance.objects.get(id=gameInstanceId)
        except GameInstance.DoesNotExist:
            return JsonResponse({"accepted": False, "message": "No such game room."})

        user = User.objects.get(username=request.params["username"])
        try:
            gameInstance.add_participant(user)
        except RuntimeError:
            return JsonResponse({"accepted": False, "message": "That room is no longer accepting new players."})

        return JsonResponse({"accepted": True, "gameInstance": gameInstance.to_json()})
