from django.contrib import admin

from .models import User, GameInstance, Score
from .models.feeling_lucky import FeelinLuckySubmission, FeelinLuckyGuess, FeelinLuckyCandidate

admin.site.register(User)
admin.site.register(GameInstance)
admin.site.register(Score)
admin.site.register(FeelinLuckySubmission)
admin.site.register(FeelinLuckyGuess)
admin.site.register(FeelinLuckyCandidate)
