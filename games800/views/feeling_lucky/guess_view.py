from django.http import JsonResponse, HttpResponse

from games800.models import User, GameInstance, Score
from games800.models.feeling_lucky import FeelinLuckySubmission, FeelinLuckyGuess
from games800.views.mixins import MixableView, SafeGettable, JsonPostable


class GuessView(MixableView, SafeGettable, JsonPostable):
    REQUIRED_GET_PARAMS = {"gameInstance": str}
    REQUIRED_POST_PARAMS = {"guesser": str, "author": str, "imageSubmission": int, "searchSubmission": int}

    def get(self, request):
        try:
            game_instance = GameInstance.objects.get(id=request.GET.get("gameInstance").upper())
        except GameInstance.DoesNotExist:
            return JsonResponse({"message": "No such game room."}, status=404)

        guesslist = [
            g.to_json()
            for g in FeelinLuckyGuess.objects.all()
            if g.image_submission.game_instance == game_instance
        ]
        return JsonResponse(guesslist, safe=False)

    def post(self, request):
        guesser = User.objects.get(username=request.params["guesser"])
        author = User.objects.get(username=request.params["author"])
        image_submission = FeelinLuckySubmission.objects.get(id=request.params["imageSubmission"])
        search_submission = FeelinLuckySubmission.objects.get(id=request.params["searchSubmission"])
        game_instance = image_submission.game_instance

        guess = FeelinLuckyGuess(
            guesser=guesser,
            author=author,
            image_submission=image_submission,
            search_submission=search_submission,
        )
        guess.save()

        if (guesser != image_submission.author) and (author == image_submission.author):
            Score.add_score(image_submission.author, game_instance, -1)

        guesses = FeelinLuckyGuess.objects.filter(image_submission=image_submission)
        participants = game_instance.participants.all()

        if len(guesses) == len(participants):
            correct_query_guesses = 0
            for g in guesses:
                if g.search_submission == image_submission and g.guesser != image_submission.author:
                    correct_query_guesses += 1

            if correct_query_guesses >= (len(participants) / 2):
                for user in participants:
                    if user != image_submission.author:
                        Score.add_score(user, game_instance, 1)
            else:
                Score.add_score(image_submission.author, game_instance, len(participants) - 1)

        return HttpResponse()
