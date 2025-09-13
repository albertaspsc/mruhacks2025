drop policy "admin_delete" on "public"."admins";

drop policy "admin_insert" on "public"."admins";

drop policy "admin_update" on "public"."admins";

drop policy "admin_view_own" on "public"."admins";

drop policy "majors_insert_authenticated" on "public"."majors";

drop policy "Admins can view all marketing preferences" on "public"."mktg_preferences";

drop policy "Users can delete own marketing preferences" on "public"."mktg_preferences";

drop policy "Users can insert own marketing preferences" on "public"."mktg_preferences";

drop policy "Users can update own marketing preferences" on "public"."mktg_preferences";

drop policy "Admins can update parking info" on "public"."parking_info";

drop policy "Admins can view all parking info" on "public"."parking_info";

drop policy "Users can delete own parking info" on "public"."parking_info";

drop policy "Users can insert own parking info" on "public"."parking_info";

drop policy "Users can update own parking info" on "public"."parking_info";

drop policy "Users can view own parking info" on "public"."parking_info";

drop policy "Users can delete their own profile" on "public"."profile";

drop policy "users_insert_own_profile" on "public"."profile";

drop policy "users_update_own_profile" on "public"."profile";

drop policy "users_view_own_profile" on "public"."profile";

drop policy "universities_insert_authenticated" on "public"."universities";

drop policy "universities_select_all" on "public"."universities";

drop policy "user_restrictions_insert_own" on "public"."user_diet_restrictions";

drop policy "user_restrictions_select_own" on "public"."user_diet_restrictions";

drop policy "user_interests_insert_own" on "public"."user_interests";

drop policy "user_interests_select_own" on "public"."user_interests";

drop policy "Allow admin read access to registrations" on "public"."workshop_registrations";

drop policy "Authenticated users can read registrations" on "public"."workshop_registrations";

drop policy "Users can register for workshops" on "public"."workshop_registrations";

drop policy "Users can unregister from workshops" on "public"."workshop_registrations";

drop policy "Users can view their own registrations" on "public"."workshop_registrations";

drop policy "Authenticated users can delete workshops" on "public"."workshops";

drop policy "Authenticated users can insert workshops" on "public"."workshops";

drop policy "Authenticated users can update workshops" on "public"."workshops";

drop policy "Only authenticated users can view workshops" on "public"."workshops";

drop policy "Workshops are viewable by everyone" on "public"."workshops";

alter table "public"."dietary_restrictions" enable row level security;

alter table "public"."experience_types" enable row level security;

alter table "public"."gender" enable row level security;

alter table "public"."interests" enable row level security;

alter table "public"."majors" enable row level security;

alter table "public"."marketing_types" enable row level security;

alter table "public"."universities" enable row level security;

create policy "Enable users to view their own data only"
on "public"."admins"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable users to view their own data only"
on "public"."parking_info"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable users to view their own data only"
on "public"."profile"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable read access for all users"
on "public"."universities"
as permissive
for select
to public
using (true);


create policy "Enable users to view their own data only"
on "public"."user_diet_restrictions"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable users to view their own data only"
on "public"."user_interests"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable users to view their own data only"
on "public"."workshop_registrations"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable read access for all users"
on "public"."workshops"
as permissive
for select
to public
using (true);