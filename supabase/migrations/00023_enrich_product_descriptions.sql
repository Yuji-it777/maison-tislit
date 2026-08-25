-- Enrich product descriptions: replace one-line seed copy with full
-- e-commerce descriptions (FR + EN). First sentence is the hook because
-- ShopPage card previews clamp to two lines; the same copy feeds the
-- product page body, meta description and product JSON-LD.

UPDATE products SET
  description = 'Une majestueuse djellaba vert émeraude, brodée à la main de fils dorés le long de l''encolure et des manches. Une coupe fluide et élégante qui porte avec grâce des soirées de henné aux célébrations de mariage. Chaque pièce est finie à la main dans notre atelier marocain.',
  description_en = 'A majestic djellaba in deep emerald, hand-embroidered with golden thread along the neckline and sleeves. Cut for a fluid silhouette that carries gracefully from henna nights to wedding celebrations. Finished by hand in our Moroccan atelier.'
WHERE id = 1;

UPDATE products SET
  description = 'Une soie naturelle d''un bleu royal profond au lustre délicat qui capte la lumière à chaque pas. Un classique raffiné pour les cérémonies, sublimé par de fins détails traditionnels. Fabriquée à la main au Maroc.',
  description_en = 'Royal-blue natural silk with a soft lustre that catches the light with every step. A refined classic for ceremonies, elevated by delicate traditional detailing. Handcrafted in Morocco.'
WHERE id = 2;

UPDATE products SET
  description = '''Lumière de lune'' — une somptueuse takchita deux pièces en crêpe ivoire, rehaussée d''une ceinture lumineuse. Pensée pour les mariages et les grandes soirées. Chaque finition est réalisée à la main dans notre atelier.',
  description_en = '''Moonlight'' — a sumptuous two-piece takchita in ivory crepe, layered with a luminous belt. Made for weddings and grand evenings. Every finish is done by hand in our atelier.'
WHERE id = 3;

UPDATE products SET
  description = 'Le romantisme du rose poudré dans une coupe fluide deux pièces, adouci de délicates broderies. Un choix gracieux pour les fiançailles et les célébrations en journée. Fait main au Maroc.',
  description_en = 'Powder-pink romance in a flowing two-piece cut, softened with delicate embroidery. A graceful choice for engagements and daytime celebrations. Handmade in Morocco.'
WHERE id = 4;

UPDATE products SET
  description = 'Un velours bordeaux sans manches, d''une profondeur riche et d''une douceur incomparable. À porter sur un caftan ou seule pour les douces soirées d''hiver entre proches. Chaque pièce est finie main.',
  description_en = 'Sleeveless burgundy velvet, richly deep and wonderfully soft. Layer it over a caftan or wear alone for intimate winter evenings. Each piece is hand-finished.'
WHERE id = 5;

UPDATE products SET
  description = 'Un coton blanc léger qui respire avec vous — une élégance naturelle pour les journées chaudes et les réunions décontractées. Une pièce discrète et polyvalente, faite main au Maroc.',
  description_en = 'Lightweight white cotton that breathes with you — effortless elegance for warm days and casual gatherings. A quietly versatile piece, handmade in Morocco.'
WHERE id = 6;

UPDATE products SET
  description = 'Un velours brodé entièrement à la main — des heures de travail artisanal dans chaque motif. Une pièce d''exception pour les mariages et les grandes occasions.',
  description_en = 'Velvet embroidered entirely by hand — hours of artisanal work in every motif. A regal statement piece for weddings and milestone celebrations.'
WHERE id = 7;

UPDATE products SET
  description = 'Un ensemble traditionnel deux pièces dans le style fassi, fidèle à des siècles de savoir-faire cérémonial. Intemporelle, structurée, faite pour marquer les esprits. Faite main au Maroc.',
  description_en = 'A traditional two-piece ensemble in the Fassi style, faithful to centuries of ceremonial dressmaking. Timeless, structured, made to be remembered. Handcrafted in Morocco.'
WHERE id = 8;

UPDATE products SET
  description = 'Une soie pure à la chute naturelle et à la douceur incomparable. Un luxe discret pour les occasions festives. Fini à la main dans notre atelier marocain.',
  description_en = 'Pure silk with a natural fall and incomparable softness. Understated luxury for festive occasions. Finished by hand in our Moroccan workshop.'
WHERE id = 9;

UPDATE products SET
  description = 'Une ceinture dorée tissée main qui structure et sublime toute takchita, caftan ou gandoura. La touche finale qui unifie la silhouette.',
  description_en = 'A hand-woven gold belt that cinches and elevates any takchita, caftan or gandoura. The finishing touch that ties the whole silhouette together.'
WHERE id = 10;
