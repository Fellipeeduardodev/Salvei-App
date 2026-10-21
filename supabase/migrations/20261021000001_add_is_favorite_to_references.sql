-- ==============================================================================
-- CURATOR — FASE 6: ADIÇÃO DO CAMPO IS_FAVORITE PARA AÇÕES RÁPIDAS E FILTRAGEM
-- ==============================================================================

alter table public."references" 
  add column if not exists is_favorite boolean not null default false;

create index if not exists idx_references_is_favorite 
  on public."references"(user_id, is_favorite);
