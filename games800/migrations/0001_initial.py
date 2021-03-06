# Generated by Django 3.2 on 2021-06-07 16:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GameInstance',
            fields=[
                ('id', models.CharField(max_length=4, primary_key=True, serialize=False, unique=True)),
                ('game', models.CharField(choices=[('Feeling_Lucky', 'Feeling_Lucky')], max_length=20)),
                ('accepting_joins', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('username', models.CharField(max_length=10, primary_key=True, serialize=False, unique=True)),
                ('screen_name', models.CharField(max_length=20, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Score',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.IntegerField(default=0)),
                ('game_instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='games800.gameinstance')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='games800.user')),
            ],
        ),
        migrations.AddField(
            model_name='gameinstance',
            name='participants',
            field=models.ManyToManyField(to='games800.User'),
        ),
        migrations.CreateModel(
            name='FeelinLuckySubmission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('search_query', models.CharField(max_length=30)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='games800.user')),
                ('game_instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='games800.gameinstance')),
            ],
        ),
        migrations.CreateModel(
            name='FeelinLuckyGuess',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='authored_guesses', to='games800.user')),
                ('guesser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='guessed_guesses', to='games800.user')),
                ('image_submission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='image_guesses', to='games800.feelinluckysubmission')),
                ('search_submission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='search_guesses', to='games800.feelinluckysubmission')),
            ],
        ),
        migrations.CreateModel(
            name='FeelinLuckyCandidate',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('filename', models.CharField(max_length=200)),
                ('chosen', models.BooleanField(null=True)),
                ('submission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidates', to='games800.feelinluckysubmission')),
            ],
        ),
        migrations.AddConstraint(
            model_name='score',
            constraint=models.UniqueConstraint(fields=('player', 'game_instance'), name='unique_player_and_game'),
        ),
        migrations.AddConstraint(
            model_name='feelinluckysubmission',
            constraint=models.UniqueConstraint(fields=('author', 'game_instance'), name='unique_author_and_game'),
        ),
        migrations.AddConstraint(
            model_name='feelinluckyguess',
            constraint=models.UniqueConstraint(fields=('guesser', 'image_submission'), name='unique_guess'),
        ),
        migrations.AddConstraint(
            model_name='feelinluckycandidate',
            constraint=models.UniqueConstraint(fields=('submission', 'chosen'), name='one_chosen_per_submission'),
        ),
        migrations.AddConstraint(
            model_name='feelinluckycandidate',
            constraint=models.UniqueConstraint(fields=('submission', 'filename'), name='unique_filename'),
        ),
    ]
