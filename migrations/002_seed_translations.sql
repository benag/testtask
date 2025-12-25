-- Migration 002: Seed Translations
-- Insert initial languages and translation data

-- Insert default languages
INSERT INTO languages (code, name, is_active) VALUES
    ('en', 'English', true),
    ('he', 'Hebrew', true),
    ('ru', 'Russian', true)
ON CONFLICT (code) DO NOTHING;

-- Insert translation keys for dynamic content (admin-managed)
INSERT INTO translation_keys (key_name, description, category) VALUES
    -- Task status translations
    ('task.status.todo', 'Task status: To Do', 'task_status'),
    ('task.status.in_progress', 'Task status: In Progress', 'task_status'),
    ('task.status.done', 'Task status: Done', 'task_status'),
    
    -- Task priority translations
    ('task.priority.low', 'Task priority: Low', 'task_priority'),
    ('task.priority.medium', 'Task priority: Medium', 'task_priority'),
    ('task.priority.high', 'Task priority: High', 'task_priority'),
    
    -- Error messages
    ('error.validation.required', 'This field is required', 'errors'),
    ('error.validation.email', 'Please enter a valid email address', 'errors'),
    ('error.validation.password', 'Password must be at least 6 characters', 'errors'),
    ('error.auth.invalid_credentials', 'Invalid email or password', 'errors'),
    ('error.auth.unauthorized', 'You are not authorized to perform this action', 'errors'),
    ('error.task.not_found', 'Task not found', 'errors'),
    
    -- Success messages
    ('success.task.created', 'Task created successfully', 'messages'),
    ('success.task.updated', 'Task updated successfully', 'messages'),
    ('success.task.deleted', 'Task deleted successfully', 'messages'),
    ('success.translation.saved', 'Translation saved successfully', 'messages'),
    
    -- General messages
    ('message.no_tasks', 'No tasks found. Create your first task!', 'messages'),
    ('message.loading', 'Loading...', 'messages'),
    ('message.confirm_delete', 'Are you sure you want to delete this item?', 'messages')
ON CONFLICT (key_name) DO NOTHING;

-- Insert English translations
INSERT INTO translations (translation_key_id, language_id, value)
SELECT 
    tk.id,
    l.id,
    CASE tk.key_name
        -- Task status
        WHEN 'task.status.todo' THEN 'To Do'
        WHEN 'task.status.in_progress' THEN 'In Progress'
        WHEN 'task.status.done' THEN 'Done'
        
        -- Task priority
        WHEN 'task.priority.low' THEN 'Low'
        WHEN 'task.priority.medium' THEN 'Medium'
        WHEN 'task.priority.high' THEN 'High'
        
        -- Error messages
        WHEN 'error.validation.required' THEN 'This field is required'
        WHEN 'error.validation.email' THEN 'Please enter a valid email address'
        WHEN 'error.validation.password' THEN 'Password must be at least 6 characters'
        WHEN 'error.auth.invalid_credentials' THEN 'Invalid email or password'
        WHEN 'error.auth.unauthorized' THEN 'You are not authorized to perform this action'
        WHEN 'error.task.not_found' THEN 'Task not found'
        
        -- Success messages
        WHEN 'success.task.created' THEN 'Task created successfully'
        WHEN 'success.task.updated' THEN 'Task updated successfully'
        WHEN 'success.task.deleted' THEN 'Task deleted successfully'
        WHEN 'success.translation.saved' THEN 'Translation saved successfully'
        
        -- General messages
        WHEN 'message.no_tasks' THEN 'No tasks found. Create your first task!'
        WHEN 'message.loading' THEN 'Loading...'
        WHEN 'message.confirm_delete' THEN 'Are you sure you want to delete this item?'
    END
FROM translation_keys tk
CROSS JOIN languages l
WHERE l.code = 'en'
ON CONFLICT (translation_key_id, language_id) DO NOTHING;

