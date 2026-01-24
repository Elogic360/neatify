#!/bin/bash
cd /home/elogic360/Documents/CODELAB/e_commerce&store


        modified:   backend/app/models/product.py
        modified:   backend/app/routers/__init__.py
        modified:   backend/app/routers/analytics.py
        modified:   backend/app/routers/cart.py
        modified:   backend/app/routers/products.py
        modified:   backend/app/services/cart_service.py
        modified:   backend/create_admin.py
        modified:   backend/requirements.txt
        modified:   docker-compose.yml
        modified:   frontend/.env.example
        modified:   frontend/package.json
        modified:   frontend/src/app/api.ts
        modified:   frontend/src/components/admin/StatCard.tsx
        modified:   frontend/src/components/products/ProductCard.tsx
        modified:   frontend/src/components/ui/Badge.tsx
        modified:   frontend/src/components/ui/Card.tsx
        modified:   frontend/src/components/ui/Modal.tsx
        modified:   frontend/src/hooks/useProducts.ts
        modified:   frontend/src/main.tsx
        modified:   frontend/src/pages/AdminDashboard.tsx
        modified:   frontend/src/pages/AdminPanel.tsx
        modified:   frontend/src/pages/AdminProductsNew.tsx
        modified:   frontend/src/pages/HomePage.tsx
        modified:   frontend/src/pages/admin/CustomersAdminPage.tsx
        modified:   frontend/src/pages/admin/DashboardPage.tsx
        modified:   frontend/src/pages/admin/InventoryAdminPage.tsx
        modified:   frontend/src/pages/admin/OrderDetailPage.tsx
        modified:   frontend/src/pages/admin/OrdersAdminPage.tsx
        modified:   frontend/src/pages/admin/ProductsAdminPage.tsx
        modified:   frontend/tsconfig.json
        modified:   frontend/vite.config.ts
        modified:   guide.md
        modified:   init_git.sh
        modified:   setup_github.sh

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        DATABASE_MIGRATION_GUIDE.md
        DEPLOYMENT_GUIDE.md
        DEPLOYMENT_README.md
        backend/Procfile
        backend/app/api/routes/inventory_public.py
        backend/app/routers/inventory_public.py
        backend/test_session_tracking.py
        backend/uvicorn_config.py
        export_db.sh
        import_db.sh
        netlify.toml
        render.yaml

no changes added to commit (use "git add" and/or "git commit -a")
 *  Terminal will be reused by tasks, press any key to close it. 

 *  Executing task: cd frontend && npx tsc --noEmit 

src/hooks/useProducts.ts:4:26 - error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.

4 import { useQuery } from '@tanstack/react-query';
                           ~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/useProducts.ts:8:10 - error TS2614: Module '"../services/productService"' has no exported member 'getProducts'. Did you mean to use 'import getProducts from "../services/productService"' instead?

8 import { getProducts } from '../services/productService';
           ~~~~~~~~~~~

src/hooks/useProducts.ts:88:26 - error TS2551: Property 'categoryId' does not exist on type 'ProductFilters'. Did you mean 'category_id'?

88     category_id: filters.categoryId,
                            ~~~~~~~~~~

  src/types/product.ts:128:3
    128   category_id?: number;
          ~~~~~~~~~~~
    'category_id' is declared here.

src/hooks/useProducts.ts:90:24 - error TS2551: Property 'minPrice' does not exist on type 'ProductFilters'. Did you mean 'min_price'?

90     min_price: filters.minPrice,
                          ~~~~~~~~

  src/types/product.ts:129:3
    129   min_price?: number;
          ~~~~~~~~~
    'min_price' is declared here.

src/hooks/useProducts.ts:91:24 - error TS2551: Property 'maxPrice' does not exist on type 'ProductFilters'. Did you mean 'max_price'?

91     max_price: filters.maxPrice,
                          ~~~~~~~~

  src/types/product.ts:130:3
    130   max_price?: number;
          ~~~~~~~~~
    'max_price' is declared here.

