SET @profile_image_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'doctor'
    AND COLUMN_NAME = 'ProfileImageUrl'
);

SET @add_profile_image_sql = IF(
  @profile_image_column_exists = 0,
  'ALTER TABLE doctor ADD COLUMN ProfileImageUrl VARCHAR(255) NULL',
  'SELECT ''doctor.ProfileImageUrl already exists'' AS Message'
);

PREPARE add_profile_image_stmt FROM @add_profile_image_sql;
EXECUTE add_profile_image_stmt;
DEALLOCATE PREPARE add_profile_image_stmt;
