define([
    'jquery',
    'Magento_Catalog/js/price-utils',
    'domReady!'
], function ($, priceUtils) {
    'use strict';

    return function (config, element) {
        
        var priceFormat = config.priceFormat;

        // Fiyatı doğrudan ekrandaki görünen metinden (₺2.800 vb.) kazıyan fonksiyon
        function getRawPrice() {
            var priceText = $('.product-info-main .price-final_price .price').first().text();
            
            if (!priceText) {
                // Eğer ekranda metin bulamazsa son çare eski yönteme baksın
                var fallbackPrice = $('.product-info-main .price-final_price .price-wrapper').first().attr('data-price-amount');
                return parseFloat(fallbackPrice) || 0;
            }

            // İçindeki harf, sembol (₺) ve boşlukları sil; sadece rakam, virgül ve nokta kalsın.
            var cleanText = priceText.replace(/[^\d.,]/g, '');

            // Türkiye/Avrupa formatını (18.400,50) yazılım diline (18400.50) çevirme
            if (cleanText.indexOf(',') !== -1) {
                // Virgül varsa ondalıklıdır. Noktaları (binlik ayırıcı) sil, virgülü noktaya dönüştür.
                cleanText = cleanText.replace(/\./g, '').replace(',', '.');
            } else {
                // Sadece nokta varsa (2.500) bu binlik ayırıcıdır, noktayı tamamen sil.
                cleanText = cleanText.replace(/\./g, '');
            }

            return parseFloat(cleanText);
        }

        function updateDisplay() {
            var val = getRawPrice();
            if (val && val > 0) {
                var disc = val * 0.90;
                var inst = val / 6;
                
                $('#discounted-price-val').text(priceUtils.formatPrice(disc, priceFormat));
                $('#installment-price-val').text(priceUtils.formatPrice(inst, priceFormat));
            }
        }

        // 1. Seçeneklere tıklandığında tetikle
        $(document).on('click change', '.swatch-option, .product-custom-option, select.admin__control-select', function() {
            setTimeout(updateDisplay, 300);
            setTimeout(updateDisplay, 800);
        });

        // 2. Fiyat kutusundaki HTML değişirse tetikle
        var targetNode = document.querySelector('.price-box.price-final_price');
        if (targetNode) {
            var observer = new MutationObserver(function() {
                updateDisplay();
            });
            // subtree true yaparak .price içindeki metin değişimini de yakalıyoruz
            observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
        }

        // 3. Her ihtimale karşı sürekli kontrol (Her saniye metni kontrol eder)
        setInterval(updateDisplay, 1000);

        // Sayfa ilk yüklendiğinde çalıştır
        updateDisplay();
    };
});