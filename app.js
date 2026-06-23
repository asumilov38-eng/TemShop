let currentProduct = null;
let currentImageIndex = 0;
let currentGender = null;

function showGender(gender) {
    currentGender = gender;
    const names = { 'men': 'Мужчинам', 'women': 'Женщинам' };
    
    document.getElementById('gender-view').style.display = 'none';
    document.getElementById('categories-view').style.display = 'block';
    document.getElementById('gender-title').textContent = names[gender];
}

function showHome() {
    document.getElementById('gender-view').style.display = 'grid';
    document.getElementById('categories-view').style.display = 'none';
    document.getElementById('products-view').classList.add('hidden');
}

function showCategories() {
    document.getElementById('categories-view').style.display = 'block';
    document.getElementById('products-view').classList.add('hidden');
}

function showCategory(category) {
    const names = { 'glasses': 'Очки', 'bracelets': 'Браслеты', 'watches': 'Часы' };
    
    document.getElementById('categories-view').style.display = 'none';
    document.getElementById('products-view').classList.remove('hidden');
    document.getElementById('category-title').textContent = names[category];
    
    const filtered = products.filter(p => p.gender === currentGender && p.category === category);
    renderProducts(filtered);
}

function renderProducts(list) {
    const grid = document.getElementById('products-grid');
    
    if (list.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#666; grid-column:1/-1; padding:40px;">В этой категории пока нет товаров</p>';
        return;
    }

    // Используем requestAnimationFrame как в DomObyve
    requestAnimationFrame(() => {
        grid.innerHTML = list.map((product, index) => {
            const mainImg = product.images && product.images.length > 0 ? product.images[0] : 'images/mdi_shop.png';
            
            let priceHTML = `<span class="price-current">${product.price.toLocaleString()} ₽</span>`;
            if (product.oldPrice) {
                priceHTML += `<span class="price-old">${product.oldPrice.toLocaleString()} ₽</span>`;
            }

            // Убираем loading="lazy" — грузим все фото сразу как в DomObyve
            // Добавляем onerror fallback
            return `
                <div class="product-card" onclick="openProductModal(${product.id})" style="animation-delay: ${index * 0.05}s">
                    <img src="${mainImg}" 
                         alt="${product.name}" 
                         class="product-image"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%231a1a1a%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%23666%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EНет фото%3C/text%3E%3C/svg%3E'">
                    <div class="product-info">
                        <h2 class="product-name">${product.name}</h2>
                        <p class="product-desc">${product.description}</p>
                        <div>${priceHTML}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Перезапускаем анимации
        const cards = grid.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = '';
        });
    });
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    currentImageIndex = 0;
    
    document.getElementById('modal-name').textContent = product.name;
    document.getElementById('modal-description').textContent = product.description;
    
    let priceHTML = `<span class="price-current">${product.price.toLocaleString()} ₽</span>`;
    if (product.oldPrice) priceHTML += `<span class="price-old">${product.oldPrice.toLocaleString()} ₽</span>`;
    document.getElementById('modal-price').innerHTML = priceHTML;

    renderGallery();
    document.getElementById('product-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function renderGallery() {
    if (!currentProduct.images || currentProduct.images.length === 0) return;
    
    const modalImg = document.getElementById('modal-image');
    modalImg.src = currentProduct.images[currentImageIndex];
    modalImg.alt = currentProduct.name;
    
    const container = document.getElementById('modal-thumbnails');
    container.innerHTML = currentProduct.images.map((src, index) => `
        <img src="${src}" 
             class="thumb ${index === currentImageIndex ? 'active' : ''}" 
             onclick="changeImageToIndex(${index})"
             onerror="this.style.display='none'">
    `).join('');

    const arrows = document.querySelectorAll('.gallery-btn');
    arrows.forEach(arrow => {
        arrow.style.display = currentProduct.images.length > 1 ? 'block' : 'none';
    });
}

function changeImageToIndex(index) {
    currentImageIndex = index;
    renderGallery();
}

function changeImage(direction) {
    if (!currentProduct.images || currentProduct.images.length <= 1) return;
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentProduct.images.length - 1;
    if (currentImageIndex >= currentProduct.images.length) currentImageIndex = 0;
    renderGallery();
}

function openOrderModal() {
    closeModal();
    document.getElementById('order-product-name').textContent = `Вы заказываете: ${currentProduct.name}`;
    document.getElementById('order-modal').classList.remove('hidden');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

// Закрытие модалки по клику вне её или Escape
window.onclick = function(event) {
    const productModal = document.getElementById('product-modal');
    const orderModal = document.getElementById('order-modal');
    if (event.target === productModal) closeModal();
    if (event.target === orderModal) closeOrderModal();
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        closeOrderModal();
    }
});

// Делаем функции видимыми для HTML
window.showGender = showGender;
window.showHome = showHome;
window.showCategories = showCategories;
window.showCategory = showCategory;
window.openProductModal = openProductModal;
window.closeModal = closeModal;
window.changeImage = changeImage;
window.changeImageToIndex = changeImageToIndex;
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;