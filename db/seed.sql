-- Seed data for demo purposes

BEGIN;

-- Demo contacts
INSERT INTO contacts (id, first_name, last_name, telephone, mobile, email) VALUES
  (7, 'Amelia', 'Grant', '02079460001', '07700901001', 'amelia.grant@example.com'),
  (8, 'Marcus', 'Cole', '02079460002', '07700901002', 'marcus.cole@example.com'),
  (9, 'Priya', 'Shah', '02079460003', '07700901003', 'priya.shah@example.com'),
  (10, 'Ethan', 'Brooks', '02079460004', '07700901004', 'ethan.brooks@example.com'),
  (11, 'Layla', 'Nguyen', '02079460005', '07700901005', 'layla.nguyen@example.com'),
  (12, 'Oliver', 'Hart', '02079460006', '07700901006', 'oliver.hart@example.com'),
  (13, 'Zara', 'Ali', '02079460007', '07700901007', 'zara.ali@example.com'),
  (14, 'Noah', 'Foster', '02079460008', '07700901008', 'noah.foster@example.com'),
  (15, 'Sophia', 'Price', '02079460009', '07700901009', 'sophia.price@example.com'),
  (16, 'Liam', 'Ross', '02079460010', '07700901010', 'liam.ross@example.com');

-- Primary contact preferences
INSERT INTO customer (id, forename, lastname, tel, mobile, email, primarycontact) VALUES
  (7, 'Amelia', 'Grant', '02079460001', '07700901001', 'amelia.grant@example.com', 'email'),
  (8, 'Marcus', 'Cole', '02079460002', '07700901002', 'marcus.cole@example.com', 'mobile'),
  (9, 'Priya', 'Shah', '02079460003', '07700901003', 'priya.shah@example.com', 'telephone'),
  (10, 'Ethan', 'Brooks', '02079460004', '07700901004', 'ethan.brooks@example.com', 'email'),
  (11, 'Layla', 'Nguyen', '02079460005', '07700901005', 'layla.nguyen@example.com', 'mobile'),
  (12, 'Oliver', 'Hart', '02079460006', '07700901006', 'oliver.hart@example.com', 'email'),
  (13, 'Zara', 'Ali', '02079460007', '07700901007', 'zara.ali@example.com', 'telephone'),
  (14, 'Noah', 'Foster', '02079460008', '07700901008', 'noah.foster@example.com', 'email'),
  (15, 'Sophia', 'Price', '02079460009', '07700901009', 'sophia.price@example.com', 'mobile'),
  (16, 'Liam', 'Ross', '02079460010', '07700901010', 'liam.ross@example.com', 'email');

-- Addresses
CALL public.create_addressrecord(7, '18 Riverside Court'::varchar, 'Thames Street'::varchar, 'Richmond'::varchar, 'Greater London'::varchar, 'TW10 6DN'::varchar, 'United Kingdom'::varchar, '2021-04-15'::date, '2024-03-31'::date, NULL);
CALL public.create_addressrecord(8, '44 Ivy House'::varchar, 'Market Lane'::varchar, 'Leeds'::varchar, 'West Yorkshire'::varchar, 'LS1 5AA'::varchar, 'United Kingdom'::varchar, '2020-02-01'::date, '2023-11-30'::date, NULL);
CALL public.create_addressrecord(9, '7 Orchard View'::varchar, 'Kings Road'::varchar, 'Birmingham'::varchar, 'West Midlands'::varchar, 'B1 2AA'::varchar, 'United Kingdom'::varchar, '2019-08-20'::date, '2025-08-19'::date, NULL);
CALL public.create_addressrecord(10, '92 Harbor Heights'::varchar, 'Seafront Avenue'::varchar, 'Brighton'::varchar, 'East Sussex'::varchar, 'BN1 3QA'::varchar, 'United Kingdom'::varchar, '2022-01-10'::date, '2026-01-09'::date, NULL);
CALL public.create_addressrecord(11, '3 Willow Cottage'::varchar, 'Station Road'::varchar, 'Cambridge'::varchar, 'Cambridgeshire'::varchar, 'CB1 2RF'::varchar, 'United Kingdom'::varchar, '2021-06-05'::date, '2024-06-04'::date, NULL);
CALL public.create_addressrecord(12, '5 Maple Apartments'::varchar, 'Bridge Street'::varchar, 'Glasgow'::varchar, 'Lanarkshire'::varchar, 'G1 2FF'::varchar, 'United Kingdom'::varchar, '2018-09-01'::date, '2022-09-01'::date, NULL);
CALL public.create_addressrecord(13, '28 Cedar House'::varchar, 'Victoria Road'::varchar, 'Cardiff'::varchar, 'South Glamorgan'::varchar, 'CF10 3AT'::varchar, 'United Kingdom'::varchar, '2020-12-12'::date, '2024-12-11'::date, NULL);
CALL public.create_addressrecord(14, '11 Elm Terrace'::varchar, 'High Street'::varchar, 'York'::varchar, 'North Yorkshire'::varchar, 'YO1 7HP'::varchar, 'United Kingdom'::varchar, '2023-03-01'::date, '2026-02-28'::date, NULL);
CALL public.create_addressrecord(15, '60 Skyline Plaza'::varchar, 'Queen Street'::varchar, 'Edinburgh'::varchar, 'Midlothian'::varchar, 'EH2 4AD'::varchar, 'United Kingdom'::varchar, '2022-05-20'::date, '2025-05-19'::date, NULL);
CALL public.create_addressrecord(16, '2 Meadow View'::varchar, 'Church Lane'::varchar, 'Oxford'::varchar, 'Oxfordshire'::varchar, 'OX1 1AA'::varchar, 'United Kingdom'::varchar, '2019-10-10'::date, '2023-10-09'::date, NULL);

