from django.http import JsonResponse

from games800.models import GameInstance
from games800.models.feeling_lucky import FeelinLuckySubmission
from games800.views.mixins import MixableView


class SubmissionsView(MixableView):
    REQUIRED_GET_PARAMS = {"gameInstance": str}

    def get(self, request):
        game_instance = GameInstance.objects.get(id=request.GET.get("gameInstance"))
        sublist = [s.to_json() for s in FeelinLuckySubmission.objects.filter(game_instance=game_instance)]

        all_submissions = (len(sublist) == len(game_instance.participants.all())) \
                          and all(sub["chosen"] is not None for sub in sublist)

        response = {
            "submissions": sublist,
            "all_submissions": all_submissions
        }

        return JsonResponse(response)
