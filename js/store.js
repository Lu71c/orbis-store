/* ==========================================================================
   AURA | PREMIUM SKINCARE & AESTHETICS - MOTORE E-COMMERCE (js/store.js)
   Include: Live Search, Filtri Categoria, Carrello Smart & Checkout Form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       0. PRECARICAMENTO IMMAGINI IN RAM
       Carica silenziosamente i file .webp appena l'utente atterra sul sito
       ========================================================================== */
    const storeImages = [
        'img/aura.hero-1[1].webp',
        'img/siero.illuminante[1].webp',
        'img/crema.rigenerante.notte[1].webp',
        'img/detergente.purificante[1].webp',
        'img/tonico.riequilibrante[1].webp',
        'img/maschera.detox.argilla[1].webp',
        'img/olio.corpo.vellutante[1].webp',
        'img/esfoliante.enzimatico.viso[1].webp',
        'img/crema.contorno.occhi[1].webp',
        'img/siero.retinolo.puro.1%25[1].webp',
        'img/essenza.idratante.profonda[1].webp',
        'img/balsamo.labbra.riparatore[1].webp',
        'img/lozione.corpo.esfoliante[1].webp',
        'img/crema.mani.protettiva[1].webp',
        'img/olio.viso.rigenerante[1].webp',
        'img/siero.niacinamide.10%25[1].webp',
        'img/detergente.oleoso.struccante[1].webp',
        'img/scrub.corpo.levigante[1].webp',
        'img/booster.vitamina.e.pura[1].webp',
        'img/crema.collo.e.decollete[1].webp',
        'img/patch.occhi.idrogel.(set)[1].webp'
    ];

    storeImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    /* ==========================================================================
       1. INTERFACCIA BASE E NAVIGAZIONE MOBILE
       ========================================================================== */
    const header = document.getElementById('mainHeader');
    const btnOpenMobile = document.getElementById('openMobileNav');
    const btnCloseMobile = document.getElementById('closeMobileNav');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    // Header Effetto Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Apertura/Chiusura Menu Mobile
    function toggleMobileMenu(forceClose = false) {
        if (!mobileDrawer) return;
        if (forceClose || mobileDrawer.classList.contains('open')) {
            mobileDrawer.classList.remove('open');
            document.body.classList.remove('no-scroll');
        } else {
            mobileDrawer.classList.add('open');
            document.body.classList.add('no-scroll');
        }
    }

    if (btnOpenMobile) btnOpenMobile.addEventListener('click', () => toggleMobileMenu(false));
    if (btnCloseMobile) btnCloseMobile.addEventListener('click', () => toggleMobileMenu(true));
    mobileLinks.forEach(link => link.addEventListener('click', () => toggleMobileMenu(true)));


    /* ==========================================================================
       2. LIVE SEARCH E FILTRI CATEGORIA
       ========================================================================== */
    const searchInput = document.getElementById('storeSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    const filterPills = document.querySelectorAll('.filter-pill');
    const productCards = document.querySelectorAll('.product-card');
    const noResultsBox = document.getElementById('noResults');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    let currentCategory = 'all';
    let currentSearchQuery = '';

    function filterStore() {
        let visibleCount = 0;

        productCards.forEach(card => {
            const category = card.getAttribute('data-category') || '';
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const actives = (card.getAttribute('data-actives') || '').toLowerCase();
            
            // Match Categoria
            const matchCategory = (currentCategory === 'all') || (category === currentCategory);
            // Match Ricerca
            const matchSearch = name.includes(currentSearchQuery) || actives.includes(currentSearchQuery);

            if (matchCategory && matchSearch) {
                card.classList.remove('hidden-product');
                visibleCount++;
            } else {
                card.classList.add('hidden-product');
            }
        });

        // Gestione Messaggio "Nessun Risultato"
        if (visibleCount === 0) {
            noResultsBox.classList.remove('hidden');
        } else {
            noResultsBox.classList.add('hidden');
        }
    }

    // Listener Ricerca Testuale
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.trim().toLowerCase();
            if (currentSearchQuery.length > 0) {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
            filterStore();
        });
    }

    // Listener Svuota Ricerca
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchQuery = '';
            clearSearchBtn.classList.add('hidden');
            filterStore();
        });
    }

    // Listener Filtri Categoria
    filterPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            filterPills.forEach(p => p.classList.remove('active'));
            const targetPill = e.target;
            targetPill.classList.add('active');
            
            currentCategory = targetPill.getAttribute('data-filter') || 'all';
            filterStore();
        });
    });

    // Tasto Reset Rapido
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            currentSearchQuery = '';
            if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
            
            filterPills.forEach(p => p.classList.remove('active'));
            document.querySelector('.filter-pill[data-filter="all"]').classList.add('active');
            currentCategory = 'all';
            
            filterStore();
        });
    }


    /* ==========================================================================
       3. GESTIONE CARRELLO (Add, Remove, Qty, LocalStorage, Progress Bar)
       ========================================================================== */
    let cart = [];
    const STORAGE_KEY = 'aura_store_cart_v2';
    const FREE_SHIPPING_THRESHOLD = 50.00;
    const STANDARD_SHIPPING_COST = 5.90;

    // Elementi DOM Carrello
    const btnOpenCart = document.getElementById('openCartBtn');
    const btnCloseCart = document.getElementById('closeCartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartBackdrop = document.getElementById('cartBackdrop');
    
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartCountUI = document.getElementById('cartCount');
    const cartItemsIndicator = document.getElementById('cartItemsIndicator');
    
    const cartSubtotalUI = document.getElementById('cartSubtotalUI');
    const cartShippingUI = document.getElementById('cartShippingUI');
    const cartTotalUI = document.getElementById('cartTotalUI');
    
    const shippingProgressBar = document.getElementById('shippingProgressBar');
    const shippingStatusText = document.getElementById('shippingStatusText');
    
    const addToCartBtns = document.querySelectorAll('.add-to-cart');

    // Funzioni Carrello di base
    function loadCart() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) cart = JSON.parse(stored);
        } catch (e) {
            cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    function toggleCart(show) {
        if (show) {
            cartSidebar.classList.add('open');
            cartBackdrop.classList.add('open');
            document.body.classList.add('no-scroll');
        } else {
            cartSidebar.classList.remove('open');
            cartBackdrop.classList.remove('open');
            if (!mobileDrawer.classList.contains('open')) {
                document.body.classList.remove('no-scroll');
            }
        }
    }

    if (btnOpenCart) btnOpenCart.addEventListener('click', () => toggleCart(true));
    if (btnCloseCart) btnCloseCart.addEventListener('click', () => toggleCart(false));
    if (cartBackdrop) cartBackdrop.addEventListener('click', () => toggleCart(false));

    // Aggiunta e Modifica Quantità
    function addToCart(id, name, price, img) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += 1;
        } else {
            cart.push({ id, name, price: parseFloat(price), img, quantity: 1 });
        }
        saveCart();
        renderCart();
        toggleCart(true);
    }

    function updateQuantity(id, change) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            saveCart();
            renderCart();
        }
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCart();
    }

    // Renderizzazione Interfaccia Carrello
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🌿</div>
                    <p>Il tuo carrello è attualmente vuoto.</p>
                    <button class="btn-ghost" style="margin-top: 1rem;" onclick="document.getElementById('closeCartBtn').click()">Scopri i trattamenti</button>
                </div>
            `;
            shippingProgressBar.style.width = '0%';
            shippingStatusText.innerHTML = `Spedizione gratuita da € ${FREE_SHIPPING_THRESHOLD.toFixed(2)}`;
            cartShippingUI.textContent = '€ 0.00';
            document.getElementById('openCheckoutBtn').disabled = true;
        } else {
            document.getElementById('openCheckoutBtn').disabled = false;
            
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                totalItems += item.quantity;

                const row = document.createElement('div');
                row.className = 'cart-item';
                row.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">€ ${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <div class="qty-controls">
                                <button class="qty-btn minus" data-id="${item.id}">-</button>
                                <span class="qty-display">${item.quantity}</span>
                                <button class="qty-btn plus" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-btn" data-id="${item.id}">Rimuovi</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(row);
            });

            // Gestione Spedizione e Barra di Progresso
            let shippingCost = STANDARD_SHIPPING_COST;
            if (subtotal >= FREE_SHIPPING_THRESHOLD) {
                shippingCost = 0;
                shippingProgressBar.style.width = '100%';
                shippingProgressBar.style.backgroundColor = '#4ade80'; // Verde successo
                shippingStatusText.innerHTML = `<strong>Spedizione Express Gratuita</strong> sbloccata!`;
            } else {
                const missing = FREE_SHIPPING_THRESHOLD - subtotal;
                const percentage = (subtotal / FREE_SHIPPING_THRESHOLD) * 100;
                shippingProgressBar.style.width = `${percentage}%`;
                shippingProgressBar.style.backgroundColor = 'var(--text-dark)';
                shippingStatusText.innerHTML = `Aggiungi € ${missing.toFixed(2)} per la <strong>Spedizione Gratuita</strong>`;
            }

            cartShippingUI.textContent = shippingCost === 0 ? 'Gratuita' : `€ ${shippingCost.toFixed(2)}`;
        }

        // Totali e Badge
        const finalTotal = subtotal + (subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_COST : 0);
        
        cartSubtotalUI.textContent = `€ ${subtotal.toFixed(2)}`;
        cartTotalUI.textContent = `€ ${finalTotal.toFixed(2)}`;
        cartCountUI.textContent = totalItems.toString();
        cartItemsIndicator.textContent = `(${totalItems} articol${totalItems === 1 ? 'o' : 'i'})`;

        // Associazione Listeners Interni al Carrello
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, -1));
        });
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, 1));
        });
        document.querySelectorAll('.cart-item .remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => removeFromCart(e.target.dataset.id));
        });
    }

    // Listener Aggiungi al Carrello Vetrina
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnEl = e.currentTarget;
            const id = btnEl.getAttribute('data-id');
            const name = btnEl.getAttribute('data-name');
            const price = btnEl.getAttribute('data-price');
            const img = btnEl.getAttribute('data-img');
            addToCart(id, name, price, img);
        });
    });


    /* ==========================================================================
       4. MODALE CHECKOUT REALISTICO
       ========================================================================== */
    const openCheckoutBtn = document.getElementById('openCheckoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const checkoutFormStep = document.getElementById('checkoutFormStep');
    const checkoutSuccessStep = document.getElementById('checkoutSuccessStep');
    const checkoutForm = document.getElementById('checkoutForm');
    
    // Nodi Riepilogo Checkout Modal
    const modalSummaryCount = document.getElementById('modalSummaryCount');
    const modalSummaryItems = document.getElementById('modalSummaryItems');
    const modalSummaryShipping = document.getElementById('modalSummaryShipping');
    const modalSummaryTotal = document.getElementById('modalSummaryTotal');

    function toggleCheckoutModal(show) {
        if (show) {
            // Popola il riepilogo ordini
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
            const total = subtotal + shipping;

            modalSummaryCount.textContent = totalItems;
            modalSummaryItems.textContent = `€ ${subtotal.toFixed(2)}`;
            modalSummaryShipping.textContent = shipping === 0 ? 'Gratuita' : `€ ${shipping.toFixed(2)}`;
            modalSummaryTotal.textContent = `€ ${total.toFixed(2)}`;

            toggleCart(false); // Chiude il carrello
            checkoutModal.classList.add('open');
            document.body.classList.add('no-scroll');
        } else {
            checkoutModal.classList.remove('open');
            document.body.classList.remove('no-scroll');
        }
    }

    if (openCheckoutBtn) {
        openCheckoutBtn.addEventListener('click', () => {
            if (cart.length > 0) toggleCheckoutModal(true);
        });
    }

    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', () => toggleCheckoutModal(false));
    }

    // Gestione Submit Ordine
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Estrazione Dati Spedizione
            const orderName = document.getElementById('orderName').value;
            const orderAddress = document.getElementById('orderAddress').value;
            const orderCity = document.getElementById('orderCity').value;
            
            // Metodo Pagamento
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            // Totale Calcolato
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
            const finalTotal = `€ ${(subtotal + shipping).toFixed(2)}`;
            
            // Generazione Fake Order ID
            const orderId = '#AURA-' + Math.floor(10000 + Math.random() * 90000);

            // Transizione a schermata successo
            const submitBtn = document.getElementById('submitOrderBtn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.innerHTML = 'Elaborazione in corso... ⏳';
            submitBtn.style.pointerEvents = 'none';

            setTimeout(() => {
                // Popola Ricevuta
                document.getElementById('receiptOrderId').textContent = orderId;
                document.getElementById('receiptName').textContent = orderName;
                document.getElementById('receiptAddress').textContent = `${orderAddress}, ${orderCity}`;
                document.getElementById('receiptPayment').textContent = paymentMethod;
                document.getElementById('receiptTotal').textContent = finalTotal;

                // Cambia Step
                checkoutFormStep.classList.add('hidden');
                checkoutSuccessStep.classList.remove('hidden');

                // Svuota Carrello reale
                cart = [];
                saveCart();
                renderCart();

                submitBtn.innerHTML = originalBtnText;
                submitBtn.style.pointerEvents = 'auto';
            }, 1800);
        });
    }

    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            toggleCheckoutModal(false);
            setTimeout(() => {
                // Reset form al volo per la prossima volta
                checkoutForm.reset();
                checkoutSuccessStep.classList.add('hidden');
                checkoutFormStep.classList.remove('hidden');
            }, 500);
        });
    }

    /* ==========================================================================
       5. MODALI INFORMATIVI (Ingredienti, Spedizioni, Contatti)
       ========================================================================== */
    const infoModal = document.getElementById('infoModal');
    const infoModalBody = document.getElementById('infoModalBody');
    const closeInfoBtn = document.getElementById('closeInfoBtn');
    const infoTriggers = document.querySelectorAll('.open-info-trigger');

    const infoData = {
        'ingredienti': `
            <div class="modal-header">
                <span class="section-tag">Trasparenza Botanica</span>
                <h2>I Nostri Principi Attivi</h2>
            </div>
            <p style="margin-bottom: 15px;">Le nostre formule escludono rigorosamente siliconi, parabeni, ftalati e coloranti sintetici. Sfruttiamo il potere della natura supportato dalla scienza.</p>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 15px;">
                <li style="background: var(--bg-drawer); padding: 15px; border-radius: var(--radius-sm);">
                    <strong style="display:block; color: var(--accent-gold); margin-bottom:5px;">Retinolo Vegetale (Bakuchiol)</strong>
                    <span style="font-size: 0.9rem; color: var(--text-medium);">Alternativa delicata al retinolo tradizionale, stimola il collagene senza fotosensibilizzazione.</span>
                </li>
                <li style="background: var(--bg-drawer); padding: 15px; border-radius: var(--radius-sm);">
                    <strong style="display:block; color: var(--accent-gold); margin-bottom:5px;">Acido Ialuronico a Triplo Peso Molecolare</strong>
                    <span style="font-size: 0.9rem; color: var(--text-medium);">Garantisce un'idratazione multilivello, dalla superficie fino al derma profondo.</span>
                </li>
                <li style="background: var(--bg-drawer); padding: 15px; border-radius: var(--radius-sm);">
                    <strong style="display:block; color: var(--accent-gold); margin-bottom:5px;">Vitamina C Stabilizzata (Ascorbyl Glucoside)</strong>
                    <span style="font-size: 0.9rem; color: var(--text-medium);">Potente antiossidante che uniforma l'incarnato e combatte i radicali liberi.</span>
                </li>
            </ul>
        `,
        'spedizioni': `
            <div class="modal-header">
                <span class="section-tag">Logistica & E-Commerce</span>
                <h2>Spedizioni & Resi</h2>
            </div>
            <div style="line-height: 1.8; color: var(--text-medium); font-size: 0.95rem;">
                <h4 style="color: var(--text-dark); margin-bottom: 8px;">Tempi e Costi di Spedizione</h4>
                <p style="margin-bottom: 15px;">Spediamo in tutta Italia entro 24/48 ore lavorative tramite corriere espresso (DHL o BRT).<br>
                La spedizione Standard ha un costo di <strong>€ 5.90</strong>, ma è <strong>gratuita per tutti gli ordini superiori a € 50.00</strong>.</p>
                
                <h4 style="color: var(--text-dark); margin-bottom: 8px; margin-top: 20px;">Politica di Reso (Soddisfatti o Rimborsati)</h4>
                <p>Se la tua pelle non ama i nostri prodotti, puoi effettuare il reso gratuitamente entro 30 giorni dalla ricezione dell'ordine, anche se il prodotto è stato parzialmente utilizzato (fino a un massimo del 20%). Il rimborso avverrà sullo stesso metodo di pagamento utilizzato.</p>
            </div>
        `,
        'contatti': `
            <div class="modal-header">
                <span class="section-tag">Assistenza Clienti</span>
                <h2>Contatti & Boutique</h2>
            </div>
            <div style="text-align: center; margin-bottom: 30px;">
                <p style="color: var(--text-medium); margin-bottom: 20px;">I nostri esperti di skincare sono a tua disposizione per consulenze personalizzate o assistenza sugli ordini.</p>
                
                <div style="background: var(--bg-drawer); padding: 20px; border-radius: var(--radius-md); margin-bottom: 15px;">
                    <span style="font-size: 2rem; display: block; margin-bottom: 10px;">✉️</span>
                    <strong>concierge@auraskincare.it</strong>
                    <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 5px;">Rispondiamo entro 12 ore</p>
                </div>
                
                <div style="background: var(--bg-drawer); padding: 20px; border-radius: var(--radius-md);">
                    <span style="font-size: 2rem; display: block; margin-bottom: 10px;">📍</span>
                    <strong>AURA Flagship Store Roma</strong>
                    <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 5px;">Via dei Condotti 12, RM<br>Aperto Lun-Sab: 10:00 - 19:30</p>
                </div>
            </div>
        `,
        'resi': `
            <div class="modal-header">
                <span class="section-tag">Tranquillità d'Acquisto</span>
                <h2>Politica di Reso Estesa</h2>
            </div>
            <p style="color: var(--text-medium); line-height: 1.8;">Ogni pelle è unica. Se un prodotto AURA non si adatta alle tue esigenze cutanee, hai 30 giorni per restituirlo. Scrivi a concierge@auraskincare.it fornendo il tuo numero d'ordine (es. #AURA-12345) e ti invieremo l'etichetta di reso prepagata gratuita. Elaboriamo i rimborsi entro 48 ore dalla ricezione in magazzino.</p>
        `
    };

    function toggleInfoModal(show, type = '') {
        if (show) {
            infoModalBody.innerHTML = infoData[type] || '<p>Contenuto in aggiornamento...</p>';
            infoModal.classList.add('open');
            document.body.classList.add('no-scroll');
        } else {
            infoModal.classList.remove('open');
            if (!cartSidebar.classList.contains('open') && !checkoutModal.classList.contains('open') && !mobileDrawer.classList.contains('open')) {
                document.body.classList.remove('no-scroll');
            }
        }
    }

    infoTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalType = e.currentTarget.getAttribute('data-modal');
            toggleMobileMenu(true); // Chiude il drawer mobile se aperto
            toggleInfoModal(true, modalType);
        });
    });

    if (closeInfoBtn) {
        closeInfoBtn.addEventListener('click', () => toggleInfoModal(false));
    }
    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) toggleInfoModal(false);
        });
    }

    // Inizializzazione Globale Finale
    loadCart();
    renderCart();
});
