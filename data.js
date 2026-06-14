const products = [
    {
        id: 1,
        category: "glasses", // "glasses" или "watches"
        name: "Ray-Ban Classic",
        description: "Классические солнцезащитные очки с поляризацией. Идеальная защита от солнца и стильный вид.",
        price: 4500,
        oldPrice: 6000, // Если скидки нет, просто удали эту строку или поставь null
        images: ["images/glasses1.jpg", "images/glasses1_2.jpg"] // Массив фоток. Можно 1, можно 5.
    },
    {
        id: 2,
        category: "watches",
        name: "Casio Vintage",
        description: "Легендарные ретро-часы с металлическим браслетом. Водонепроницаемые, с подсветкой.",
        price: 3200,
        oldPrice: null, 
        images: ["images/watch1.jpg"] 
    }
    // ЧТОБЫ ДОБАВИТЬ НОВЫЙ ТОВАР, ПРОСТО СКОПИРУЙ БЛОК {} ВЫШЕ, ПОСТАВЬ ЗАПЯТУЮ И ВСТАВЬ ЕГО СЮДА
];