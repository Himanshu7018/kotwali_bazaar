-- Create admin user and assign role
-- Note: This creates the user with email confirmation bypassed
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Insert the admin user directly into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'sai692217@gmail.com',
        crypt('123456789', gen_salt('bf')),
        now(),
        now(),
        '',
        now(),
        '',
        null,
        '',
        '',
        null,
        null,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null
    ) RETURNING id INTO admin_user_id;
    
    -- Insert into auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        admin_user_id,
        format('{"sub": "%s", "email": "%s"}', admin_user_id, 'sai692217@gmail.com')::jsonb,
        'email',
        admin_user_id::text,
        now(),
        now(),
        now()
    );
    
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin');
    
END $$;