-- Enforce unique email and phone at DB level
alter table users add constraint users_email_unique unique (email);
alter table users add constraint users_phone_unique unique (phone);
