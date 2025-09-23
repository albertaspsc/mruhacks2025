drop view public.rsvpable_users;


alter table "public"."users" alter column "status" drop default;

alter type "public"."status" rename to "status__old_version_to_be_dropped";

create type "public"."status" as enum ('confirmed', 'pending', 'waitlisted', 'denied', 'declined');

alter table "public"."users" alter column status type "public"."status" using status::text::"public"."status";

alter table "public"."users" alter column "status" set default 'waitlisted'::status;

drop type "public"."status__old_version_to_be_dropped";

create or replace view public.rsvpable_users as
select
  u.id
from
  users u
  left join pre_reg p on p.email = u.email::text
  left join auth.users on users.id = u.id
where
  u.status = any (array['pending'::status, 'waitlisted'::status])
order by
  (p.email is not null) desc,
  users.created_at
limit
  145 - (select count(*) from users where status='confirmed');
