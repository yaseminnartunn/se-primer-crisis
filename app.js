// SE Primer - SRE Incident Control Durum Makinesi
document.addEventListener('DOMContentLoaded', () => {
  // Durum Modeli
  const state = {
    profile: {
      level: 'junior',
      role: 'backend',
      goal: 'speed'
    },
    currentStage: 1,
    decisions: {},
    timer: null,
    timeLeft: 60,
    soundEnabled: true
  };

  // Web Audio API ile Hafif Terminal Bip Sesleri (Harici dosyasız)
  const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
  
  function playBeep(freq = 600, duration = 0.05, type = 'sine') {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio izinleri engellenirse sessiz kal
    }
  }

  // Karar İçerikleri ve Sokratik Telsiz Mesajları
  const stages = {
    1: {
      category: "KARAR ALANI: MİMARİ MÜDAHALE",
      title: "Karar 1: Kilitlenen Veritabanı ve Servis",
      desc: "Saat 08:05. Dün gece v2.4.0 ile yeni veritabanı şeması eklendi. Bağlantı havuzu tükendi, servis 500 fırlatıyor. İlk protokolün ne olacak?",
      clock: "08:05",
      queue: "345",
      log: [
        "[08:05:01] CRITICAL: HikariPool-1 exhausted (active=200/max=200)",
        "[08:05:04] DB_LOCK: lock wait timeout on appointments_partition"
      ],
      tutor: {
        junior: "Eski sürüme dönerken (rollback), gece uygulanan veritabanı migration'ının geriye dönük uyumlu olup olmadığını nasıl anlarsın?",
        senior: "Breaking migration içeren bir rollback'in veritabanı replikasyonunda yaratacağı lock etkisini hesapladın mı?"
      },
      optA: {
        title: "PROTOKOL A: Rollback v2.3.9",
        desc: "Önceki kararlı binary'e geç; migration durumunu doğrula."
      },
      optB: {
        title: "PROTOKOL B: Canlıda Hotfix",
        desc: "Bağlantı havuzu parametresini runtime'da artırıp restart at."
      }
    },
    2: {
      category: "KARAR ALANI: TEST VE DOĞRULAMA",
      title: "Karar 2: Dağıtım Öncesi Doğrulama",
      desc: "Saat 08:15. Yapılan müdahale pipeline'a gönderildi. Poliklinik kapısında kalabalık artıyor.",
      clock: "08:15",
      queue: "410",
      log: [
        "[08:14:50] BUILD SUCCESS: artifact v2.4.1-patch hazır",
        "[08:15:02] Pipeline: Smoke test suite hazır bekliyor (5 dk sürer)"
      ],
      tutor: {
        junior: "5 dakikalık bir smoke testini atlayıp canlıya almak, ilk 100 eşzamanlı istekte ne gibi sürprizler doğurabilir?",
        senior: "Gözlemlenmemiş bir race condition'ı test etmeden prod'a almak MTTR süresini nasıl katlar?"
      },
      optA: {
        title: "PROTOKOL A: 5 Dakikalık Smoke Test Koş",
        desc: "Randevu alma ve DB yazma yollarını otomatize test ile doğrula."
      },
      optB: {
        title: "PROTOKOL B: Testi Atla, Hemen Canlıya Al",
        desc: "Hastalar bekliyor, 5 dakika kaybetmeden anında deployment yap."
      }
    },
    3: {
      category: "KARAR ALANI: KVKK VE VERİ GÜVENLİĞİ",
      title: "Karar 3: Hata Logları ve Kişisel Sağlık Verisi",
      desc: "Saat 08:20. Sistem nefes almaya başladı ama bazı sorgular hata fırlatıyor. Ekip Slack kanalından log örneği istiyor.",
      clock: "08:20",
      queue: "380",
      log: [
        "[08:19:44] WARN: Payload error: {tc: '19827364512', teshis: 'Onkoloji'}",
        "[08:20:01] Incident Channel: @here hata stack trace'ini acil paylaşın!"
      ],
      tutor: {
        junior: "Loglarda hastaların kimlik ve tanı bilgileri var. Bunu ekiple olduğu gibi paylaşmak 6698 sayılı kanuna göre ne riski doğurur?",
        senior: "Özel nitelikli kişisel sağlık verisinin şirket içi/dışı kanallara sızmasının yasal ve cezai yaptırımı nedir?"
      },
      optA: {
        title: "PROTOKOL A: Regex ile PII Verilerini Maskele",
        desc: "TCKN ve tanı alanlarını '***' yaparak güvenle paylaş."
      },
      optB: {
        title: "PROTOKOL B: Aciliyet Nedeniyle Ham Logu İlet",
        desc: "Vakit kaybetme, mühendisler hemen görsün."
      }
    }
  };

  // Karar Seçimlerinin Teknik Sonuçları
  const feedbackData = {
    1: {
      A: "Eski sürüme rollback başlatıldı. Neyse ki gece yapılan migration geriye uyumlu tasarlandığı için veritabanı kilitlenmesi çözüldü.",
      B: "Havuz boyutu canlıda artırıldı. Geçici bir rahatlama oldu fakat arka plandaki deadlock riski devam ediyor."
    },
    2: {
      A: "Smoke test koşuldu (5 dk). Randevu kayıtlarının çakışma senaryolarında doğru çalıştığı doğrulandı. Güvenle canlıya geçildi.",
      B: "Test koşulmadan canlıya alındı! Sistem açıldı gibi göründü ancak ilk eşzamanlı yükte bazı kayıtlar veritabanına eksik yazıldı."
    },
    3: {
      A: "Hassas kişisel veriler maskelendi. Ekip sorunu güvenle çözdü ve KVKK Madde 12 yükümlülüğü tam olarak korundu.",
      B: "Ham loglar açık kanala atıldı! Hata çözüldü ancak 40 hastanın tanı ve kimlik bilgileri log geçmişinde ifşa oldu."
    }
  };

  // DOM Elemanları
  const screens = {
    profile: document.getElementById('profileScreen'),
    decision: document.getElementById('decisionScreen'),
    feedback: document.getElementById('feedbackPanel'),
    outcome: document.getElementById('outcomeScreen')
  };

  const clockDisplay = document.getElementById('clockDisplay');
  const queueDisplay = document.getElementById('queueDisplay');
  const timerContainer = document.getElementById('timerContainer');
  const timerText = document.getElementById('timerText');
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  // Ses Açma/Kapama
  soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    soundToggleBtn.textContent = state.soundEnabled ? '🔊' : '🔇';
    playBeep(400, 0.05);
  });

  // Profil Seçim Olayları
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playBeep(800, 0.03);
      const type = btn.getAttribute('data-type');
      const val = btn.getAttribute('data-value');
      document.querySelectorAll(`.profile-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.profile[type] = val;
    });
  });

  // Başlat Butonu
  document.getElementById('startSimBtn').addEventListener('click', () => {
    playBeep(900, 0.08);
    switchScreen('decision');
    loadStage(1);
  });

  // Karar Butonları
  document.getElementById('optABtn').addEventListener('click', () => handleChoice('A'));
  document.getElementById('optBBtn').addEventListener('click', () => handleChoice('B'));

  // Sonraki Adım Butonu
  document.getElementById('nextStepBtn').addEventListener('click', () => {
    playBeep(700, 0.04);
    screens.feedback.classList.add('hidden');
    screens.decision.classList.remove('hidden');

    if (state.currentStage < 3) {
      state.currentStage++;
      loadStage(state.currentStage);
    } else {
      showOutcome();
    }
  });

  // Yeniden Başlat
  document.getElementById('restartBtn').addEventListener('click', () => {
    playBeep(500, 0.05);
    state.currentStage = 1;
    state.decisions = {};
    if (state.timer) clearInterval(state.timer);
    switchScreen('profile');
  });

  function switchScreen(screenKey) {
    Object.values(screens).forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    screens[screenKey].classList.remove('hidden');
    screens[screenKey].classList.add('active');
  }

  function loadStage(stageNum) {
    const data = stages[stageNum];
    clockDisplay.textContent = data.clock;
    if (queueDisplay) queueDisplay.textContent = data.queue;

    document.getElementById('stageBadge').textContent = `AŞAMA ${stageNum}/3`;
    document.getElementById('stageCategory').textContent = data.category;
    document.getElementById('decisionTitle').textContent = data.title;
    document.getElementById('decisionDesc').textContent = data.desc;

    // Terminal Logları
    const terminal = document.getElementById('terminalLog');
    terminal.innerHTML = data.log.map(line => `<p>${escapeHtml(line)}</p>`).join('');

    // Sokratik Telsiz Mesajı
    const tutorText = state.profile.level === 'senior' ? data.tutor.senior : data.tutor.junior;
    document.getElementById('tutorText').textContent = `"${tutorText}"`;

    // Seçenekler
    document.getElementById('optATitle').textContent = data.optA.title;
    document.getElementById('optADesc').textContent = data.optA.desc;
    document.getElementById('optBTitle').textContent = data.optB.title;
    document.getElementById('optBDesc').textContent = data.optB.desc;

    // Senior Modu Zamanlayıcı
    if (state.profile.level === 'senior') {
      timerContainer.classList.remove('hidden');
      startTimer();
    } else {
      timerContainer.classList.add('hidden');
    }
  }

  function startTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timeLeft = 60;
    timerText.textContent = `${state.timeLeft}s`;

    state.timer = setInterval(() => {
      state.timeLeft--;
      timerText.textContent = `${state.timeLeft}s`;
      if (state.timeLeft <= 10) {
        playBeep(350, 0.03, 'sawtooth'); // Son 10 saniye uyarı bipi
      }
      if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        handleChoice('B', true);
      }
    }, 1000);
  }

  function handleChoice(choice, isTimeout = false) {
    playBeep(choice === 'A' ? 1000 : 450, 0.06);
    if (state.timer) clearInterval(state.timer);
    state.decisions[state.currentStage] = choice;

    // Kriz anı hafif glitch efekti
    const mainBox = document.querySelector('main');
    mainBox.classList.add('glitch-active');
    setTimeout(() => mainBox.classList.remove('glitch-active'), 250);

    screens.decision.classList.add('hidden');
    screens.feedback.classList.remove('hidden');

    const feedback = feedbackData[state.currentStage][choice];
    const prefix = isTimeout ? "⚠️ SÜRE DOLDU! PagerDuty kriz baskısı altında: " : "";
    document.getElementById('feedbackText').textContent = prefix + feedback;
  }

  function showOutcome() {
    switchScreen('outcome');
    const d = state.decisions;

    const icon = document.getElementById('outcomeIcon');
    const title = document.getElementById('outcomeTitle');
    const summary = document.getElementById('outcomeSummary');
    const grade = document.getElementById('outcomeGrade');
    const mttr = document.getElementById('metricMTTR');
    const dataStat = document.getElementById('metricData');
    const kvkkStat = document.getElementById('metricKVKK');
    const retro = document.getElementById('outcomeRetro');

    if (d[3] === 'B') {
      playBeep(300, 0.2, 'sawtooth');
      icon.textContent = "⚖️";
      title.textContent = "08:35 · SİSTEM AYAKTA, KVKK CEZASI KAPIDA";
      summary.textContent = "Sistem kurtarıldı fakat Slack'e aktarılan ham loglardaki hasta kayıtları sızdırıldı. Kurum 1.750.000 TL KVKK idari para cezası ile karşı karşıya.";
      grade.textContent = "KUSURLU / RİSKLİ";
      grade.className = "px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px]";
      mttr.textContent = "35 Dakika";
      mttr.className = "text-amber-400 font-bold";
      dataStat.textContent = "%95 Korundu";
      dataStat.className = "text-amber-400 font-bold";
      kvkkStat.textContent = "AĞIR İHLAL";
      kvkkStat.className = "text-red-400 font-bold";
      retro.textContent = "Sommerville ve veri güvenliği ilkelerine göre acil durumlar güvenlik protokollerini çiğneme mazereti olamaz. Regex sanitization pipeline'ı zorunlu tutulmalıdır.";
    } else if (d[2] === 'B') {
      playBeep(250, 0.3, 'square');
      icon.textContent = "💥";
      title.textContent = "09:10 · VERİ UYUŞMAZLIĞI VE TABLO KİLİTLENMESİ";
      summary.textContent = "Test edilmeden canlıya alınan yama, sabah oluşan 400 yeni randevunun veritabanına mükerrer ve tutarsız yazılmasına neden oldu. Doktor ekranları kilitlendi.";
      grade.textContent = "BAŞARISIZ";
      grade.className = "px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px]";
      mttr.textContent = "70 Dakika";
      mttr.className = "text-red-400 font-bold";
      dataStat.textContent = "Kritik Bozulma";
      dataStat.className = "text-red-400 font-bold";
      kvkkStat.textContent = "Uyumlu";
      kvkkStat.className = "text-emerald-400 font-bold";
      retro.textContent = "5 dakikalık bir smoke testini atlamak 70 dakikalık bir felakete dönüştü. Testler bir engel değil, sistemin emniyet kemeridir.";
    } else {
      playBeep(1200, 0.15, 'triangle');
      icon.textContent = "🏆";
      title.textContent = "08:25 · KUSURSUZ KURTARMA & ÖRNEK KRİZ YÖNETİMİ";
      summary.textContent = "30 dakikadan kısa sürede sistem ayağa kaldırıldı, veritabanı tutarlılığı korundu ve tek bir kişisel veri dahi sızdırılmadı.";
      grade.textContent = "MÜKEMMEL";
      grade.className = "px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]";
      mttr.textContent = "25 Dakika";
      mttr.className = "text-emerald-400 font-bold";
      dataStat.textContent = "%100 Güvenli";
      dataStat.className = "text-emerald-400 font-bold";
      kvkkStat.textContent = "Tam Uyumlu";
      kvkkStat.className = "text-emerald-400 font-bold";
      retro.textContent = "Harika bir mühendislik refleksi sergilediniz. Mimari farkındalık, kısa ama etkili test disiplini ve veri gizliliği hassasiyeti faciayı önledi.";
    }
  }

  // Canlı SVG Telemetri Animasyonu
  const telemetryLine = document.getElementById('telemetryLine');
  if (telemetryLine) {
    setInterval(() => {
      const p1 = Math.floor(Math.random() * 15) + 3;
      const p2 = Math.floor(Math.random() * 15) + 3;
      const p3 = Math.floor(Math.random() * 15) + 3;
      telemetryLine.setAttribute('d', `M0 ${p1} Q 25 ${p2}, 50 ${p3} T 75 ${p1} T 100 ${p2}`);
    }, 1200);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
