from django.http import JsonResponse

from games800.models import GameInstance
from games800.views.mixins import MixableView, SafeGettable


class ParticipantsView(MixableView, SafeGettable):
    REQUIRED_GET_PARAMS = {"gameInstance": str}

    def get(self, request):
        try:
            game_instance = GameInstance.objects.get(id=request.GET.get("gameInstance").upper())
        except GameInstance.DoesNotExist:
            return JsonResponse({"message": "No such game room."}, status=404)

        all_participants = [user.to_json() for user in game_instance.participants.all()]
        return JsonResponse(all_participants, safe=False, status=200)