from django.http import JsonResponse

from games800.models import GameInstance, Score
from games800.views.mixins import MixableView, SafeGettable


class ScoresView(MixableView, SafeGettable):
    REQUIRED_GET_PARAMS = {"gameInstance": str}

    def get(self, request):
        try:
            game_instance = GameInstance.objects.get(id=request.GET.get("gameInstance").upper())
        except GameInstance.DoesNotExist:
            return JsonResponse({"message": "No such game room."}, status=404)

        scores = [score.to_json() for score in Score.objects.filter(game_instance=game_instance)]
        return JsonResponse(scores, safe=False, status=200)
