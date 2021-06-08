from django.db import models
from django.forms.models import model_to_dict

GAMES = [
    ("Feeling_Lucky", "Feelin' Lucky")
]


class User(models.Model):
    username = models.CharField(max_length=10, unique=True, primary_key=True)
    screen_name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.username

    def to_json(self):
        return model_to_dict(self)


class GameInstance(models.Model):
    id = models.CharField(max_length=4, unique=True, primary_key=True)
    game = models.CharField(max_length=20, choices=GAMES)
    participants = models.ManyToManyField(User)
    accepting_joins = models.BooleanField(default=True)

    def to_json(self):
        return {
            "id": self.id,
            "game": self.game,
            "participants": [u.to_json() for u in self.participants.all()],
            "accepting_joins": self.accepting_joins,
        }

    def add_participant(self, user: User):
        if user in self.participants.all():
            return
        elif self.accepting_joins:
            self.participants.add(user)
        else:
            raise RuntimeError("Cannot add participant to closed game")

    def close(self):
        self.accepting_joins = False
        self.save()


class Score(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    game_instance = models.ForeignKey(GameInstance, on_delete=models.CASCADE, null=False)
    value = models.IntegerField(default=0, null=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                name="unique_player_and_game",
                fields=[
                    "player",
                    "game_instance",
                ],
            )
        ]

    def to_json(self):
        return {
            "player": self.player.to_json(),
            "gameInstance": self.game_instance.to_json(),
            "value": self.value,
        }

    @classmethod
    def add_score(cls, user, game_instance, points):
        try:
            score = cls.objects.get(player=user, game_instance=game_instance)
        except cls.DoesNotExist:
            score = cls(player=user, game_instance=game_instance, value=0)

        score.value += points
        score.save()
