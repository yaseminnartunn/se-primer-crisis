describe("SE Primer - Simülasyon E2E Test Senaryoları", () => {
  beforeEach(() => {
    // Statik dosya veya localhost üzerinde çalışır
    cy.visit("index.html");
  });

  it("Senaryo 1: Kusursuz Kurtarma Yolu (Rollback -> Smoke Test -> Maskeleme)", () => {
    // 1. Profil Seçimi (Junior, Backend, Hızlı Kurtarma)
    cy.get('#profileScreen').should('be.visible');
    cy.get('button[data-value="junior"]').click();
    cy.get('button[data-value="backend"]').click();
    cy.get('button[data-value="speed"]').click();
    cy.get('#startSimBtn').click();

    // 2. Karar 1: Mimari (Rollback v2.3.9)
    cy.get('#decisionScreen').should('be.visible');
    cy.get('#decisionTitle').should('contain', 'Karar 1');
    cy.get('#tutorText').should('be.visible');
    cy.get('#optABtn').click();

    // Geri bildirim onayı
    cy.get('#feedbackPanel').should('be.visible');
    cy.get('#nextStepBtn').click();

    // 3. Karar 2: Test (Smoke Test Koş)
    cy.get('#decisionTitle').should('contain', 'Karar 2');
    cy.get('#optABtn').click();
    cy.get('#nextStepBtn').click();

    // 4. Karar 3: KVKK (Log Maskele)
    cy.get('#decisionTitle').should('contain', 'Karar 3');
    cy.get('#optABtn').click();
    cy.get('#nextStepBtn').click();

    // 5. Sonuç: Başarılı İyileşme Ekranı
    cy.get('#outcomeScreen').should('be.visible');
    cy.get('#outcomeTitle').should('contain', '08:25 · Kusursuz Kurtarma');
    cy.get('#outcomeGrade').should('contain', 'Mükemmel');
    cy.get('#metricMTTR').should('contain', '25 Dakika');
    cy.get('#metricKVKK').should('contain', 'Tam Uyumlu');
  });

  it("Senaryo 2: KVKK Skandalı Yolu (Ham Log İletme)", () => {
    cy.get('#startSimBtn').click();

    // Karar 1: A
    cy.get('#optABtn').click();
    cy.get('#nextStepBtn').click();

    // Karar 2: A
    cy.get('#optABtn').click();
    cy.get('#nextStepBtn').click();

    // Karar 3: B (Ham Logları Doğrudan İlet)
    cy.get('#optBBtn').click();
    cy.get('#nextStepBtn').click();

    // Sonuç: KVKK İhlali
    cy.get('#outcomeScreen').should('be.visible');
    cy.get('#outcomeTitle').should('contain', 'KVKK Cezası');
    cy.get('#metricKVKK').should('contain', 'AĞIR İHLAL');
  });

  it("Senaryo 3: Test Atlandı ve Veri Tabanı Kilitlendi Yolu", () => {
    cy.get('#startSimBtn').click();

    // Karar 1: B (Hotfix)
    cy.get('#optBBtn').click();
    cy.get('#nextStepBtn').click();

    // Karar 2: B (Testi Atla, Hemen Canlıya Al)
    cy.get('#optBBtn').click();
    cy.get('#nextStepBtn').click();

    // Karar 3: A (Maskele)
    cy.get('#optABtn').click();
    cy.get('#nextStepBtn').click();

    // Sonuç: Veri Tabanı Bozulması
    cy.get('#outcomeScreen').should('be.visible');
    cy.get('#outcomeTitle').should('contain', 'Veri Uyuşmazlığı');
    cy.get('#outcomeGrade').should('contain', 'Başarısız');
  });

  it("Senaryo 4: Senior Modunda Süre Baskısı ve Yeniden Başlatma", () => {
    // Senior modu seçilir
    cy.get('button[data-value="senior"]').click();
    cy.get('#startSimBtn').click();

    // Zamanlayıcı görünür olmalı
    cy.get('#timerContainer').should('be.visible');
    cy.get('#timerText').should('contain', 's');

    // Yeniden başlatma testi için sona kadar gidip butona tıklanabilir
    cy.get('#optABtn').click();
    cy.get('#nextStepBtn').click();
    cy.get('#optABtn').click();
    cy.get('#nextStepBtn').click();
    cy.get('#optABtn').click();
    cy.get('#nextStepBtn').click();

    cy.get('#restartBtn').click();
    cy.get('#profileScreen').should('be.visible');
  });
});
