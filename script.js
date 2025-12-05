// --- 變數和初始化 ---
const priceRange = document.getElementById('price-range');
const priceDisplay = document.getElementById('price-display');
const typeTagsContainer = document.getElementById('type-tags');
const recommendBtn = document.getElementById('recommend-btn');
const recommendationsContainer = document.getElementById('recommendations-container');
const thumbEmoji = document.getElementById('thumb-emoji');

let selectedType = ''; // 儲存目前選中的類型
// 移除 currentRecommendationIDs，因為我們現在只推薦一個

// A. 初始化：生成類型標籤
function initializeTypeTags() {
    // 設置範圍的最大值和最小值 (從 data.js 載入)
    priceRange.min = MIN_PRICE;
    priceRange.max = MAX_PRICE;
    priceRange.value = MAX_PRICE; // 預設顯示最高預算

    MEAL_TYPES.forEach(type => {
        const button = document.createElement('button');
        button.textContent = type;
        button.dataset.type = type;
        
        button.addEventListener('click', (event) => {
            // 切換選中狀態的邏輯保持不變...
            const clickedButton = event.target;
            if (clickedButton.classList.contains('selected')) {
                clickedButton.classList.remove('selected');
                selectedType = '';
            } else {
                document.querySelectorAll('.type-tags button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                clickedButton.classList.add('selected');
                selectedType = type;
            }
        });
        typeTagsContainer.appendChild(button);
    });
}

// B. 監聽預算滑塊變動
priceRange.addEventListener('input', () => {
    priceDisplay.textContent = `${MIN_PRICE} - ${priceRange.value}`;
    updateEmojiPosition(); // 拖曳時，移動 Emoji
});

// C. 核心功能：執行篩選和推薦 (生成新的 1 個選項)
function recommendMeals() {
    
    // 1. 篩選：我們不傳遞 excludedIDs，因為只選一個，每次都從符合條件的全部選項中隨機選取
    const filteredMeals = filterMeals([]); 
    
    // 2. 隨機選取 1 個
    let recommendation = null;
    if (filteredMeals.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredMeals.length);
        recommendation = filteredMeals[randomIndex];
    }

    // 3. 顯示結果 (將推薦結果包裹在陣列中)
    renderRecommendations(recommendation ? [recommendation] : []);
    
    // 更改按鈕文字以符合單選邏輯 (非必要，但能讓介面更一致)
    recommendBtn.textContent = '🚀 換個選項！'; 
}

// D. 輔助函式：根據目前條件篩選餐點 (邏輯不變，只是不再需要排除 ID)
function filterMeals(excludeIDs = []) { 
    const maxPrice = parseInt(priceRange.value);
    
    return MEAL_OPTIONS.filter(meal => {
        const priceMatch = meal.price <= maxPrice;
        const typeMatch = selectedType === '' || meal.type === selectedType;
        // 雖然只選一個，但為保留替換邏輯的彈性，仍保留 notExcluded 檢查
        const notExcluded = !excludeIDs.includes(meal.id); 
        return priceMatch && typeMatch && notExcluded;
    });
}

// E. 渲染結果到 HTML (只渲染一個卡片)
function renderRecommendations(meals) {
    recommendationsContainer.innerHTML = ''; 
    
    if (meals.length === 0) {
        recommendationsContainer.innerHTML = '<p class="placeholder-text">😭 沒有符合您條件的餐點，請放寬預算或類型限制！</p>';
        return;
    }

    const meal = meals[0]; // 只取第一個 (也就是唯一的那個)
    
    const card = document.createElement('div');
    // 修改卡片樣式讓它居中且更突出 (需調整 style.css)
    card.className = 'meal-card single-card'; 
    card.dataset.id = meal.id; 
    
    // 移除「換一個」按鈕，因為主要按鈕 (recommendBtn) 已經是「換一個」的功能了
    card.innerHTML = `
        <h3>🎉 您的最終決策！</h3>
        <h4>${meal.name}</h4>
        <p>類型：${meal.type}</p>
        <p class="price">預估金額：$${meal.price}</p>
        <p>⭐ 推薦理由：${meal.reason}</p>
    `;
    recommendationsContainer.appendChild(card);
    
    // 移除 F. 綁定「換一個」按鈕事件
}

// H. 綁定主按鈕事件
recommendBtn.addEventListener('click', recommendMeals);

// K. 新函式：根據滑塊值計算 Emoji 的位置
function updateEmojiPosition() {
    const min = parseFloat(priceRange.min);
    const max = parseFloat(priceRange.max);
    const value = parseFloat(priceRange.value);
    
    // 計算百分比位置 (0到1)
    const percent = (value - min) / (max - min);
    
    // 考慮滑塊寬度，進行微調讓 Emoji 中心對齊拇指
    const thumbSize = 40; // 匹配 CSS 中的 width/height
    const trackWidth = priceRange.clientWidth;
    
    // 調整邊界：確保 Emoji 在 0% 和 100% 時不會超出軌道
    const adjustedPercent = percent * trackWidth;
    const offset = thumbSize / 2;
    
    // 最終位置 (從左邊開始計算)
    let leftPosition = adjustedPercent;

    // 調整邊界，確保不跑出左右邊界
    if (leftPosition < offset) {
        leftPosition = offset;
    } else if (leftPosition > trackWidth - offset) {
        leftPosition = trackWidth - offset;
    }

    // 設定位置
    thumbEmoji.style.left = `${leftPosition}px`;
}

// 網頁載入完成後執行初始化 (修改此處)
document.addEventListener('DOMContentLoaded', () => {
    initializeTypeTags();
    priceDisplay.textContent = `${MIN_PRICE} - ${MAX_PRICE}`; 
    
    // 初始化時，計算一次 Emoji 位置
    updateEmojiPosition(); 
    recommendMeals(); 
});