src/hooks/useProducts.ts:92:26 - error TS2551: Property 'isFeatured' does not exist on type 'ProductFilters'. Did you mean 'is_featured'?

92     is_featured: filters.isFeatured,
                            ~~~~~~~~~~

  src/types/product.ts:132:3
    132   is_featured?: boolean;
          ~~~~~~~~~~~
    'is_featured' is declared here.

src/hooks/useProducts.ts:93:23 - error TS2339: Property 'inStock' does not exist on type 'ProductFilters'.

93     in_stock: filters.inStock,
                         ~~~~~~~

src/hooks/useProducts.ts:94:25 - error TS2339: Property 'minRating' does not exist on type 'ProductFilters'.

94     min_rating: filters.minRating,
                           ~~~~~~~~~

src/hooks/useProducts.ts:168:5 - error TS2552: Cannot find name 'fetchProducts'. Did you mean 'getProducts'?

168     fetchProducts();
        ~~~~~~~~~~~~~

src/hooks/useProducts.ts:169:7 - error TS2552: Cannot find name 'fetchProducts'. Did you mean 'getProducts'?

169   }, [fetchProducts]);
          ~~~~~~~~~~~~~

src/main.tsx:3:50 - error TS2307: Cannot find module '@tanstack/react-query' or its corresponding type declarations.

3 import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
                                                   ~~~~~~~~~~~~~~~~~~~~~~~


Found 11 errors in 2 files.

Errors  Files
    10  src/hooks/useProducts.ts:4
     1  src/main.tsx:3
npm notice
npm notice New minor version of npm available! 11.6.4 -> 11.8.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.8.0
npm notice To update run: npm install -g npm@11.8.0
npm notice

 *  The terminal process "/usr/bin/bash '-c', 'cd frontend && npx tsc --noEmit'" terminated with exit code: 2. 
 *  Terminal will be reused by tasks, press any key to close it. 

 *  Executing task: cd frontend && pnpm install 

 WARN  deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.

   ╭───────────────────────────────────────────────╮
   │                                               │
   │     Update available! 10.26.2 → 10.28.1.      │
   │     Changelog: https://pnpm.io/v/10.28.1      │
   │   To update, run: corepack use pnpm@10.28.1   │
   │                                               │
   ╰───────────────────────────────────────────────╯

 WARN  5 deprecated subdependencies found: @humanwhocodes/config-array@0.13.0, @humanwhocodes/object-schema@2.0.3, glob@7.2.3, inflight@1.0.6, rimraf@3.0.2
Packages: +2
++
Progress: resolved 317, reused 272, downloaded 2, added 2, done

dependencies:
+ @tanstack/react-query 5.90.20

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: esbuild@0.21.5.                                                   │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯
Done in 4.8s using pnpm v10.26.2
 *  Terminal will be reused by tasks, press any key to close it. 

 *  Executing task: cd frontend && pnpm run build --verbose 


> commercehub-frontend@1.0.0 build /home/elogic360/Documents/CODELAB/e_commerce&store01/frontend
> vite build --verbose

file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.3/node_modules/vite/dist/node/cli.js:445
          throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
                ^

CACError: Unknown option `--verbose`
    at Command.checkUnknownOptions (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.3/node_modules/vite/dist/node/cli.js:445:17)
    at CAC.runMatchedCommand (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.3/node_modules/vite/dist/node/cli.js:643:13)
    at CAC.parse (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.3/node_modules/vite/dist/node/cli.js:582:12)
    at file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/vite@5.4.21_@types+node@25.0.3/node_modules/vite/dist/node/cli.js:915:5
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:671:26)

Node.js v24.11.1
 ELIFECYCLE  Command failed with exit code 1.

 *  The terminal process "/usr/bin/bash '-c', 'cd frontend && pnpm run build --verbose'" terminated with exit code: 1. 
 *  Terminal will be reused by tasks, press any key to close it. 

 *  Executing task: cd frontend && DEBUG=vite:* pnpm run build 2>&1 | head -50 


