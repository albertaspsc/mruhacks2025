alter table "public"."users" alter column "status" drop default;

alter type "public"."status" rename to "status__old_version_to_be_dropped";

create type "public"."status" as enum ('confirmed', 'pending', 'waitlisted', 'denied', 'declined');

alter table "public"."users" alter column status type "public"."status" using status::text::"public"."status";

alter table "public"."users" alter column "status" set default 'waitlisted'::status;

drop type "public"."status__old_version_to_be_dropped";



