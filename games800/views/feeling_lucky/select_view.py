from django.http import HttpResponse

from games800.views.mixins import MixableView, JsonPostable
from games800.models import User, GameInstance, Score
from games800.models.feeling_lucky import FeelinLuckySubmission


class SelectView(MixableView, JsonPostable):
    REQUIRED_POST_PARAMS = {"username": str, "gameInstance": str, "selection": str}

    def post(self, request):
        user = User.objects.get(username=request.params["username"])
        game_instance = GameInstance.objects.get(id=request.params["gameInstance"])

        sub = FeelinLuckySubmission.objects.get(author=user, game_instance=game_instance)
        filename = request.params["selection"]
        sub.choose_candidate_by_name(filename)

        all_chosen = True
        for participant in game_instance.participants.all():
            try:
                sub = FeelinLuckySubmission.objects.get(author=participant, game_instance=game_instance)
                all_chosen = all_chosen and (sub.chosen_one() is not None)
            except FeelinLuckySubmission.DoesNotExist:
                all_chosen = False

        if all_chosen:
            game_instance.close()

        Score.add_score(user, game_instance, 0)

        return HttpResponse()
