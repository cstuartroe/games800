from typing import List
from django.db import models

from .general import User, GameInstance


class FeelinLuckySubmission(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    game_instance = models.ForeignKey(GameInstance, on_delete=models.CASCADE, null=False)
    search_query = models.CharField(max_length=30)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                name="unique_author_and_game",
                fields=[
                    "author",
                    "game_instance",
                ],
            )
        ]

    def to_json(self):
        try:
            chosen = FeelinLuckyCandidate.objects.get(
                submission=self,
                chosen=True,
            )
        except FeelinLuckyCandidate.DoesNotExist:
            chosen = None

        return {
            "id": self.id,
            "author": self.author.to_json(),
            "gameInstance": self.game_instance.to_json(),
            "searchQuery": self.search_query,
            "candidates": [c.to_json() for c in self.candidates.all()],
            "chosen": chosen and chosen.to_json()
        }

    def add_candidates(self, candidates: List[str]):
        for candidate in candidates:
            FeelinLuckyCandidate.add_candidate(self, candidate)

    def choose_candidate_by_name(self, filename: str):
        FeelinLuckyCandidate.objects.get(
            submission=self,
            filename=filename,
        ).choose()


class FeelinLuckyCandidate(models.Model):
    submission = models.ForeignKey(FeelinLuckySubmission, on_delete=models.CASCADE, null=False, related_name="candidates")
    filename = models.CharField(max_length=200)
    chosen = models.BooleanField(null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                name="one_chosen_per_submission",
                fields=[
                    "submission",
                    "chosen",
                ]
            ),
            models.UniqueConstraint(
                name="unique_filename",
                fields=[
                    "submission",
                    "filename",
                ]
            )
        ]

    @classmethod
    def add_candidate(cls, submission: FeelinLuckySubmission, filename: str):
        cls(submission=submission, filename=filename, chosen=None).save()

    def choose(self):
        for candidate in FeelinLuckyCandidate.objects.filter(submission=self.submission):
            candidate.chosen = None
            candidate.save()
        self.chosen = True
        self.save()

    def to_json(self):
        return {
            "filename": self.filename,
            "chosen": bool(self.chosen),
        }


class FeelinLuckyGuess(models.Model):
    guesser = models.ForeignKey(User, on_delete=models.CASCADE, null=False, related_name="guessed_guesses")
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=False, related_name="authored_guesses")
    image_submission = models.ForeignKey(
        FeelinLuckySubmission,
        on_delete=models.CASCADE,
        null=False,
        related_name="image_guesses",
    )
    search_submission = models.ForeignKey(
        FeelinLuckySubmission,
        on_delete=models.CASCADE,
        null=False,
        related_name="search_guesses",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                name="unique_guess",
                fields=[
                    "guesser",
                    "image_submission",
                ],
            )
        ]

    def to_json(self):
        return {
            "guesser": self.guesser.to_json(),
            "author": self.author.to_json(),
            "imageSubmission": self.image_submission.to_json(),
            "searchSubmission": self.search_submission.to_json(),
        }
