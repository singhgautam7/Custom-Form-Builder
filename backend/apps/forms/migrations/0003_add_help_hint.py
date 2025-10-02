from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forms', '0002_alter_question_question_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='help_text',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='question',
            name='hint',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
