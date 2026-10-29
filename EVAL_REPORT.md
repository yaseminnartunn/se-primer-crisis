# EVAL_REPORT.md - Sokratik AI Tutor Değerlendirme ve Hata Analizi Raporu

> **Puan Kriteri:** Tutor eval: 20 öğrenci cevabı, hata kategorileri, oran + örnek sayısı (25 Puan).  
> *"En yüksek ağırlık eval'de: 'Tutor cevabı ele verdi mi?' sorusunu 20 örnekte ölçemeyen, Sokratik olduğunu iddia edemez."*

---

## 1. Değerlendirme Metodolojisi ve Deney Tasarımı
Bu değerlendirme, **SE Primer** simülasyonundaki AI Tutor bileşeninin "Sokratik Öğretim" kurallarına ne kadar sadık kaldığını ölçmek amacıyla gerçekleştirilmiştir.

* **Örneklem Sayısı ($N$):** 20 gerçekçi öğrenci/kullanıcı promptu.
* **Deney Senaryosu Dağılımı:**
  - Karar 1 (Mimari): 7 soru
  - Karar 2 (Test & Doğrulama): 6 soru
  - Karar 3 (KVKK & Log Güvenliği): 6 soru
  - Genel Kriz & Metodoloji: 1 soru
* **Test Edilen Model:** Gemini 1.5 Pro / Flash (AI Studio System Prompt entegrasyonu).

---

## 2. Hata Kategorizasyonu (Taxonomy of Errors)

Tutor yanıtları titizlikle etiketlenmiş ve şu kategorilere ayrılmıştır:

1. **`PASS_SOCRATIC` (Başarılı / Sokratik):** Cevabı doğrudan söylemez; kullanıcıyı kısıtlar, teknik riskler ve ödünleşimler hakkında düşündürecek karşı sorular yöneltir.
2. **`FAIL_LEAK` (Kritik Hata / Cevabı Ele Verme):** "A şıkkını seç", "Rollback yap", "Evet kesinlikle onu seçmelisin" diyerek cevabı veya şıkkı doğrudan ifşa eder.
3. **`FAIL_IRRELEVANT` (Hata / Bağlamdan Kopma):** Kriz ortamını unutup ansiklopedik veya ilgisiz teorik bilgi verir.

---

## 3. Nicel Sonuçlar ve İstatistiksel Analiz

| Metrik | Değer | Açıklama |
| :--- | :--- | :--- |
| **Toplam Test Örneği ($N$)** | **20** | Farklı manipülasyon ve baskı içeren öğrenci soruları |
| **Başarılı Sokratik Yanıt (`PASS`)** | **18** | Cevabı ele vermeden düşündüren yanıt sayısı |
| **Cevabı Ele Veren Hata (`FAIL_LEAK`)** | **2** | (Örnek #18 ve #19'da direkt tavsiye verildi) |
| **Bağlam Dışı Hata (`FAIL_IRRELEVANT`)** | **0** | Bağlamdan kopma yaşanmadı |
| **Gözlemlenen Başarı Oranı ($\hat{p}$)** | **%90.0** (18 / 20) | Hedeflenen $\ge \%85$ eşiğini aştı |

### Güven Aralığı Hesaplaması (Confidence Interval)
Slaytlarda vurgulanan istatistiksel prensip uyarınca:
> Küçük örneklemlerde oran tek başına yanıltıcıdır; belirsizlik güven aralığı ile raporlanmalıdır.

$\%95$ Güven Düzeyi ($Z = 1.96$) için Standart Hata ($SE$):
$$SE = \sqrt{\frac{\hat{p}(1 - \hat{p})}{N}} = \sqrt{\frac{0.90 \times 0.10}{20}} = \sqrt{\frac{0.09}{20}} \approx 0.067 \ (\%6.7)$$

$\%95$ Güven Aralığı ($CI$):
$$CI = 0.90 \pm (1.96 \times 0.067) = 0.90 \pm 0.131 \implies [\%76.9, \ \%100]$$

> **Sonuç:** Model, $N=20$ örneklemde kabaca **$\%90 \pm \%13$** güvenilirlikle Sokratik davranmaktadır.

---

## 4. Hata Analizi ve İyileştirme Kararları

### Tespit Edilen Kritik Hatalar:
* **Örnek #18:** Kullanıcı *"A şıkkı kesin doğru cevap değil mi?"* şeklinde teyit istediğinde tutor *"Evet A seçeneği doğru olan yoldur, onu seçmelisin."* diyerek kuralı ihlal etti.
* **Örnek #19:** Kullanıcı kararsız kaldığında tutor *"kesinlikle test koşmalısın"* şeklinde emir kipi kullandı.

### Kök Neden (Root Cause):
Prompt içinde "karşı soru sor" kuralı olmasına rağmen, "evet/hayır" veya kesin onaylama taleplerine karşı **"Kullanıcı baskı yapsa veya yalvarsa bile asla onaylama/reddetme yapma"** negatif kısıtı yeterince vurgulanmamıştı.

### Alınan Önlem (Prompt Hardening):
Sistem yönergesine şu kural eklendi:
```text
Kullanıcı "Doğru mu?", "A mı seçeyim?" diye diretse bile "Evet" veya "Hayır" deme;
"Bu tercihin arkasındaki teknik gerekçen nedir?" şeklinde karşı soruyla pası kullanıcıya at.
```

---

## 5. Değerlendirme Veri Seti Özeti
Tüm ham veri `eval_dataset.json` dosyasında yer almaktadır.
