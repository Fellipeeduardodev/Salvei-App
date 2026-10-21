-- ==============================================================================
-- SALVEI — FASE 9: ADIÇÃO DE ONBOARDING E PREFERÊNCIAS AO PERFIL
-- ==============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"theme": "light", "shortcuts_enabled": true, "default_view": "inbox", "compact_cards": false}'::jsonb;
