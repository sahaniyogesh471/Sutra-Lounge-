#!/usr/bin/env node

/**
 * Cloudflare Pages Deployment Validation
 * Validates build output and configuration before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset}  ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`),
};

// Validation checks
const checks = {
  distDir: {
    name: 'Distribution directory exists',
    run: () => fs.existsSync(DIST_DIR),
  },
  indexHtml: {
    name: 'index.html exists',
    run: () => fs.existsSync(path.join(DIST_DIR, 'index.html')),
  },
  assetsDir: {
    name: 'assets directory exists',
    run: () => fs.existsSync(path.join(DIST_DIR, 'assets')),
  },
  imagesDir: {
    name: 'images directory exists',
    run: () => fs.existsSync(path.join(DIST_DIR, 'images')),
  },
  redirects: {
    name: '_redirects file exists',
    run: () => fs.existsSync(path.join(DIST_DIR, '_redirects')),
  },
  headers: {
    name: '_headers file exists',
    run: () => fs.existsSync(path.join(DIST_DIR, '_headers')),
  },
  routes: {
    name: '_routes.json file exists',
    run: () => fs.existsSync(path.join(DIST_DIR, '_routes.json')),
  },
  bundleSize: {
    name: 'Bundle size check',
    run: () => {
      try {
        const files = fs.readdirSync(path.join(DIST_DIR, 'assets')).filter(f => f.endsWith('.js'));
        const sizes = files.map(f => ({
          name: f,
          size: fs.statSync(path.join(DIST_DIR, 'assets', f)).size / 1024,
        }));
        
        const mainBundle = sizes.find(f => f.name.startsWith('index-'));
        if (mainBundle && mainBundle.size > 500) {
          console.log(`    Main bundle: ${mainBundle.size.toFixed(2)} KB (exceeds 500 KB threshold)`);
          return false;
        }
        
        sizes.forEach(f => {
          console.log(`    ${f.name}: ${f.size.toFixed(2)} KB`);
        });
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  configValidation: {
    name: 'Wrangler configuration valid',
    run: () => {
      const wranglerPath = path.join(PROJECT_ROOT, 'wrangler.toml');
      return fs.existsSync(wranglerPath) && fs.readFileSync(wranglerPath, 'utf8').includes('sutra-lounge');
    },
  },
  envVariables: {
    name: 'Environment variables configured',
    run: () => {
      const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
      return required.every(env => process.env[env]);
    },
  },
};

// Run validation
async function validate() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Cloudflare Pages Deployment Validation${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const results = [];

  for (const [key, check] of Object.entries(checks)) {
    try {
      const passed = check.run();
      results.push({ key, passed });
      
      if (passed) {
        log.success(check.name);
      } else {
        log.error(check.name);
      }
    } catch (error) {
      results.push({ key, passed: false, error: error.message });
      log.error(`${check.name} - Error: ${error.message}`);
    }
  }

  // Summary
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  
  if (passedCount === totalCount) {
    log.success(`All ${totalCount} checks passed!`);
    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);
    process.exit(0);
  } else {
    log.error(`${passedCount}/${totalCount} checks passed`);
    
    const failedChecks = results.filter(r => !r.passed);
    console.log(`\nFailed checks:`);
    failedChecks.forEach(check => {
      log.error(check.key);
    });
    
    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);
    process.exit(1);
  }
}

validate().catch(error => {
  log.error(`Validation failed: ${error.message}`);
  process.exit(1);
});
