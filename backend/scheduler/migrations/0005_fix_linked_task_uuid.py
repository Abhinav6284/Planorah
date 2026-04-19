from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scheduler', '0004_alter_event_linked_task'),
        ('tasks', '0010_rename_tasks_eligi_user_id_8f7e5c_idx_tasks_eligi_user_id_d3624b_idx_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE scheduler_event
                    ALTER COLUMN linked_task_id TYPE uuid
                    USING NULL::uuid;
            """,
            reverse_sql="""
                ALTER TABLE scheduler_event
                    ALTER COLUMN linked_task_id TYPE bigint
                    USING NULL::bigint;
            """,
        ),
    ]
