from django.http import HttpRequest

from games800.views.mixins.params_utils import resolve_all_params


class SafeGettable:
    def setup_get_params(self, request: HttpRequest, *_args, **_kwargs):
        if request.method == "GET":
            required_params = getattr(self, "REQUIRED_GET_PARAMS", [])
            optional_params = getattr(self, "OPTIONAL_GET_PARAMS", [])
            all_params = request.GET.dict()

            request.params = resolve_all_params(required_params, optional_params, all_params)
