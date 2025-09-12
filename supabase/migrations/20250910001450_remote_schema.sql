revoke select on table "auth"."schema_migrations" from "postgres";

CREATE TRIGGER sync_confirmed_email_trigger AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION sync_confirmed_email();

CREATE TRIGGER trigger_copy_user_to_profiles AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION copy_user_to_profiles();


