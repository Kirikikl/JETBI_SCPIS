/*Get privilege on activated content for JETBI_SCPIS schema and SYSTEM username*/
call _SYS_REPO.GRANT_SCHEMA_PRIVILEGE_ON_ACTIVATED_CONTENT(
                'select, create any, insert, delete, update, execute, alter, drop',
                'JETBI_SCPIS',
                'SYSTEM');