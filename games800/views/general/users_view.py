from django.http import JsonResponse

from games800.models import User
from games800.views.mixins import MixableView, SafeGettable


class UsersView(MixableView, SafeGettable):
    def get(self, _request):
        userlist = [u.to_json() for u in User.objects.all()]
        return JsonResponse(userlist, safe=False)
