drop policy "Users can delete their own registrations" on "public"."users";

drop policy "users_insert_own" on "public"."users";

drop policy "users_select_own" on "public"."users";

drop policy "users_update_own" on "public"."users";

create policy "Enable users to view their own data only"
on "public"."users"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));