> commercehub-frontend@1.0.0 build /home/elogic360/Documents/CODELAB/e_commerce&store01/frontend
> vite build

2026-01-23T17:10:51.496Z vite:config bundled config file loaded in 37.81ms
2026-01-23T17:10:51.535Z vite:config using resolved config: {
  plugins: [
    'vite:build-metadata',
    'vite:watch-package-data',
    'vite:pre-alias',
    'alias',
    'vite:react-babel',
    'vite:react-refresh',
    'vite:modulepreload-polyfill',
    'vite:resolve',
    'vite:html-inline-proxy',
    'vite:css',
    'vite:esbuild',
    'vite:json',
    'vite:wasm-helper',
    'vite:worker',
    'vite:asset',
    'vite:wasm-fallback',
    'vite:define',
    'vite:css-post',
    'vite:build-html',
    'vite:worker-import-meta-url',
    'vite:asset-import-meta-url',
    'vite:force-systemjs-wrap-complete',
    'commonjs',
    'vite:data-uri',
    'vite:dynamic-import-vars',
    'vite:import-glob',
    'vite:build-import-analysis',
    'vite:esbuild-transpile',
    'vite:terser',
    'vite:reporter',
    'vite:load-fallback'
  ],
  resolve: {
    mainFields: [ 'browser', 'module', 'jsnext:main', 'jsnext' ],
    conditions: [],
    extensions: [
      '.mjs',  '.js',
      '.mts',  '.ts',
      '.jsx',  '.tsx',
      '.json'
    ],
    dedupe: [ 'react', 'react-dom' ],
    preserveSymlinks: false,
 *  Terminal will be reused by tasks, press any key to close it. 

 *  Executing task: cd frontend && npx tsc --noEmit --skipLibCheck 

src/hooks/useProducts.ts:8:10 - error TS2614: Module '"../services/productService"' has no exported member 'getProducts'. Did you mean to use 'import getProducts from "../services/productService"' instead?

8 import { getProducts } from '../services/productService';
           ~~~~~~~~~~~

src/hooks/useProducts.ts:88:26 - error TS2551: Property 'categoryId' does not exist on type 'ProductFilters'. Did you mean 'category_id'?

88     category_id: filters.categoryId,
                            ~~~~~~~~~~

  src/types/product.ts:128:3
    128   category_id?: number;
          ~~~~~~~~~~~
    'category_id' is declared here.

src/hooks/useProducts.ts:90:24 - error TS2551: Property 'minPrice' does not exist on type 'ProductFilters'. Did you mean 'min_price'?

90     min_price: filters.minPrice,
                          ~~~~~~~~

  src/types/product.ts:129:3
    129   min_price?: number;
          ~~~~~~~~~
    'min_price' is declared here.

src/hooks/useProducts.ts:91:24 - error TS2551: Property 'maxPrice' does not exist on type 'ProductFilters'. Did you mean 'max_price'?

91     max_price: filters.maxPrice,
                          ~~~~~~~~

  src/types/product.ts:130:3
    130   max_price?: number;
          ~~~~~~~~~
    'max_price' is declared here.

src/hooks/useProducts.ts:92:26 - error TS2551: Property 'isFeatured' does not exist on type 'ProductFilters'. Did you mean 'is_featured'?

92     is_featured: filters.isFeatured,
                            ~~~~~~~~~~

  src/types/product.ts:132:3
    132   is_featured?: boolean;
          ~~~~~~~~~~~
    'is_featured' is declared here.

src/hooks/useProducts.ts:93:23 - error TS2339: Property 'inStock' does not exist on type 'ProductFilters'.

93     in_stock: filters.inStock,
                         ~~~~~~~

src/hooks/useProducts.ts:94:25 - error TS2339: Property 'minRating' does not exist on type 'ProductFilters'.

94     min_rating: filters.minRating,
                           ~~~~~~~~~

src/hooks/useProducts.ts:168:5 - error TS2552: Cannot find name 'fetchProducts'. Did you mean 'getProducts'?

168     fetchProducts();
        ~~~~~~~~~~~~~

src/hooks/useProducts.ts:169:7 - error TS2552: Cannot find name 'fetchProducts'. Did you mean 'getProducts'?

169   }, [fetchProducts]);
          ~~~~~~~~~~~~~

