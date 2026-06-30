let currentProduct = null;
let currentImageIndex = 0;
let currentGender = null;
let currentView = 'gender';

const imageCache = new Map();

const STATIC_IMAGES = [
    'images/mdi_shop.png',
    'images/men.png',
    'images/women.png',
    'images/glasses.png',
    'images/bracelets.png',
    'images/watches.png'
];

function getAllImageUrls() {
    const productImages = products.flatMap(p => p.images || []);
    return [...new Set([...STATIC_IMAGES, ...productImages])];
}

function preloadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);

    const promise = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });

    imageCache.set(src, promise);
    return promise;
}

function preloadAllImages() {
    const urls = getAllImageUrls();

    urls.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });

    return Promise.all(urls.map(preloadImage));
}

function markImageLoaded(img) {
    img.classList.add('loaded');
    const skeleton = img.parentElement?.querySelector('.product-image-skeleton');
    if (skeleton) skeleton.classList.add('hidden');
}

function setupProductImage(img) {
    const src = img.getAttribute('src');
    if (!src) return;

    const cached = imageCache.get(src);
    if (cached) {
        cached.then(result => {
            if (result) markImageLoaded(img);
            else img.classList.add('loaded');
        });
    } else {
        img.onload = () => markImageLoaded(img);
        img.onerror = () => markImageLoaded(img);
        if (img.complete && img.naturalWidth > 0) markImageLoaded(img);
    }
}

function switchView(viewId) {
    const views = ['gender-view', 'categories-view', 'products-view'];
    const targetId = viewId + '-view';

    views.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('view--active', id === targetId);
    });

    currentView = viewId;
    updateHeaderBack();
}

function updateHeaderBack() {
    const backBtn = document.getElementById('header-back');
    if (!backBtn) return;

    if (currentView === 'gender') {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }
}

function handleHeaderBack() {
    if (currentView === 'products') showCategories();
    else if (currentView === 'categories') showHome();
}

function showGender(gender) {
    currentGender = gender;
    const names = { men: 'Мужчинам', women: 'Женщинам' };
    document.getElementById('gender-title').textContent = names[gender];
    switchView('categories');
}

function showHome() {
    switchView('gender');
}

function showCategories() {
    switchView('categories');
}

function showCategory(category) {
    const names = { glasses: 'Очки', bracelets: 'Браслеты', watches: 'Часы' };
    document.getElementById('category-title').textContent = names[category];
    switchView('products');

    const filtered = products.filter(p => p.gender === currentGender && p.category === category);
    renderProducts(filtered);
}

function renderProducts(list) {
    const grid = document.getElementById('products-grid');

    if (list.length === 0) {
        grid.innerHTML = '<p class="empty-state">В этой категории пока нет товаров</p>';
        return;
    }

    requestAnimationFrame(() => {
        grid.innerHTML = list.map((product, index) => {
            const mainImg = product.images?.length ? product.images[0] : 'images/mdi_shop.png';

            let priceHTML = `<span class="price-current">${product.price.toLocaleString()} ₽</span>`;
            if (product.oldPrice) {
                priceHTML += `<span class="price-old">${product.oldPrice.toLocaleString()} ₽</span>`;
            }

            const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%231a1a1a' width='400' height='400'/%3E%3Ctext fill='%23666' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-size='16'%3EНет фото%3C/text%3E%3C/svg%3E";

            return `
                <article class="product-card" onclick="openProductModal(${product.id})" style="animation-delay: ${index * 0.06}s">
                    <div class="product-image-wrap">
                        <div class="product-image-skeleton"></div>
                        <img src="${mainImg}"
                             alt="${product.name}"
                             class="product-image"
                             decoding="async"
                             onerror="this.src='${fallback}'; this.classList.add('loaded'); this.previousElementSibling?.classList.add('hidden')">
                    </div>
                    <div class="product-info">
                        <h2 class="product-name">${product.name}</h2>
                        <p class="product-desc">${product.description}</p>
                        <div class="product-price-row">${priceHTML}</div>
                    </div>
                </article>
            `;
        }).join('');

        grid.querySelectorAll('.product-image').forEach(setupProductImage);
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
    if (product.oldPrice) {
        priceHTML += `<span class="price-old">${product.oldPrice.toLocaleString()} ₽</span>`;
    }
    document.getElementById('modal-price').innerHTML = priceHTML;

    renderGallery();
    document.getElementById('product-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function renderGallery() {
    if (!currentProduct?.images?.length) return;

    const modalImg = document.getElementById('modal-image');
    const src = currentProduct.images[currentImageIndex];

    modalImg.classList.add('switching');

    const show = () => {
        modalImg.src = src;
        modalImg.alt = currentProduct.name;
        modalImg.classList.remove('switching');
    };

    const cached = imageCache.get(src);
    if (cached) {
        cached.then(() => show());
    } else {
        preloadImage(src).then(() => show());
    }

    document.getElementById('modal-thumbnails').innerHTML = currentProduct.images.map((thumbSrc, index) => `
        <img src="${thumbSrc}"
             class="thumb ${index === currentImageIndex ? 'active' : ''}"
             onclick="changeImageToIndex(${index})"
             onerror="this.style.display='none'">
    `).join('');

    document.querySelectorAll('.gallery-btn').forEach(btn => {
        btn.style.display = currentProduct.images.length > 1 ? 'flex' : 'none';
    });
}

function changeImageToIndex(index) {
    currentImageIndex = index;
    renderGallery();
}

function changeImage(direction) {
    if (!currentProduct?.images || currentProduct.images.length <= 1) return;
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

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
        closeOrderModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    preloadAllImages();
    switchView('gender');
});

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
window.handleHeaderBack = handleHeaderBack;
