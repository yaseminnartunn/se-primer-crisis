describe('SE Primer: 08:00 Kriz Odası E2E Test Paketi (Tüm Yollar)', () => {
  
  beforeEach(() => {
    cy.visit('index.html');
  });

  it('Yol A: Junior Backend Mühendisi - Kusursuz Kurtarma (Rollback -> Smoke Test -> Log Maskeleme)', () => {
    // 1. Profil Seçimi
    cy.get('[data-cy="btn-level-junior"]').should('have.class', 'active');
    cy.get('[data-cy="btn-role-backend"]').should('have.class', 'active');
    cy.get('[data-cy="btn-goal-speed"]').should('have.class', 'active');
    
    // Kriz Odasına Gir
    cy.get('[data-cy="start-sim-btn"]').click();
    
    // 2. Karar 1: Mimari Müdahale -> Rollback Seç (A)
    cy.get('[data-cy="stage-badge"]').should('contain', 'KARAR 1/3');
    cy.get('[data-cy="btn-opt-a"]').click();
    
    // Feedback 1 Onayla
    cy.get('[data-cy="feedback-panel"]').should('be.visible');
    cy.get('[data-cy="next-step-btn"]').click();

    // 3. Karar 2: Test Stratejisi -> 5 dk Smoke Test Koş (A)
    cy.get('[data-cy="stage-badge"]').should('contain', 'KARAR 2/3');
    cy.get('[data-cy="btn-opt-a"]').click();
    
    // Feedback 2 Onayla
    cy.get('[data-cy="next-step-btn"]').click();

    // 4. Karar 3: KVKK -> Logları Maskele (A)
    cy.get('[data-cy="stage-badge"]').should('contain', 'KARAR 3/3');
    cy.get('[data-cy="btn-opt-a"]').click();
    
    // Feedback 3 Onayla
    cy.get('[data-cy="next-step-btn"]').click();

    // 5. Nihai Sonuç: Son A (Kusursuz Kurtarma)
    cy.get('[data-cy="screen-outcome"]').should('be.visible');
    cy.get('[data-cy="outcome-title"]').should('contain', '08:25 · Kusursuz Kurtarma');
    cy.get('[data-cy="metric-mttr"]').should('contain', '25 Dakika');
    cy.get('[data-cy="metric-data"]').should('contain', '%100 Güvenli');
    cy.get('[data-cy="metric-kvkk"]').should('contain', 'Tam Uyumlu');
  });

  it('Yol B: KVKK İhlali Sonu (Rollback -> Smoke Test -> Ham Logları Slack\'e At)', () => {
    cy.get('[data-cy="start-sim-btn"]').click();

    // Karar 1: A
    cy.get('[data-cy="btn-opt-a"]').click();
    cy.get('[data-cy="next-step-btn"]').click();

    // Karar 2: A
    cy.get('[data-cy="btn-opt-a"]').click();
    cy.get('[data-cy="next-step-btn"]').click();

    // Karar 3: B (Ham Logları Slack'e at)
    cy.get('[data-cy="btn-opt-b"]').click();
    cy.get('[data-cy="next-step-btn"]').click();

    // Son B Kontrolü
    cy.get('[data-cy="outcome-title"]').should('contain', 'KVKK Cezası');
    cy.get('[data-cy="metric-kvkk"]').should('contain', 'İHLAL (Madde 12)');
  });

  it('Yol C: Veri Bozulması ve Kilitlenme Sonu (Hotfix -> Testi Atla)', () => {
    cy.get('[data-cy="start-sim-btn"]').click();

    // Karar 1: B (Hotfix)
    cy.get('[data-cy="btn-opt-b"]').click();
    cy.get('[data-cy="next-step-btn"]').click();

    // Karar 2: B (Testi Atla, Hemen Canlıya Al)
    cy.get('[data-cy="btn-opt-b"]').click();
    cy.get('[data-cy="next-step-btn"]').click();

    // Karar 3: A (Logları Maskele)
    cy.get('[data-cy="btn-opt-a"]').click();
    cy.get('[data-cy="next-step-btn"]').click();

    // Son C Kontrolü
    cy.get('[data-cy="outcome-title"]').should('contain', 'Veri Bozulması');
    cy.get('[data-cy="metric-data"]').should('contain', 'Bozuldu');
  });

  it('Senior Modu: 60 Saniye Zamanlayıcı ve Süre Baskısı Aktifliği', () => {
    // Senior seçeneğini tıkla
    cy.get('[data-cy="btn-level-senior"]').click();
    cy.get('[data-cy="btn-role-devops"]').click();
    cy.get('[data-cy="start-sim-btn"]').click();

    // Zamanlayıcı kutusu görünür olmalı
    cy.get('[data-cy="timer-box"]').should('be.visible');
    cy.get('#timerText').should('contain', 's');
  });

  it('Sokratik AI Mentor Etkileşimi: Mentor asla cevabı doğrudan vermemeli', () => {
    cy.get('[data-cy="start-sim-btn"]').click();

    // Mentor modalını aç
    cy.get('[data-cy="ask-tutor-btn"]').click();
    cy.get('[data-cy="tutor-modal"]').should('be.visible');

    // Doğrudan cevap isteyen soru gönder
    cy.get('[data-cy="tutor-input"]').type('Hangi şıkkı seçmeliyim, doğru cevap A mı?');
    cy.get('[data-cy="tutor-send-btn"]').click();

    // Yanıt bekle
    cy.get('[data-cy="tutor-chat-history"]').should('contain', 'karar senin');
    cy.get('[data-cy="tutor-chat-history"]').should('not.contain', 'A şıkkını seç');
    cy.get('[data-cy="tutor-chat-history"]').should('not.contain', 'Doğru cevap A');

    // Modalı kapat
    cy.get('[data-cy="close-tutor-modal-btn"]').click();
    cy.get('[data-cy="tutor-modal"]').should('not.be.visible');
  });

});
