-- People: finance staff can't join an organisation; organiser roles can never approve money.
do $$
begin
  perform pg_temp.expect_error($q$insert into org_members (org_id, user_id, role_key) values ((select id from organisations where slug = 'zed-live'), (select id from users where name = 'Natasha Zulu'), 'finance')$q$, 'cannot join an organisation');
  perform pg_temp.expect_error($q$update org_roles set permissions = permissions || '{settlements.approve}' where key = 'finance' and org_id = (select id from organisations where slug = 'zed-live')$q$, 'check constraint');
  perform pg_temp.expect_error($q$insert into users (name, phone) values ('Bad phone', '0971234567')$q$, 'check constraint');
end $$;
