-- PATCH V8: Tornar os comentários e anexos genéricos (Remover Foreign Key)

ALTER TABLE public.task_comments 
DROP CONSTRAINT IF EXISTS task_comments_task_id_fkey;

ALTER TABLE public.task_attachments 
DROP CONSTRAINT IF EXISTS task_attachments_task_id_fkey;
