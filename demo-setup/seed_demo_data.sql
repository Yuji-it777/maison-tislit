-- ============================================================================
-- Maison Tislit - Demo Seed Data (PRODUCTS ONLY)
-- 14 fictional products. NO real customer, order, or user data.
-- Placeholder images via placehold.co - swap for real photos before launch.
-- Run AFTER schema_export.sql. Re-runnable thanks to ON CONFLICT DO NOTHING.
-- ============================================================================

INSERT INTO products (name, name_en, category, price, image, description, description_en, sizes, colors, badge, stock) VALUES
  ('Djellaba Amira Céleste', 'Celestial Amira Djellaba', 'djellaba', 1750, 'https://placehold.co/600x800/1b3a5c/e8d5a3/png?text=Djellaba+Amira', 'Djellaba en tissu brodé or avec ceinture assortie.', 'Gold-embroidered djellaba with matching belt.', '{XS,S,M,L,XL}', '{Bleu Céleste,Or,Émeraude}', 'Bestseller', 15),
  ('Djellaba Zellige d''Or', 'Golden Zellige Djellaba', 'djellaba', 1950, 'https://placehold.co/600x800/8a6d1f/f7e7b0/png?text=Zellige+d%27Or', 'Motifs zellige inspirés des riads de Fès.', 'Zellige patterns inspired by Fes riads.', '{XS,S,M,L,XL,XXL}', '{Or,Ambre,Cuivre}', 'Nouveau', 8),
  ('Djellaba Nuit de Marrakech', 'Marrakech Night Djellaba', 'djellaba', 1450, 'https://placehold.co/600x800/2c2c3a/c9a86c/png?text=Nuit+de+Marrakech', 'Djellaba en velours profond pour les soirées d''hiver.', 'Deep velvet djellaba for winter evenings.', '{S,M,L,XL}', '{Noir,Prune,Bordeaux}', NULL, 22),
  ('Djellaba Brise d''Agadir', 'Agadir Breeze Djellaba', 'djellaba', 1250, 'https://placehold.co/600x800/4a7c6f/eaf4ef/png?text=Brise+d%27Agadir', 'Djellaba légère en lin lavé, idéale pour l''été.', 'Lightweight washed-linen djellaba, ideal for summer.', '{S,M,L,XL}', '{Sage,Écru,Blanc}', NULL, 11),
  ('Takchita Lalla Salma', 'Lalla Salma Takchita', 'takchita', 3850, 'https://placehold.co/600x800/7d2e4d/f5d7e3/png?text=Takchita+Lalla+Salma', 'Takchita deux pièces en satin brodé main, col fermé.', 'Two-piece hand-embroidered satin takchita, closed collar.', '{XS,S,M,L}', '{Bordeaux,Champagne,Noir}', 'Premium', 5),
  ('Takchita Oasis Rose', 'Rose Oasis Takchita', 'takchita', 3100, 'https://placehold.co/600x800/e58aa9/fff0f5/png?text=Oasis+Rose', 'Ensemble romantique en crêpe rose poudré.', 'Romantic powder-pink crepe ensemble.', '{XS,S,M,L,XL}', '{Rose Poudré,Pêche,Ivoire}', 'Collection Spéciale', 9),
  ('Takchita Perle de Fès', 'Pearl of Fes Takchita', 'takchita', 4200, 'https://placehold.co/600x800/d6cfc0/4a4238/png?text=Perle+de+Fes', 'Perles nacrées cousues main sur soie ivoire.', 'Hand-sewn mother-of-pearl beads on ivory silk.', '{XS,S,M,L}', '{Ivoire,Argent,Champagne}', 'Premium', 4),
  ('Takchita Azur Royale', 'Royal Azure Takchita', 'takchita', 3450, 'https://placehold.co/600x800/1e5a8a/dcebf7/png?text=Azur+Royale', 'Bleu azur profond orné de fils métallisés.', 'Deep azure blue with metallic thread accents.', '{XS,S,M,L,XL}', '{Azur,Bleu Nuit,Marine}', NULL, 6),
  ('Takchita Mariée Andalouse', 'Andalusian Bride Takchita', 'takchita', 5200, 'https://placehold.co/600x800/9aa5b1/ffffff/png?text=Andalouse', 'Pièce de mariage en mousseline et perles.', 'Bridal piece in chiffon with pearl detailing.', '{XS,S,M}', '{Blanc,Argent,Or}', 'Premium', 3),
  ('Gandoura Sahara Dorée', 'Golden Sahara Gandoura', 'gandoura', 1150, 'https://placehold.co/600x800/c9a227/fbf3d0/png?text=Sahara+Doree', 'Gandoura en coton doré aux manches évasées.', 'Golden cotton gandoura with flared sleeves.', '{S,M,L,XL,XXL}', '{Or,Écru,Ambre}', NULL, 18),
  ('Gandoura Coton d''Été', 'Summer Cotton Gandoura', 'gandoura', 850, 'https://placehold.co/600x800/7fb3d5/eaf6ff/png?text=Coton+d%27Ete', 'Gandoura fraîche en coton respirant.', 'Breezy breathable-cotton gandoura.', '{S,M,L,XL}', '{Blanc,Ciel,Écru}', NULL, 30),
  ('Gandoura Velours Minuit', 'Midnight Velvet Gandoura', 'gandoura', 1300, 'https://placehold.co/600x800/33334d/c9c9e8/png?text=Velours+Minuit', 'Velours doux avec boutons brodés.', 'Soft velvet with embroidered buttons.', '{S,M,L,XL}', '{Noir,Marine,Bordeaux}', 'Nouveau', 14),
  ('Gandoura Émeraude Festive', 'Festive Emerald Gandoura', 'gandoura', 1400, 'https://placehold.co/600x800/14654a/c9e8d8/png?text=Emeraude+Festive', 'Parfaite pour les fêtes, bordée de fil doré.', 'Festival-ready with gold thread trim.', '{XS,S,M,L,XL}', '{Émeraude,Vert Sapin,Or}', 'Bestseller', 7),
  ('Gandoura Crème Dentelle', 'Cream Lace Gandoura', 'gandoura', 950, 'https://placehold.co/600x800/e8dcc8/6b5a3e/png?text=Creeme+Dentelle', 'Manches en dentelle fine, coupe fluide.', 'Fine-lace sleeves, fluid cut.', '{S,M,L,XL,XXL}', '{Crème,Blanc Cassé,Beige}', NULL, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Verify: should return 14 rows
-- SELECT COUNT(*) FROM products;
-- ============================================================================
