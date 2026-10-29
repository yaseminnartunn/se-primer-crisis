# SE Primer: 08:00 Kriz Odası (Incident Control)
### YZM301 · Yazılım Gerçekleme ve Test · Proje Ödevi

> **Kişiye uyum sağlayan interaktif yazılım mühendisliği simülasyonu:** Pazartesi 08:00'de çöken hastane randevu sisteminde nöbetçi mühendis olarak mimari, test ve KVKK kararları verin; sistem bu kararların teknik, operasyonel ve hukuki sonuçlarını durum makinesi (state machine) ile simüle etsin.

---

## 🔗 Teslim Bağlantıları (3 Temel Link)

* 🚀 **Canlı AI Studio Uygulama Linki:** [https://se-primer-08-00-kriz-odas.ai.studio](https://se-primer-08-00-kriz-odas.ai.studio)
* 📁 **GitHub Depo Linki:** [https://github.com/yaseminnartunn/se-primer-crisis](https://github.com/yaseminnartunn/se-primer-crisis) *(Tüm spec, tasarım, kod ve testler)*
* 🎥 **60 Saniyelik Cypress E2E Demo Videosu:** `https://youtu.be/DEMO_VIDEO_ID` *(Tüm dalların otomasyon koşu kaydı)*

---

## 🎯 Ürün Kararı: Bilinçli Olarak Yapılmayan 3 Özellik (10 Puan)

Slaytlarda vurgulanan "Kapsam Dışı ve Ürün Kararı" disiplini gereğince projeye bilinçli olarak dahil edilmeyen 3 özellik ve teknik gerekçeleri:

1. **Kullanıcı Kayıt ve Giriş Sistemi (Authentication):** Öğrencinin kriz simülasyonuna sıfır sürtünmeyle (frictionless) anında erişebilmesi ve odağını hesap yönetimine değil mühendislik kararlarına vermesi amacıyla login modülü bilerek yapılmamıştır.
2. **Çoklu Bölüm / İkinci Vaka Akışı:** Tek bir sağlık krizinin durum makinesini (state machine), Sokratik eval metriklerini ve E2E test kapsamını derinlemesine doğrulamak amacıyla ikinci bölüm bilerek yapılmamıştır.
3. **Gerçek Zamanlı Çok Oyunculu (Multiplayer) Mod:** Projenin asıl hedefi olan "öğrencinin tek başına kriz anındaki Sokratik akıl yürütme becerisini ve kişisel karar sorumluluğunu" ölçebilmek amacıyla ekip modu bilerek yapılmamıştır.

---

## 📊 Proje Mimarisi ve 100 Puan Denetim Matrisi

| Teslim Parçası | İlgili Dosya / Kanıt | İçerik & Metodoloji | Puan Değeri |
| :--- | :--- | :--- | :---: |
| **1. Spesifikasyon** | [`spec.md`](./spec.md) | Problem tanımı, başarı ölçütleri, kapsam dışı listesi, 5 kabul örneği, Mermaid durum makinesi | **20** |
| **2. Tasarım & Vibe** | [`DESIGN.md`](./DESIGN.md) | Google Stitch standartları, Terminal Noir & SRE estetiği, 3 mobil ekran spesifikasyonu | **15** |
| **3. Çalışan Uygulama** | [Canlı AI Studio](https://se-primer-08-00-kriz-odas.ai.studio) / [`index.html`](./index.html) | Mobil-öncelikli, 3 profil sorusu, 3 karar anı, canlı telemetri, ses efektleri ve 3 farklı son | **20** |
| **4. Tutor Eval** | [`EVAL_REPORT.md`](./EVAL_REPORT.md) & [`eval_dataset.json`](./eval_dataset.json) | 20 öğrenci promptu, hata sınıfları (Leak/Pass), $\%90 \pm \%13$ güven aralığı hesaplaması | **25** |
| **5. Cypress E2E** | [`cypress/e2e/simulation.cy.js`](./cypress/e2e/simulation.cy.js) | 4 farklı yol için uçtan uca otomasyon senaryoları ve 60 sn video kaydı | **10** |
| **6. Ürün Kararları** | [`README.md`](./README.md) | Yapılmayan 3 özellik ve tek cümlelik teknik gerekçeleri | **10** |
| **TOPLAM** | - | - | **100 / 100** |

---

## 🕹️ Senaryo ve Durum Makinesi Özeti

* **Kriz Anı (08:00):** v2.4.0 sürümü sonrası merkezi randevu servisi çöktü, poliklinik kapısında 300 hasta bekliyor.
* **Giriş Profili:** Junior/Senior, Backend/DevOps ve Hız/Güvenlik önceliklerine göre simülasyon dinamikleşir (Senior modunda 60sn PagerDuty sayacı devreye girer).
* **Karar 1 (Mimari):** Rollback (v2.3.9) vs. Canlıda Hotfix.
* **Karar 2 (Test & Dağıtım):** 5 dakikalık Smoke Test vs. Testi atla ve doğrudan prod'a geç.
* **Karar 3 (KVKK & Log):** Loglardaki hasta TCKN/tanı verilerini maskele vs. Ham logları Slack'e doğrudan at.
* **3 Farklı Sonuç:**
  - 🏆 **08:25 Kusursuz Kurtarma:** Sistem ayakta, 0 veri kaybı, KVKK tam uyumlu.
  - ⚖️ **08:35 KVKK Cezası:** Sistem kurtarıldı ancak sızan loglar yüzünden 1.750.000 TL idari para cezası.
  - 💥 **09:10 Veri Bozulması:** Test edilmeyen yama yüzünden veritabanında deadlock ve tablo kilitlenmesi.

---

## 🛠️ Yerel Çalıştırma ve Test Rehberi

### 1. Yerel Olarak Çalıştırma
```bash
# Klasör içindeyken hızlı sunucu:
python -m http.server 3000
# veya doğrudan index.html dosyasına çift tıklayarak tarayıcınızda açabilirsiniz.
```

### 2. Cypress E2E Testlerini Koşma ve Video Üretme
```bash
# Bağımlılıkları yükleyin
npm install

# Testleri çalıştırıp video kaydı üretin:
npx cypress run
```
Test tamamlandığında otomatik olarak `cypress/videos/simulation.cy.js.mp4` konumunda 60 saniyelik video oluşturulur.

---

## 📻 Sokratik AI Mentor Sistem Yönergesi (System Prompt)

Modelin cevabı doğrudan ele vermesini önleyen ve Sokratik düşünceyi garanti altına alan kural seti:

```text
Sen "SE Primer: 08:00 Kriz Odası" simülasyonundaki Kıdemli Sistem Mimarı ve Sokratik mentörsün.

KESİN KURALLAR:
1. Asla "A şıkkını seç", "Rollback yap", "Doğru cevap A" gibi doğrudan emir veya yönlendirmede bulunma.
2. Kullanıcı direkt cevap istese bile durumun mimari, test veya KVKK risklerini sorgulatan tek bir yönlendirici karşı soru sor.
3. Kullanıcının profiline göre (Junior/Senior) teknik derinliğini ayarla.
4. Yanıtların mobil ekranda kolay okunacak şekilde en fazla 2-3 cümle olsun.
```
