#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPlaiceholder } from 'plaiceholder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateLQIP() {
  const imagesDir = path.join(__dirname, '../public/images');
  const outputFile = path.join(__dirname, '../src/lqip-data.ts');
  
  // Gallery images that need LQIP
  const galleryImages = [
    'lounge_interior_1781264521294.webp',
    'bar_counter_1781264533823.webp',
    'chicken_pizza_1781264551782.webp',
    'latte_macchiato_1781264507039.webp',
    'fried_momo_1781264566590.webp',
    'rooftop_patio_1781264582785.webp',
  ];

  const lqipData = {};

  for (const image of galleryImages) {
    const imagePath = path.join(imagesDir, image);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  Skipping ${image} - file not found`);
      continue;
    }

    try {
      console.log(`Generating LQIP for ${image}...`);
      
      const { base64, img } = await getPlaiceholder(imagePath, {
        size: 10,
        quality: 70,
      });

      lqipData[image] = {
        src: `/images/${image}`,
        blurDataUrl: base64,
        width: img.width,
        height: img.height,
      };

      console.log(`✓ Generated LQIP for ${image}`);
    } catch (error) {
      console.error(`✗ Error generating LQIP for ${image}:`, error.message);
    }
  }

  // Write TypeScript file with LQIP data
  const tsContent = `// Auto-generated LQIP (Low Quality Image Placeholders) data
// Generated at: ${new Date().toISOString()}
// Run: npm run generate-lqip to regenerate

export const LQIP_DATA = ${JSON.stringify(lqipData, null, 2)};

export const getLQIPForImage = (src: string): string | undefined => {
  const entry = Object.values(LQIP_DATA).find((item: any) => item.src === src);
  return entry?.blurDataUrl;
};
`;

  fs.writeFileSync(outputFile, tsContent, 'utf-8');
  console.log(`\n✓ LQIP data written to ${outputFile}`);
  console.log(`Generated placeholders for ${Object.keys(lqipData).length} images`);
}

generateLQIP().catch((error) => {
  console.error('Failed to generate LQIP:', error);
  process.exit(1);
});
