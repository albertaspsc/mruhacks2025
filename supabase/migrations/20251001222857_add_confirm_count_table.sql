create table "public"."confirmed_count" (
    "id" integer not null default 1,
    "count" bigint not null
);


CREATE UNIQUE INDEX confirmed_count_pkey ON public.confirmed_count USING btree (id);

alter table "public"."confirmed_count" add constraint "confirmed_count_pkey" PRIMARY KEY using index "confirmed_count_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.notify_confirmed_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  perform pg_notify(
    'confirmed_count_channel',
    (select count(*)::text from users where status = 'confirmed')
  );
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_confirmed_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  update confirmed_count
  set count = (select count(*) from users where status = 'confirmed')
  where id = 1;
  return null; -- safe since we'll do statement-level triggers
end;
$function$
;

insert into confirmed_count values (1, (select count(*) from users where status = 'confirmed'));


grant delete on table "public"."confirmed_count" to "anon";

grant insert on table "public"."confirmed_count" to "anon";

grant references on table "public"."confirmed_count" to "anon";

grant select on table "public"."confirmed_count" to "anon";

grant trigger on table "public"."confirmed_count" to "anon";

grant truncate on table "public"."confirmed_count" to "anon";

grant update on table "public"."confirmed_count" to "anon";

grant delete on table "public"."confirmed_count" to "authenticated";

grant insert on table "public"."confirmed_count" to "authenticated";

grant references on table "public"."confirmed_count" to "authenticated";

grant select on table "public"."confirmed_count" to "authenticated";

grant trigger on table "public"."confirmed_count" to "authenticated";

grant truncate on table "public"."confirmed_count" to "authenticated";

grant update on table "public"."confirmed_count" to "authenticated";

grant delete on table "public"."confirmed_count" to "service_role";

grant insert on table "public"."confirmed_count" to "service_role";

grant references on table "public"."confirmed_count" to "service_role";

grant select on table "public"."confirmed_count" to "service_role";

grant trigger on table "public"."confirmed_count" to "service_role";

grant truncate on table "public"."confirmed_count" to "service_role";

grant update on table "public"."confirmed_count" to "service_role";

CREATE TRIGGER trg_notify_confirmed_count AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH STATEMENT EXECUTE FUNCTION notify_confirmed_count();

CREATE TRIGGER users_confirmed_count_trg AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH STATEMENT EXECUTE FUNCTION update_confirmed_count();