-- Insert Hebrew translations
INSERT INTO translations (translation_key_id, language_id, value)
SELECT 
    tk.id,
    l.id,
    CASE tk.key_name
        -- Task status
        WHEN 'task.status.todo' THEN 'לביצוע'
        WHEN 'task.status.in_progress' THEN 'בתהליך'
        WHEN 'task.status.done' THEN 'הושלם'
        
        -- Task priority
        WHEN 'task.priority.low' THEN 'נמוך'
        WHEN 'task.priority.medium' THEN 'בינוני'
        WHEN 'task.priority.high' THEN 'גבוה'
        
        -- Error messages
        WHEN 'error.validation.required' THEN 'שדה זה הוא חובה'
        WHEN 'error.validation.email' THEN 'אנא הזן כתובת אימייל תקינה'
        WHEN 'error.validation.password' THEN 'הסיסמה חייבת להכיל לפחות 6 תווים'
        WHEN 'error.auth.invalid_credentials' THEN 'אימייל או סיסמה שגויים'
        WHEN 'error.auth.unauthorized' THEN 'אין לך הרשאה לבצע פעולה זו'
        WHEN 'error.task.not_found' THEN 'המשימה לא נמצאה'
        
        -- Success messages
        WHEN 'success.task.created' THEN 'המשימה נוצרה בהצלחה'
        WHEN 'success.task.updated' THEN 'המשימה עודכנה בהצלחה'
        WHEN 'success.task.deleted' THEN 'המשימה נמחקה בהצלחה'
        WHEN 'success.translation.saved' THEN 'התרגום נשמר בהצלחה'
        
        -- General messages
        WHEN 'message.no_tasks' THEN 'לא נמצאו משימות. צור את המשימה הראשונה שלך!'
        WHEN 'message.loading' THEN 'טוען...'
        WHEN 'message.confirm_delete' THEN 'האם אתה בטוח שברצונך למחוק פריט זה?'
    END
FROM translation_keys tk
CROSS JOIN languages l
WHERE l.code = 'he'
ON CONFLICT (translation_key_id, language_id) DO NOTHING;

-- Insert Russian translations
INSERT INTO translations (translation_key_id, language_id, value)
SELECT 
    tk.id,
    l.id,
    CASE tk.key_name
        -- Task status
        WHEN 'task.status.todo' THEN 'К выполнению'
        WHEN 'task.status.in_progress' THEN 'В процессе'
        WHEN 'task.status.done' THEN 'Выполнено'
        
        -- Task priority
        WHEN 'task.priority.low' THEN 'Низкий'
        WHEN 'task.priority.medium' THEN 'Средний'
        WHEN 'task.priority.high' THEN 'Высокий'
        
        -- Error messages
        WHEN 'error.validation.required' THEN 'Это поле обязательно'
        WHEN 'error.validation.email' THEN 'Пожалуйста, введите действительный адрес электронной почты'
        WHEN 'error.validation.password' THEN 'Пароль должен содержать не менее 6 символов'
        WHEN 'error.auth.invalid_credentials' THEN 'Неверный email или пароль'
        WHEN 'error.auth.unauthorized' THEN 'У вас нет разрешения на выполнение этого действия'
        WHEN 'error.task.not_found' THEN 'Задача не найдена'
        
        -- Success messages
        WHEN 'success.task.created' THEN 'Задача успешно создана'
        WHEN 'success.task.updated' THEN 'Задача успешно обновлена'
        WHEN 'success.task.deleted' THEN 'Задача успешно удалена'
        WHEN 'success.translation.saved' THEN 'Перевод успешно сохранен'
        
        -- General messages
        WHEN 'message.no_tasks' THEN 'Задачи не найдены. Создайте свою первую задачу!'
        WHEN 'message.loading' THEN 'Загрузка...'
        WHEN 'message.confirm_delete' THEN 'Вы уверены, что хотите удалить этот элемент?'
    END
FROM translation_keys tk
CROSS JOIN languages l
WHERE l.code = 'ru'
ON CONFLICT (translation_key_id, language_id) DO NOTHING;

-- Insert default admin user (password: admin123)
-- Hash generated with bcrypt for 'admin123'
INSERT INTO users (email, password_hash, role, preferred_language) VALUES
    ('admin@test.com', '$2b$10$4TTNPqMzVrWe6yolnHUoteyvzGOzoDelifMxOanb2K8v4jvMX7bVi', 'admin', 'en')
ON CONFLICT (email) DO NOTHING;

-- Insert default test user (password: test123)
-- Hash generated with bcrypt for 'test123'
INSERT INTO users (email, password_hash, role, preferred_language) VALUES
    ('user@test.com', '$2b$10$JwqKBQR8JtNy6T74VN5Gn.HIXCcndGykIwyotuwFz.GiNeirmRcFS', 'user', 'en')
ON CONFLICT (email) DO NOTHING;
