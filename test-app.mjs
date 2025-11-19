import { chromium } from 'playwright-core';

async function testApplication() {
  console.log('🚀 Iniciando testes da aplicação...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Helper function to run tests
  async function test(name, fn) {
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: '✅ PASSOU' });
      console.log(`✅ ${name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: '❌ FALHOU', error: error.message });
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  try {
    // Test 1: Homepage loads
    await test('Homepage carrega corretamente', async () => {
      const response = await page.goto('http://localhost:5050/', { waitUntil: 'domcontentloaded' });
      if (response.status() !== 200) throw new Error(`Status ${response.status()}`);
    });

    // Test 2: Login page exists
    await test('Página de login existe', async () => {
      await page.goto('http://localhost:5050/login', { waitUntil: 'domcontentloaded' });
      const title = await page.textContent('h1, h2').catch(() => null);
      if (!title) throw new Error('Título não encontrado');
    });

    // Test 3: Settings page loads (may redirect to login)
    await test('Página de settings responde', async () => {
      const response = await page.goto('http://localhost:5050/settings', { waitUntil: 'domcontentloaded' });
      // Aceita 200 (logged in) ou redirect (não logado)
      if (![200, 307, 303, 302].includes(response.status())) {
        throw new Error(`Status inesperado: ${response.status()}`);
      }
    });

    // Test 4: Dashboard page responds
    await test('Página de dashboard responde', async () => {
      const response = await page.goto('http://localhost:5050/dashboard', { waitUntil: 'domcontentloaded' });
      if (![200, 307, 303, 302].includes(response.status())) {
        throw new Error(`Status inesperado: ${response.status()}`);
      }
    });

    // Test 5: Grants page responds
    await test('Página de grants responde', async () => {
      const response = await page.goto('http://localhost:5050/grants', { waitUntil: 'domcontentloaded' });
      if (![200, 307, 303, 302].includes(response.status())) {
        throw new Error(`Status inesperado: ${response.status()}`);
      }
    });

    // Test 6: Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:5050/', { waitUntil: 'networkidle' });

    await test('Sem erros críticos no console', async () => {
      const criticalErrors = consoleErrors.filter(err =>
        !err.includes('fetch failed') && // Ignorar erros de fetch conhecidos
        !err.includes('ECONNREFUSED') &&
        !err.includes('localhost:4000')
      );
      if (criticalErrors.length > 0) {
        throw new Error(`${criticalErrors.length} erros encontrados: ${criticalErrors[0]}`);
      }
    });

    // Test 7: Check if Next.js compiled successfully
    await test('Next.js compilou sem erros', async () => {
      await page.goto('http://localhost:5050/', { waitUntil: 'domcontentloaded' });
      const hasCompileError = await page.locator('text=Unhandled Runtime Error').count();
      if (hasCompileError > 0) {
        throw new Error('Erro de runtime detectado na página');
      }
    });

  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`Total de testes: ${results.passed + results.failed}`);
  console.log(`✅ Passou: ${results.passed}`);
  console.log(`❌ Falhou: ${results.failed}`);
  console.log('='.repeat(50));

  if (results.failed > 0) {
    console.log('\n❌ Testes com falha:');
    results.tests.filter(t => t.error).forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

testApplication().catch(error => {
  console.error('❌ Erro fatal nos testes:', error);
  process.exit(1);
});
