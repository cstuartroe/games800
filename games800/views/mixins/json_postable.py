from django.http import HttpRequest

import json

from .params_utils import resolve_all_params


class JsonPostable:
    def setup_post_params(self, request: HttpRequest, *_args, **_kwargs):
        if request.method == "POST":
            required_params = getattr(self, "REQUIRED_POST_PARAMS", [])
            optional_params = getattr(self, "OPTIONAL_POST_PARAMS", [])
            all_params = json.loads(request.body)

            request.params = resolve_all_params(required_params, optional_params, all_params)
