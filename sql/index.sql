CREATE DATABASE IF NOT EXISTS tomatodb;
use tomatodb;

create table if not exists Users(
  user_id int unsigned auto_increment primary key,
  first_name varchar(20) not null,
  last_name varchar(20) not null,
  email_address varchar(50) not null unique,
  login_password varchar(30) not null,
  profile_photo varchar(500) default null,
  register_at timestamp default current_timestamp,
  update_at timestamp default current_timestamp on update current_timestamp
);

create table if not exists Projects(
  project_id int unsigned auto_increment primary key,
  -- foreign key
  user_id int unsigned not null,
  project_name varchar(50) not null,
  project_description varchar(500) not null,
  created_at timestamp default current_timestamp,
  update_at timestamp default current_timestamp on update current_timestamp
);

create table if not exists Tomatos(
  tomato_id int unsigned auto_increment primary key,
  -- foreign key
  user_id int unsigned not null,
  project_id int unsigned not null,
  tomato_title varchar(100) not null,
  tomato_description varchar(500) not null,
  start_at timestamp not null,
  end_at timestamp not null,
  updated_at timestamp default null on update current_timestamp
);



