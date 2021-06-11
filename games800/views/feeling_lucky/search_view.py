from django.http import HttpResponse, JsonResponse
import giphy_client

import os

from games800.models import User, GameInstance
from games800.models.feeling_lucky import FeelinLuckySubmission
from games800.views.mixins import MixableView, JsonPostable


GIPHY_SEARCH_API_KEY = os.getenv("GIPHY_SEARCH_API")


class SearchView(MixableView, JsonPostable):
    REQUIRED_POST_PARAMS = {"gameInstance": str, "username": str, "query": str}

    def post(self, request):
        user = User.objects.get(username=request.params["username"])
        game_instance = GameInstance.objects.get(id=request.params["gameInstance"])

        api_instance = giphy_client.DefaultApi()
        query = request.params["query"]

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
