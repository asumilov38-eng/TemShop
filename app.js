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
    grid.innerHTML = '';
    
    if (list.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#666; grid-column:1/-1; padding:40px;">В этой категории пока нет товаров</p>';
        return;
    }

    list.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const mainImg = product.images && product.images.length > 0 ? product.images[0] : 'images/mdi_shop.png';
        
        let priceHTML = `<span class="price-current">${product.price.toLocaleString()} ₽</span>`;
        if (product.oldPrice) {
            priceHTML += `<span class="price-old">${product.oldPrice.toLocaleString()} ₽</span>`;
        }

        card.innerHTML = `
            <img src="${mainImg}" class="product-image" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div>${priceHTML}</div>
            </div>
        `;
        card.onclick = () => openProductModal(product);
        grid.appendChild(card);
    });
}

function openProductModal(product) {
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
    
    document.getElementById('modal-image').src = currentProduct.images[currentImageIndex];
    
    const container = document.getElementById('modal-thumbnails');
    container.innerHTML = '';
    currentProduct.images.forEach((src, index) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.className = `thumb ${index === currentImageIndex ? 'active' : ''}`;
        thumb.onclick = () => { currentImageIndex = index; renderGallery(); };
        container.appendChild(thumb);
    });

    const arrows = document.querySelectorAll('.gallery-btn');
    arrows.forEach(arrow => {
        arrow.style.display = currentProduct.images.length > 1 ? 'block' : 'none';
    });
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