src/pages/ProductsPage.tsx:264:45 - error TS2322: Type 'Error' is not assignable to type 'ReactNode'.

264                 <p className="text-sm mt-1">{error}</p>
                                                ~~~~~~~

  node_modules/.pnpm/@types+react@18.3.27/node_modules/@types/react/index.d.ts:2398:9
    2398         children?: ReactNode | undefined;
                 ~~~~~~~~
    The expected type comes from property 'children' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>'


Found 10 errors in 2 files.

Errors  Files
     9  src/hooks/useProducts.ts:8
     1  src/pages/ProductsPage.tsx:264

 *  The terminal process "/usr/bin/bash '-c', 'cd frontend && npx tsc --noEmit --skipLibCheck'" terminated with exit code: 2. 
 *  Terminal will be reused by tasks, press any key to close it. 

 *  Executing task: cd frontend && npx vite build 

vite v5.4.21 building for production...
✓ 1429 modules transformed.
x Build failed in 3.25s
error during build:
src/hooks/useProducts.ts (8:9): "getProducts" is not exported by "src/services/productService.ts", imported by "src/hooks/useProducts.ts".
file: /home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/src/hooks/useProducts.ts:8:9

6: import { useProductStore } from '../stores/productStore';
7: import { useDebounce } from './useDebounce';
8: import { getProducts } from '../services/productService';
            ^
9: import type { ProductFilters } from '../types/product';

    at getRollupError (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/parseAst.js:401:41)
    at error (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/parseAst.js:397:42)
    at Module.error (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/node-entry.js:17022:16)
    at Module.traceVariable (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/node-entry.js:17478:29)
    at ModuleScope.findVariable (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/node-entry.js:15141:39)
    at FunctionScope.findVariable (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/node-entry.js:5688:38)
    at FunctionBodyScope.findVariable (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/node-entry.js:5688:38)
    at ReturnValueScope.findVariable (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/node-entry.js:5688:38)
    at FunctionBodyScope.findVariable (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/node-entry.js:5688:38)
    at Identifier.bind (file:///home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/node_modules/.pnpm/rollup@4.54.0/node_modules/rollup/dist/es/shared/node-entry.js:5462:40)

 *  The terminal process "/usr/bin/bash '-c', 'cd frontend && npx vite build'" terminated with exit code: 1. 
 *  Terminal will be reused by tasks, press any key to close it. 

 *  Executing task: cd frontend && timeout 10s pnpm run dev 2>&1 | head -20 


> commercehub-frontend@1.0.0 dev /home/elogic360/Documents/CODELAB/e_commerce&store01/frontend
> vite

Re-optimizing dependencies because lockfile has changed
Port 5173 is in use, trying another one...

  VITE v5.4.21  ready in 780 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: http://10.42.240.1:5174/
  ➜  press h + enter to show help
Error:   Failed to scan for dependencies from entries:
  /home/elogic360/Documents/CODELAB/e_commerce&store01/frontend/index.html

  ✘ [ERROR] No matching export in "src/services/productService.ts" for import "getProducts"

    src/hooks/useProducts.ts:8:9:
      8 │ import { getProducts } from '../services/productService';
        ╵          ~~~~~~~~~~~
 *  Terminal will be reused by tasks, press any key to close it. 

echo "Creating initial commit..."
git commit -m "Initial commit: CommerceHub E-Commerce Platform

- Full-stack e-commerce application
- FastAPI backend with PostgreSQL
- React TypeScript frontend with Tailwind CSS
- Admin dashboard with product management
- Shopping cart and order system
- JWT authentication and security
- File upload for product images
- Comprehensive documentation and setup"

echo "Pushing to GitHub..."
git push -u origin main

echo "Setup complete!"