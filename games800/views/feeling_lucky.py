from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import giphy_client

from games800.models import User, GameInstance, Score
from games800.models.feeling_lucky import FeelinLuckySubmission, FeelinLuckyGuess
from .utils import parsed_body

GIPHY_SEARCH_API_KEY = os.getenv("GIPHY_SEARCH_API")


@csrf_exempt
def search(request):
    if request.method == "POST":
        body = parsed_body(request)

        user = User.objects.get(username=body.get("username"))
        game_instance = GameInstance.objects.get(id=body.get("gameInstance"))

        api_instance = giphy_client.DefaultApi()
        query = body.get("query", "")

        response = api_instance.gifs_search_get(
            GIPHY_SEARCH_API_KEY,
            query,
            limit=10,
            rating='g',
            lang='en',
            fmt='json',
        )

        gif_url_list = [gif.images.downsized.url for gif in response.data]

        if len(gif_url_list) > 2:
            sub = FeelinLuckySubmission(
                author=user,
                game_instance=game_instance,
                search_query=query,
            )
            sub.save()

            sub.add_candidates(gif_url_list)

            return HttpResponse()

        else:
            return JsonResponse({"message": "Too few GIF results found."}, status=400)


@csrf_exempt
def select(request):
    if request.method == "POST":
        body = parsed_body(request)

        user = User.objects.get(username=body.get("username"))
        game_instance = GameInstance.objects.get(id=body.get("gameInstance"))

        sub = FeelinLuckySubmission.objects.get(author=user, game_instance=game_instance)
        filename = body.get("selection")
        sub.choose_candidate_by_name(filename)

        game_instance.close()

        return HttpResponse()


@csrf_exempt
def submissions(request):
    if request.method == "GET":
        game_instance = GameInstance.objects.get(id=request.GET.get("gameInstance"))
        sublist = [s.to_json() for s in FeelinLuckySubmission.objects.filter(game_instance=game_instance)]

        all_submissions = (len(sublist) == len(game_instance.participants.all())) \
                          and all(sub["chosen"] is not None for sub in sublist)

        response = {
            "submissions": sublist,
            "all_submissions": all_submissions
        }

        return JsonResponse(response)


@csrf_exempt
def guess(request):
    if request.method == "GET":
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

    elif request.method == "POST":
        body = parsed_body(request)

        guesser = User.objects.get(username=body.get("guesser"))
        author = User.objects.get(username=body.get("author"))
        image_submission = FeelinLuckySubmission.objects.get(id=body.get("imageSubmission"))
        search_submission = FeelinLuckySubmission.objects.get(id=body.get("searchSubmission"))
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
