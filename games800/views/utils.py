from django.http import HttpRequest
import json


def parsed_body(request: HttpRequest):
    return json.loads(request.body)
