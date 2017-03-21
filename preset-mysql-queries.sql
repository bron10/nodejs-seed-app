CREATE TABLE `api_sessions` (
  `session_id` varchar(40) NOT NULL DEFAULT '0',
  `ip_address` varchar(45) NOT NULL DEFAULT '0',
  `user_agent` varchar(160) NOT NULL DEFAULT '',
  `last_activity` int(10) unsigned NOT NULL DEFAULT '0',
  `user_data` mediumtext,
  PRIMARY KEY (`session_id`),
  KEY `last_activity_idx` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `api_sessions`
ADD `user_id` INT(11),
MODIFY `session_id` VARCHAR(120);


ALTER TABLE `datetime_formats`
ADD COLUMN `moment` VARCHAR(255) NULL DEFAULT NULL AFTER `php_time`;