-- Vehicles
CALL public.create_vehiclerecord(7, 'Toyota'::varchar, 'Corolla'::varchar, '2021-03-15'::date, '2021-05-20'::date, NULL);
CALL public.create_vehiclerecord(8, 'Ford'::varchar, 'Focus'::varchar, '2019-09-10'::date, '2019-11-12'::date, NULL);
CALL public.create_vehiclerecord(9, 'Tesla'::varchar, 'Model 3'::varchar, '2022-07-05'::date, '2022-08-01'::date, NULL);
CALL public.create_vehiclerecord(10, 'BMW'::varchar, '3 Series'::varchar, '2020-04-18'::date, '2020-06-22'::date, NULL);
CALL public.create_vehiclerecord(11, 'Audi'::varchar, 'A4'::varchar, '2018-02-12'::date, '2018-03-15'::date, NULL);
CALL public.create_vehiclerecord(12, 'Volkswagen'::varchar, 'Golf'::varchar, '2017-11-30'::date, '2018-01-05'::date, NULL);
CALL public.create_vehiclerecord(13, 'Honda'::varchar, 'Civic'::varchar, '2021-08-25'::date, '2021-10-02'::date, NULL);
CALL public.create_vehiclerecord(14, 'Nissan'::varchar, 'Qashqai'::varchar, '2023-01-15'::date, '2023-02-10'::date, NULL);
CALL public.create_vehiclerecord(15, 'Kia'::varchar, 'Sportage'::varchar, '2022-09-01'::date, '2022-10-05'::date, NULL);
CALL public.create_vehiclerecord(16, 'Hyundai'::varchar, 'Tucson'::varchar, '2020-06-20'::date, '2020-08-01'::date, NULL);

-- Extra vehicle owner records to showcase filtering
CALL public.create_vehiclerecord(7, 'BMW'::varchar, 'X5'::varchar, '2019-05-01'::date, '2019-06-15'::date, NULL);
CALL public.create_vehiclerecord(8, 'Tesla'::varchar, 'Model Y'::varchar, '2023-02-10'::date, '2023-03-01'::date, NULL);
CALL public.create_vehiclerecord(9, 'Toyota'::varchar, 'Prius'::varchar, '2018-09-12'::date, '2018-10-20'::date, NULL);
CALL public.create_vehiclerecord(10, 'Audi'::varchar, 'Q3'::varchar, '2021-11-05'::date, '2021-12-01'::date, NULL);
CALL public.create_vehiclerecord(11, 'Ford'::varchar, 'Fiesta'::varchar, '2016-07-22'::date, '2016-08-15'::date, NULL);
CALL public.create_vehiclerecord(12, 'Honda'::varchar, 'CR-V'::varchar, '2020-03-18'::date, '2020-04-10'::date, NULL);
CALL public.create_vehiclerecord(13, 'Volkswagen'::varchar, 'Passat'::varchar, '2019-01-30'::date, '2019-02-22'::date, NULL);
CALL public.create_vehiclerecord(14, 'Kia'::varchar, 'Niro'::varchar, '2022-06-14'::date, '2022-07-01'::date, NULL);
CALL public.create_vehiclerecord(15, 'Hyundai'::varchar, 'Ioniq'::varchar, '2021-09-09'::date, '2021-10-01'::date, NULL);
CALL public.create_vehiclerecord(16, 'Nissan'::varchar, 'Leaf'::varchar, '2018-04-25'::date, '2018-05-20'::date, NULL);

-- Reset sequences to the latest IDs
SELECT pg_catalog.setval('public.contacts_id_seq', (SELECT MAX(id) FROM contacts), true);
SELECT pg_catalog.setval('public.customer_id_seq', (SELECT MAX(id) FROM customer), true);

COMMIT;
