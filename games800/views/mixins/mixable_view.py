from django.views import View


class MixableView(View):
    def setup(self, request, *args, **kwargs):
        View.setup(self, request, *args, **kwargs)

        for member in dir(self):
            if member.startswith("setup_"):
                getattr(self, member)(request, *args, **kwargs)
