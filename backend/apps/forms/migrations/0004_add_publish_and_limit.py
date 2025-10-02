from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forms', '0003_add_help_hint'),
    ]

    operations = [
        migrations.AddField(
            model_name='form',
            name='is_published',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='form',
            name='submission_limit',
            field=models.PositiveIntegerField(blank=True, help_text='Optional maximum number of non-draft submissions allowed for this form', null=True),
        ),
    ]
