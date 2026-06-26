-- Script para criar um usuário admin no banco de dados
-- Substitua 'seu-email@example.com' pelo email real

-- Opção 1: Se o usuário já existe, apenas atualize o role
UPDATE "user" 
SET role = 'admin' 
WHERE email = 'seu-email@example.com';

-- Opção 2: Verificar se a atualização funcionou
SELECT id, name, email, role FROM "user" WHERE email = 'seu-email@example.com';

-- Para verificar todos os admins
SELECT id, name, email, role FROM "user" WHERE role = 'admin';

-- Para remover acesso admin
UPDATE "user" 
SET role = 'user' 
WHERE email = 'seu-email@example.com';
