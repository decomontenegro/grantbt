import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete onboarding flow with company matching
 * Tests the full user journey from signup to grant matching
 */

// Generate unique identifiers for each test run
const timestamp = Date.now();
const uniqueId = timestamp.toString().slice(-8);

const TEST_USER = {
  email: `test-${timestamp}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
};

const TEST_COMPANY = {
  // Step 1: Basic Info
  cnpj: `${uniqueId.slice(0, 2)}.${uniqueId.slice(2, 5)}.${uniqueId.slice(5, 8)}/0001-90`,
  companyName: 'Tech Innovation LTDA',
  legalName: 'Tech Innovation Desenvolvimento de Software LTDA',

  // Step 2: Company Details
  sector: 'Tecnologia da Informação',
  size: 'SMALL',
  description: 'Empresa de desenvolvimento de software especializada em IA e blockchain para otimizar processos empresariais.',
  website: 'https://techinnovation.com.br',
  city: 'São Paulo',
  state: 'SP',
  foundationDate: '2020-01-15',
  cnaeCode: '6201-5/00',
  employeeCount: '25',
  annualRevenue: '1500000',

  // Step 3: Projects
  project: {
    title: 'Plataforma de IA para Análise de Dados',
    description: 'Desenvolvimento de plataforma que utiliza inteligência artificial para análise preditiva de dados empresariais, permitindo tomada de decisões mais assertivas.',
    budget: '500000',
    status: 'planning',
  },

  // Step 4: Interests
  interestAreas: ['Inovação Tecnológica', 'Inteligência Artificial'],
  preferredAgencies: ['FINEP', 'FAPESP'],
  budgetRange: '500k-1M',
  universityPartners: 'USP, UNICAMP',
  ictPartners: 'IPT',

  // Step 5: History
  pastGrant: {
    program: 'PIPE FAPESP Fase 1',
    agency: 'FAPESP',
    year: '2021',
    amount: '200000',
    status: 'approved',
  },

  // Step 6: Team
  rdDepartment: true,
  rdTeamSize: '8',
  researchersCount: '5',
  phdCount: '2',
  mastersCount: '3',
  rdBudget: '300000',
  hasCounterpartCapacity: true,
  counterpartPercentage: '25',

  // Step 7: Preferences
  emailNotifications: true,
  deadlineAlerts: true,
  newMatches: true,
  weeklyDigest: true,
  autoMatch: true,
  minMatchScore: '75',
};

test.describe('Complete Onboarding Flow', () => {
  test('should complete signup, login, and full onboarding with grant matching', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes timeout

    // ====================
    // STEP 0: Signup
    // ====================
    await test.step('Signup new user', async () => {
      await page.goto('/signup');
      await expect(page).toHaveTitle(/GrantBR/);

      // Wait for form to be ready
      await page.waitForSelector('input#name', { state: 'visible' });

      // Fill signup form using id selectors
      await page.fill('input#name', TEST_USER.name);
      await page.fill('input#email', TEST_USER.email);
      await page.fill('input#password', TEST_USER.password);

      // Wait a bit for React state to update
      await page.waitForTimeout(500);

      await page.click('button[type="submit"]');

      // Should redirect to onboarding after signup
      await page.waitForURL('/onboarding', { timeout: 15000 });
    });

    // ====================
    // STEP 1: Basic Info
    // ====================
    await test.step('Step 1: Fill basic company info', async () => {
      await page.goto('/onboarding');
      await expect(page.locator('text=Informações Básicas')).toBeVisible();

      // Fill CNPJ
      const cnpjInput = page.locator('input#cnpj');
      await cnpjInput.fill(TEST_COMPANY.cnpj);

      // Fill company name
      await page.locator('input#companyName').fill(TEST_COMPANY.companyName);

      // Fill legal name
      await page.locator('input#legalName').fill(TEST_COMPANY.legalName);

      // Click next
      await page.click('button:has-text("Próximo")');

      // Wait for step 2
      await expect(page.locator('text=Detalhes da Empresa')).toBeVisible({ timeout: 5000 });
    });

    // ====================
    // STEP 2: Company Details
    // ====================
    await test.step('Step 2: Fill company details', async () => {
      await expect(page.locator('text=Detalhes da Empresa')).toBeVisible();

      // Select sector
      await page.locator('select#sector').selectOption(TEST_COMPANY.sector);

      // Select size
      await page.locator('select#size').selectOption(TEST_COMPANY.size);

      // Fill description
      await page.locator('textarea#description').fill(TEST_COMPANY.description);

      // Fill location
      await page.locator('input#city').fill(TEST_COMPANY.city);
      await page.locator('input#state').fill(TEST_COMPANY.state);

      // Fill website
      await page.locator('input#website').fill(TEST_COMPANY.website);

      // Fill foundation date
      await page.locator('input#foundationDate').fill(TEST_COMPANY.foundationDate);

      // Fill CNAE code
      await page.locator('input#cnaeCode').fill(TEST_COMPANY.cnaeCode);

      // Fill employee count
      await page.locator('input#employeeCount').fill(TEST_COMPANY.employeeCount);

      // Fill annual revenue
      await page.locator('input#annualRevenue').fill(TEST_COMPANY.annualRevenue);

      // Click next
      await page.click('button:has-text("Próximo")');

      // Wait for step 3
      await expect(page.locator('text=Quais projetos você quer financiar?')).toBeVisible({ timeout: 5000 });
    });

    // ====================
    // STEP 3: Projects
    // ====================
    await test.step('Step 3: Fill project information', async () => {
      await expect(page.locator('text=Quais projetos você quer financiar?')).toBeVisible();

      // Fill project title
      await page.locator('input[placeholder*="plataforma"]').first().fill(TEST_COMPANY.project.title);

      // Fill project description
      await page.locator('textarea[placeholder*="Descreva"]').first().fill(TEST_COMPANY.project.description);

      // Fill budget
      await page.locator('input[type="number"][placeholder*="500000"]').first().fill(TEST_COMPANY.project.budget);

      // Select status
      await page.locator('select').first().selectOption(TEST_COMPANY.project.status);

      // Click next
      await page.click('button:has-text("Próximo")');

      // Wait for step 4
      await expect(page.locator('text=O que você busca financiar?')).toBeVisible({ timeout: 5000 });
    });

    // ====================
    // STEP 4: Interests
    // ====================
    await test.step('Step 4: Select interests and partnerships', async () => {
      await expect(page.locator('text=O que você busca financiar?')).toBeVisible();

      // Select interest areas (click badges)
      for (const area of TEST_COMPANY.interestAreas) {
        await page.click(`text=${area}`);
      }

      // Select preferred agencies (checkboxes)
      for (const agency of TEST_COMPANY.preferredAgencies) {
        await page.check(`input[type="checkbox"]#${agency}`);
      }

      // Select budget range
      await page.locator('select').first().selectOption(TEST_COMPANY.budgetRange);

      // Fill partnerships
      await page.check('input#hasUniversityPartners');
      await page.locator('input[placeholder*="USP"]').fill(TEST_COMPANY.universityPartners);

      await page.check('input#hasICTPartners');
      await page.locator('input[placeholder*="EMBRAPA"]').fill(TEST_COMPANY.ictPartners);

      // Click next
      await page.click('button:has-text("Próximo")');

      // Wait for step 5
      await expect(page.locator('text=Experiência com grants anteriores')).toBeVisible({ timeout: 5000 });
    });

    // ====================
    // STEP 5: History
    // ====================
    await test.step('Step 5: Fill grant history', async () => {
      await expect(page.locator('text=Experiência com grants anteriores')).toBeVisible();

      // Click "Sim" for past grants
      await page.click('button:has-text("Sim")');

      // Wait a bit for UI to update
      await page.waitForTimeout(300);

      // Click "Adicionar Grant" button to add a grant form
      await page.click('button:has-text("Adicionar Grant")');

      // Wait for form to appear
      await page.waitForTimeout(500);

      // Fill past grant information (using actual placeholders from component)
      await page.locator('input[placeholder*="Ex: PIPE FAPESP"]').fill(TEST_COMPANY.pastGrant.program);
      await page.locator('input[placeholder*="Ex: FAPESP"]').fill(TEST_COMPANY.pastGrant.agency);
      await page.locator('input[type="number"][placeholder="2023"]').fill(TEST_COMPANY.pastGrant.year);
      await page.locator('input[type="number"][placeholder="500000"]').fill(TEST_COMPANY.pastGrant.amount);

      // Select status
      await page.locator('select').first().selectOption(TEST_COMPANY.pastGrant.status);

      // Click next
      await page.click('button:has-text("Próximo")');

      // Wait for step 6
      await expect(page.locator('text=Sobre sua equipe técnica')).toBeVisible({ timeout: 5000 });
    });

    // ====================
    // STEP 6: Team
    // ====================
    await test.step('Step 6: Fill team and R&D information', async () => {
      await expect(page.locator('text=Sobre sua equipe técnica')).toBeVisible();

      // Has R&D department
      await page.locator('button:has-text("Sim")').first().click();

      // Fill team sizes
      const inputs = page.locator('input[type="number"]');
      await inputs.nth(0).fill(TEST_COMPANY.rdTeamSize);
      await inputs.nth(1).fill(TEST_COMPANY.researchersCount);

      // PhDs
      await page.locator('button:has-text("Sim")').nth(1).click();
      await page.waitForTimeout(300);
      await inputs.nth(2).fill(TEST_COMPANY.phdCount);

      // Masters
      await page.locator('button:has-text("Sim")').nth(2).click();
      await page.waitForTimeout(300);
      await inputs.nth(3).fill(TEST_COMPANY.mastersCount);

      // R&D Budget
      await inputs.nth(4).fill(TEST_COMPANY.rdBudget);

      // Counterpart capacity
      await page.locator('button:has-text("Sim")').nth(3).click();
      await page.waitForTimeout(300);
      await inputs.nth(5).fill(TEST_COMPANY.counterpartPercentage);

      // Click next
      await page.click('button:has-text("Próximo")');

      // Wait for step 7
      await expect(page.locator('text=Configure suas preferências')).toBeVisible({ timeout: 5000 });
    });

    // ====================
    // STEP 7: Preferences
    // ====================
    await test.step('Step 7: Configure preferences', async () => {
      await expect(page.locator('text=Configure suas preferências')).toBeVisible();

      // All checkboxes should be checked by default, just verify
      const emailCheck = page.locator('input[type="checkbox"]').first();
      await expect(emailCheck).toBeChecked();

      // Adjust min match score slider
      const slider = page.locator('input[type="range"]');
      await slider.fill(TEST_COMPANY.minMatchScore);

      // Click next
      await page.click('button:has-text("Próximo")');

      // Wait for step 8 (Review)
      await expect(page.locator('text=Tudo pronto para começar!')).toBeVisible({ timeout: 5000 });
    });

    // ====================
    // STEP 8: Review & Submit
    // ====================
    await test.step('Step 8: Review and submit onboarding', async () => {
      await expect(page.locator('text=Revisão')).toBeVisible();
      await expect(page.locator('text=Tudo pronto para começar!')).toBeVisible();

      // Verify company data is displayed
      await expect(page.locator(`text=${TEST_COMPANY.companyName}`)).toBeVisible();
      await expect(page.locator(`text=${TEST_COMPANY.sector}`)).toBeVisible();

      // Click Finalizar
      const finishButton = page.locator('button:has-text("Finalizar")');
      await finishButton.click();

      // Wait for redirect to dashboard
      await page.waitForURL('/dashboard', { timeout: 15000 });
    });

    // ====================
    // VERIFICATION: Grant Matching
    // ====================
    await test.step('Verify grant matching works', async () => {
      // Navigate to grants page
      await page.goto('/grants');

      // Wait for grants to load
      await page.waitForSelector('text=Oportunidades de Financiamento', { timeout: 10000 });

      // Verify match scores are displayed
      const matchBadge = page.locator('text=/\\d+% match/').first();
      await expect(matchBadge).toBeVisible();

      // Get match score value
      const matchText = await matchBadge.textContent();
      const score = parseInt(matchText?.match(/\\d+/)?.[0] || '0');

      console.log(`✅ Match score: ${score}%`);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);

      // Verify multiple grants are displayed with match scores
      const allMatchBadges = page.locator('text=/\\d+% match/');
      const matchCount = await allMatchBadges.count();
      expect(matchCount).toBeGreaterThan(0);
      console.log(`📊 Found ${matchCount} grants with match scores`);

      // Verify specific agencies are displayed
      await expect(page.locator('text=FINEP').first()).toBeVisible();
      await expect(page.locator('text=FAPESP').first()).toBeVisible();

      // Take screenshot of successful matching
      await page.screenshot({ path: 'e2e-results/grant-matching-success.png', fullPage: true });

      console.log('✅ E2E Test completed successfully!');
      console.log(`📊 User: ${TEST_USER.email}`);
      console.log(`🏢 Company: ${TEST_COMPANY.companyName}`);
      console.log(`🎯 ${matchCount} grants matched with scores ranging from ${score}%+`);
    });
  });
});
