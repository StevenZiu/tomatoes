-- project id can be null
alter table tomatos modify column project_id int unsigned default null;

-- add current timestamp as detaut value for end_at, and remove on update condition
alter table tomatos modify column end_at timestamp not null default current_timestamp;

-- remote on update condition for start_at
alter table tomatos modify column start_at timestamp not null default current_timestamp;