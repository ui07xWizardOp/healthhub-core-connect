
CREATE OR REPLACE FUNCTION search_customers(p_search_term TEXT)
RETURNS TABLE (
    userid INT,
    firstname VARCHAR,
    lastname VARCHAR,
    email VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT u.userid, u.firstname, u.lastname, u.email
    FROM users u
    JOIN userrolemapping urm ON u.userid = urm.userid
    JOIN userroles ur ON urm.roleid = ur.roleid
    WHERE ur.rolename = 'Customer'
      AND u.isactive = TRUE
      AND (
        u.firstname ILIKE '%' || p_search_term || '%' OR
        u.lastname ILIKE '%' || p_search_term || '%' OR
        u.email ILIKE '%' || p_search_term || '%'
      )
    LIMIT 10;
END;
$$;

GRANT EXECUTE ON FUNCTION search_customers(TEXT) TO authenticated;


CREATE OR REPLACE FUNCTION search_products(p_search_term TEXT)
RETURNS TABLE (
    productid INT,
    productname VARCHAR,
    strength VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT p.productid, p.productname, p.strength
    FROM products p
    WHERE p.isactive = TRUE
      AND (
        p.productname ILIKE '%' || p_search_term || '%' OR
        p.genericname ILIKE '%' || p_search_term || '%'
      )
    LIMIT 10;
END;
$$;

GRANT EXECUTE ON FUNCTION search_products(TEXT) TO authenticated;
