-- Run only after applying the generated migration to an isolated development branch.
-- psql --set ON_ERROR_STOP=1 --file packages/db/tests/ownership.sql
-- All fixtures are rolled back on success; errors abort and disconnect rolls back.
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '15s';

DO $$
DECLARE
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  script_a uuid := gen_random_uuid();
  script_b uuid := gen_random_uuid();
  consent_a uuid := gen_random_uuid();
  consent_b uuid := gen_random_uuid();
  voice_a uuid := gen_random_uuid();
  voice_b uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.users (id, auth_subject) VALUES
    (owner_a, 'constraint-test/' || owner_a::text),
    (owner_b, 'constraint-test/' || owner_b::text);
  INSERT INTO public.scripts (id, owner_id, title, body) VALUES
    (script_a, owner_a, 'Test A', 'বাংলা ১২৩'),
    (script_b, owner_b, 'Test B', 'Bangla-English');
  INSERT INTO public.voice_consents (id, owner_id, policy_version, accepted_at) VALUES
    (consent_a, owner_a, 'test-only', now()),
    (consent_b, owner_b, 'test-only', now());
  INSERT INTO public.voices (id, owner_id, consent_id, name) VALUES
    (voice_a, owner_a, consent_a, 'Test A'),
    (voice_b, owner_b, consent_b, 'Test B');

  -- Valid owner associations and an optional voice must be accepted.
  INSERT INTO public.generations (owner_id, script_id, voice_id, controls, duration_ms) VALUES
    (owner_a, script_a, voice_a, '{"speed":1,"volume":1,"emotion":"neutral"}', 0),
    (owner_a, script_a, NULL, '{"speed":1,"volume":1,"emotion":"neutral"}', NULL);

  BEGIN
    INSERT INTO public.voices (owner_id, consent_id, name) VALUES (owner_a, consent_b, 'Must fail');
    RAISE EXCEPTION 'FAIL: cross-owner consent was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO public.generations (owner_id, script_id, controls)
      VALUES (owner_a, script_b, '{"speed":1,"volume":1,"emotion":"neutral"}');
    RAISE EXCEPTION 'FAIL: cross-owner script was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO public.generations (owner_id, script_id, voice_id, controls)
      VALUES (owner_a, script_a, voice_b, '{"speed":1,"volume":1,"emotion":"neutral"}');
    RAISE EXCEPTION 'FAIL: cross-owner voice was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO public.generations (owner_id, script_id, controls, duration_ms)
      VALUES (owner_a, script_a, '{"speed":1,"volume":1,"emotion":"neutral"}', -1);
    RAISE EXCEPTION 'FAIL: negative duration was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;

ROLLBACK;
\echo 'Ownership and duration assertions passed; fixtures rolled back.'
