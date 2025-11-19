CREATE TABLE IF NOT EXISTS kenya_carbon_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  vintage INT,
  total_tonnes NUMERIC(10,2),
  available_tonnes NUMERIC(10,2),
  price_per_tonne NUMERIC(10,2),
  verification_standard TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO kenya_carbon_credits (
  project_name, 
  project_type, 
  description, 
  location, 
  vintage, 
  total_tonnes, 
  available_tonnes, 
  price_per_tonne, 
  verification_standard,
  image_url
) VALUES
(
  'Kisumu Clean Cookstove Distribution',
  'clean_cooking',
  'Distribution of 5,000 improved cookstoves to rural households in Kisumu County, reducing indoor air pollution and deforestation. Each stove saves approximately 2.5 tonnes CO2e annually.',
  'Kisumu County, Kenya',
  2024,
  12500,
  8200,
  8.50,
  'Gold Standard',
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800'
),
(
  'Nairobi Solar Home Systems',
  'solar_energy',
  'Installation of 3,000 solar home systems in peri-urban Nairobi communities, providing clean electricity access and eliminating kerosene lamp usage.',
  'Nairobi, Kenya',
  2024,
  9000,
  6500,
  12.00,
  'Verra VCS',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'
),
(
  'Turkana Biogas Digesters',
  'biogas',
  'Community biogas digesters serving 500 households in Turkana, converting livestock waste into clean cooking fuel and organic fertilizer.',
  'Turkana County, Kenya',
  2023,
  3500,
  1200,
  10.50,
  'Gold Standard',
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800'
),
(
  'Mombasa Solar Water Pumps',
  'solar_energy',
  'Solar-powered water pumping systems for 25 farming cooperatives in coastal Kenya, replacing diesel pumps and enabling sustainable irrigation.',
  'Mombasa County, Kenya',
  2024,
  4200,
  3800,
  11.00,
  'Verra VCS',
  'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800'
),
(
  'Kakamega Community Reforestation',
  'reforestation',
  'Native tree planting initiative across 800 hectares in Kakamega Forest buffer zones, engaging 200 local families in agroforestry practices.',
  'Kakamega County, Kenya',
  2023,
  15000,
  12000,
  6.50,
  'Plan Vivo',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'
),
(
  'Nakuru Efficient Charcoal Stoves',
  'clean_cooking',
  'Distribution of 8,000 efficient charcoal stoves in Nakuru informal settlements, reducing charcoal consumption by 50% per household.',
  'Nakuru County, Kenya',
  2024,
  18000,
  15000,
  7.50,
  'Gold Standard',
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800'
),
(
  'Garissa Solar Mini-Grids',
  'solar_energy',
  'Three solar mini-grids serving remote villages in Garissa, providing electricity to 1,500 households and local businesses.',
  'Garissa County, Kenya',
  2024,
  7500,
  5000,
  13.50,
  'Verra VCS',
  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800'
),
(
  'Kericho Tea Estate Solar',
  'solar_energy',
  'Solar PV installation at tea processing facilities, replacing grid electricity with 2MW of clean energy.',
  'Kericho County, Kenya',
  2023,
  6000,
  2500,
  14.00,
  'I-REC',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800'
);
