# Generated by Django 3.2 on 2021-06-08 02:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games800', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gameinstance',
            name='game',
            field=models.CharField(choices=[('Feeling_Lucky', "Feelin' Lucky")], max_length=20),
        ),
    ]
