
CREATE OR REPLACE FUNCTION public.get_doctor_patients(p_doctor_id integer)
RETURNS TABLE(
    customerid integer,
    firstname character varying,
    lastname character varying,
    gender character varying,
    dateofbirth date,
    bloodgroup character varying,
    lastvisit date
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH DoctorPatients AS (
        SELECT DISTINCT a.customerid
        FROM appointments a
        WHERE a.doctorid = p_doctor_id
    )
    SELECT
        u.userid AS customerid,
        u.firstname,
        u.lastname,
        cp.gender,
        cp.dateofbirth,
        cp.bloodgroup,
        (
            SELECT MAX(a.appointmentdate)
            FROM appointments a
            WHERE a.customerid = u.userid AND a.doctorid = p_doctor_id
        ) AS lastvisit
    FROM
        users u
    JOIN
        customerprofiles cp ON u.userid = cp.customerid
    WHERE
        u.userid IN (SELECT customerid FROM DoctorPatients)
    ORDER BY
        lastvisit DESC NULLS LAST,
        u.lastname,
        u.firstname;
END;
$$;
