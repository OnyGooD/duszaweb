let currentDungeon = null;
let selectedCards = [];
let leaderCard = null;
let customCards = [];
let nextCardId = 100;
let nextDungeonId = 16;

const availableCards = [
    { id: 1, name: "Harcos", type: "unit", attack: 5, defense: 3, isCustom: false },
    { id: 2, name: "Varázsló", type: "unit", attack: 7, defense: 2, isCustom: false },
    { id: 3, name: "Íjász", type: "unit", attack: 4, defense: 2, isCustom: false },
    { id: 4, name: "Lovag", type: "unit", attack: 6, defense: 5, isCustom: false },
    { id: 7, name: "Óriás", type: "unit", attack: 10, defense: 8, isCustom: false },
    { id: 8, name: "Sárkány", type: "unit", attack: 12, defense: 10, isCustom: false },
    { id: 9, name: "Pap", type: "unit", attack: 2, defense: 4, isCustom: false },
    { id: 10, name: "Orgyilkos", type: "unit", attack: 9, defense: 1, isCustom: false }
];

// Kazamaták tömbje - most már globálisan elérhető és megosztott
window.allDungeons = [
    { id: 1, name: "Hegy Temető", type: "Temető", variant: "Hegy", cardCount: 0 },
    { id: 2, name: "Sivatag Temető", type: "Temető", variant: "Sivatag", cardCount: 0 },
    { id: 3, name: "Mocsár Temető", type: "Temető", variant: "Mocsár", cardCount: 0 },
    { id: 4, name: "Barlang Temető", type: "Temető", variant: "Barlang", cardCount: 0 },
    { id: 5, name: "Dzsungel Temető", type: "Temető", variant: "Dzsungel", cardCount: 0 },
    { id: 6, name: "Hegy Falu", type: "Falu", variant: "Hegy", cardCount: 0 },
    { id: 7, name: "Sivatag Falu", type: "Falu", variant: "Sivatag", cardCount: 0 },
    { id: 8, name: "Mocsár Falu", type: "Falu", variant: "Mocsár", cardCount: 0 },
    { id: 9, name: "Barlang Falu", type: "Falu", variant: "Barlang", cardCount: 0 },
    { id: 10, name: "Dzsungel Falu", type: "Falu", variant: "Dzsungel", cardCount: 0 },
    { id: 11, name: "Hegy Kastély", type: "Kastély", variant: "Hegy", cardCount: 0 },
    { id: 12, name: "Sivatag Kastély", type: "Kastély", variant: "Sivatag", cardCount: 0 },
    { id: 13, name: "Mocsár Kastély", type: "Kastély", variant: "Mocsár", cardCount: 0 },
    { id: 14, name: "Barlang Kastély", type: "Kastély", variant: "Barlang", cardCount: 0 },
    { id: 15, name: "Dzsungel Kastély", type: "Kastély", variant: "Dzsungel", cardCount: 0 }
];

// Betöltjük a mentett kazamatákat, ha vannak
function loadDungeonsFromLocalStorage() {
    const savedDungeons = localStorage.getItem('allDungeons');
    if (savedDungeons) {
        window.allDungeons = JSON.parse(savedDungeons);
    }
}

// Elmentjük a kazamatákat a localStorage-ba
function saveDungeonsToLocalStorage() {
    localStorage.setItem('allDungeons', JSON.stringify(window.allDungeons));
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    if (!username) {
        alert('Kérlek add meg a felhasználónevet!');
        return;
    }
    if (!password) {
        alert('Kérlek add meg a jelszót!');
        return;
    }

    console.log('Login:', { username, role });

    if (role === 'gamemaster') {
        renderGMDungeons();
        showScreen('gamemasterDungeonsScreen');
    } else {
        renderPlayerDungeons();
        showScreen('playerDungeonsScreen');
    }
}

function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regConfirm').value;
    const role = document.getElementById('regRole').value;

    if (!username) {
        alert('Kérlek add meg a felhasználónevet!');
        return;
    }
    if (!email) {
        alert('Kérlek add meg az email címet!');
        return;
    }
    if (!password || password.length < 6) {
        alert('A jelszónak legalább 6 karakternek kell lennie!');
        return;
    }
    if (password !== passwordConfirm) {
        alert('A két jelszó nem egyezik!');
        return;
    }

    console.log('Register:', { username, email, role });
    alert('Regisztráció sikeres! Most jelentkezz be.');
    showLogin();
}

function logout() {
    window.location.href = 'index.html';
}

function renderPlayerDungeons() {
    const grid = document.getElementById('playerDungeonsGrid');
    grid.innerHTML = '';

    // Az első 9 kazamata jelenik meg a játékosnak
    const playerDungeons = window.allDungeons.slice(0, 9);

    playerDungeons.forEach(dungeon => {
        const card = document.createElement('div');
        card.className = 'dungeon-card';
        
        // Hozzáadunk egy állapotjelzőt a kazamata kártyához
        const statusInfo = dungeon.cardCount > 0 ? 
            `<p style="color: #28a745; margin-top: 10px;">✅ ${dungeon.cardCount} kártya beállítva</p>` : 
            '<p style="color: #dc3545; margin-top: 10px;">❌ Nincs beállítva</p>';

        card.innerHTML = `
            <h3>${dungeon.name}</h3>
            <div class="dungeon-tags">
                <span class="tag">${dungeon.type}</span>
                <span class="tag variant">${dungeon.variant}</span>
            </div>
            ${statusInfo}
            <button class="btn" onclick="enterDungeon(${dungeon.id})">Belépés</button>
        `;
        grid.appendChild(card);
    });
}

function enterDungeon(dungeonId) {
    currentDungeon = window.allDungeons.find(d => d.id === dungeonId);
    
    // Ellenőrizzük, hogy a kazamatában vannak-e kártyák
    if (currentDungeon.cardCount === 0) {
        alert('❌ Ez a kazamata még nincs beállítva!\n\nA játékmesternek először be kell állítania a kártyákat ehhez a kazamatához.');
        return;
    }
    
    selectedCards = [];
    document.getElementById('playerDeckTitle').textContent = currentDungeon.name;
    
    renderPlayerCards();
    showScreen('playerDeckScreen');
}

function renderPlayerCards() {
    const grid = document.getElementById('playerCardsGrid');
    grid.innerHTML = '';

    availableCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-item';
        cardEl.setAttribute('data-card-id', card.id);
        
        // Emoji kiválasztása a kártya típusa alapján
        let emoji = '⚔️'; // alapértelmezett
        if (card.name.includes('Varázsló')) emoji = '🔮';
        if (card.name.includes('Íjász')) emoji = '🏹';
        if (card.name.includes('Lovag')) emoji = '🛡️';
        if (card.name.includes('Óriás')) emoji = '👹';
        if (card.name.includes('Sárkány')) emoji = '🐉';
        if (card.name.includes('Pap')) emoji = '🙏';
        if (card.name.includes('Orgyilkos')) emoji = '🗡️';
        
        cardEl.innerHTML = `
            <div class="card-image">${emoji}</div>
            <h4>${card.name}</h4>
            <div class="card-stats">
                <div class="stat">
                    <div class="stat-label">⚔️ Támadás</div>
                    <div class="stat-value">${card.attack}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">🛡️ Védelem</div>
                    <div class="stat-value">${card.defense}</div>
                </div>
            </div>
            <div class="card-type">${card.type === 'spell' ? 'Varázslat' : 'Egység'}</div>
        `;
        
        cardEl.onclick = () => togglePlayerCard(card.id);
        grid.appendChild(cardEl);
    });

    updatePlayerCardCount();
}

function togglePlayerCard(cardId) {
    const cardEl = document.querySelector(`#playerCardsGrid .card-item[data-card-id="${cardId}"]`);
    
    if (selectedCards.includes(cardId)) {
        selectedCards = selectedCards.filter(id => id !== cardId);
        cardEl.classList.remove('selected');
    } else {
        selectedCards.push(cardId);
        cardEl.classList.add('selected');
    }

    updatePlayerCardCount();
}

function updatePlayerCardCount() {
    document.getElementById('playerCardCount').textContent = selectedCards.length;
}

function backToPlayerDungeons() {
    selectedCards = [];
    showScreen('playerDungeonsScreen');
}

function startBattle() {
    if (selectedCards.length === 0) {
        alert('Válassz ki legalább egy kártyát a harchoz!');
        return;
    }

    // Összegyűjtjük a játékos kártyáinak teljes adatait
    const allCards = [...availableCards, ...customCards];
    const playerCardsData = selectedCards.map(cardId => allCards.find(card => card.id === cardId));

    // Elmentjük a localStorage-ba
    localStorage.setItem('playerBattleCards', JSON.stringify(playerCardsData));
    localStorage.setItem('currentDungeon', JSON.stringify(currentDungeon));

    // Átirányítjuk a battle.html-re
    window.location.href = 'battle.html';
}

function renderGMDungeons() {
    const grid = document.getElementById('gmDungeonsGrid');
    grid.innerHTML = '';

    window.allDungeons.forEach(dungeon => {
        const card = document.createElement('div');
        card.className = 'dungeon-card';
        
        const cardCountInfo = dungeon.cardCount > 0 ? 
            `<p style="color: #667eea; margin-top: 10px;">📦 ${dungeon.cardCount} kártya beállítva</p>` : 
            '<p style="color: #999; margin-top: 10px;">Még nincs beállítva</p>';

        card.innerHTML = `
            <h3>${dungeon.name}</h3>
            <div class="dungeon-tags">
                <span class="tag">${dungeon.type}</span>
                <span class="tag variant">${dungeon.variant}</span>
            </div>
            ${cardCountInfo}
            <button class="btn" onclick="editDungeon(${dungeon.id})">Szerkesztés</button>
        `;
        grid.appendChild(card);
    });
}

function editDungeon(dungeonId) {
    currentDungeon = window.allDungeons.find(d => d.id === dungeonId);
    selectedCards = [];
    leaderCard = null;
    
    document.getElementById('gmDeckTitle').textContent = currentDungeon.name + ' - Szerkesztés';
    
    renderGMCards();
    showScreen('gmDeckScreen');
}

function renderGMCards() {
    const grid = document.getElementById('gmCardsGrid');
    grid.innerHTML = '';

    const allCards = [...availableCards, ...customCards];

    allCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-item';
        cardEl.id = `gm-card-${card.id}`;
        
        const isSelected = selectedCards.includes(card.id);
        const isLeader = leaderCard === card.id;
        
        if (isSelected) cardEl.classList.add('selected');

        // Emoji kiválasztása a kártya típusa alapján
        let emoji = '⚔️'; // alapértelmezett
        if (card.name.includes('Varázsló')) emoji = '🔮';
        if (card.name.includes('Íjász')) emoji = '🏹';
        if (card.name.includes('Lovag')) emoji = '🛡️';
        if (card.name.includes('Óriás')) emoji = '👹';
        if (card.name.includes('Sárkány')) emoji = '🐉';
        if (card.name.includes('Pap')) emoji = '🙏';
        if (card.name.includes('Orgyilkos')) emoji = '🗡️';
        if (card.isCustom) {
            // Egyedi kártyákhoz speciális emojik
            if (card.name.includes('Tűz') || card.name.includes('Démon')) emoji = '🔥';
            if (card.name.includes('Jég') || card.name.includes('Fagy')) emoji = '❄️';
            if (card.name.includes('Villám')) emoji = '⚡';
            if (card.name.includes('Szellem')) emoji = '👻';
        }
        
        cardEl.innerHTML = `
            ${isLeader ? '<div class="leader-badge">👑 Vezér</div>' : ''}
            ${card.isCustom ? `<button class="delete-card-btn" onclick="deleteCustomCard(event, ${card.id})">×</button>` : ''}
            <div class="card-image">${emoji}</div>
            <h4>${card.name}</h4>
            <div class="card-stats">
                <div class="stat">
                    <div class="stat-label">⚔️ Támadás</div>
                    <div class="stat-value">${card.attack}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">🛡️ Védelem</div>
                    <div class="stat-value">${card.defense}</div>
                </div>
            </div>
            <div class="card-type">${card.type === 'spell' ? 'Varázslat' : 'Egység'}</div>
            <div class="leader-checkbox">
                <input type="checkbox" id="leader-${card.id}" 
                    ${isLeader ? 'checked' : ''}>
                <label for="leader-${card.id}">Vezér</label>
            </div>
        `;
        
        cardEl.onclick = (e) => {
            if (!e.target.matches('input, label, button')) {
                toggleGMCard(card.id);
            }
        };

        const checkbox = cardEl.querySelector(`#leader-${card.id}`);
        checkbox.onclick = (e) => {
            e.stopPropagation();
            setLeader(card.id, checkbox.checked);
        };

        grid.appendChild(cardEl);
    });

    updateGMCardCount();
}

function toggleGMCard(cardId) {
    const cardEl = document.getElementById(`gm-card-${cardId}`);
    
    if (selectedCards.includes(cardId)) {
        selectedCards = selectedCards.filter(id => id !== cardId);
        cardEl.classList.remove('selected');
        
        if (leaderCard === cardId) {
            leaderCard = null;
            const checkbox = document.getElementById(`leader-${cardId}`);
            if (checkbox) checkbox.checked = false;
        }
    } else {
        selectedCards.push(cardId);
        cardEl.classList.add('selected');
    }

    updateGMCardCount();
}

function setLeader(cardId, isChecked) {
    if (isChecked) {
        if (leaderCard && leaderCard !== cardId) {
            const oldCheckbox = document.getElementById(`leader-${leaderCard}`);
            if (oldCheckbox) oldCheckbox.checked = false;
        }
        
        leaderCard = cardId;
        
        if (!selectedCards.includes(cardId)) {
            toggleGMCard(cardId);
        }
        
        renderGMCards();
    } else {
        if (leaderCard === cardId) {
            leaderCard = null;
            renderGMCards();
        }
    }
}

function updateGMCardCount() {
    document.getElementById('gmCardCount').textContent = selectedCards.length;
}

function backToGMDungeons() {
    selectedCards = [];
    leaderCard = null;
    renderGMDungeons();
    showScreen('gamemasterDungeonsScreen');
}

function saveDungeon() {
    if (selectedCards.length === 0) {
        alert('Válassz ki legalább egy kártyát!');
        return;
    }

    if (!leaderCard) {
        alert('Jelölj meg egy kártyát vezérként!');
        return;
    }

    const allCards = [...availableCards, ...customCards];
    const enemyCardsData = selectedCards.map(cardId => allCards.find(card => card.id === cardId));
    const leaderCardData = allCards.find(c => c.id === leaderCard);

    currentDungeon.cardCount = selectedCards.length;

    // Elmentjük az ellenfél kártyáit a localStorage-ba
    localStorage.setItem('enemyBattleCards', JSON.stringify(enemyCardsData));
    localStorage.setItem('enemyLeaderCard', JSON.stringify(leaderCardData));

    // Elmentjük a kazamaták tömbjét is
    saveDungeonsToLocalStorage();

    console.log('=== SAVE DUNGEON ===');
    console.log('Dungeon:', currentDungeon);
    console.log('Selected cards:', selectedCards);
    console.log('Cards details:', enemyCardsData);
    console.log('Leader card:', leaderCardData);

    alert(`✅ Kazamata "${currentDungeon.name}" sikeresen mentve!\n\n` +
          `📦 Kártyák száma: ${selectedCards.length}\n` +
          `👑 Vezér: ${leaderCardData.name}\n\n` +
          `A kazamata mostantól elérhető a játékosok számára!`);
    
    backToGMDungeons();
}

function showCreateDungeonModal() {
    document.getElementById('createDungeonModal').classList.add('active');
}

function closeCreateDungeonModal() {
    document.getElementById('createDungeonModal').classList.remove('active');
    document.getElementById('newDungeonName').value = '';
    document.getElementById('newDungeonType').value = '';
    document.getElementById('newDungeonVariant').value = '';
}

function createDungeon() {
    const name = document.getElementById('newDungeonName').value.trim();
    const type = document.getElementById('newDungeonType').value;
    const variant = document.getElementById('newDungeonVariant').value;

    if (!name) {
        alert('Add meg a kazamata nevét!');
        return;
    }
    if (!type) {
        alert('Válassz típust!');
        return;
    }
    if (!variant) {
        alert('Válassz változatot!');
        return;
    }

    const newDungeon = {
        id: nextDungeonId++,
        name: name,
        type: type,
        variant: variant,
        cardCount: 0
    };

    window.allDungeons.push(newDungeon);
    saveDungeonsToLocalStorage(); // Új kazamata hozzáadása után mentés

    console.log('=== CREATE DUNGEON ===');
    console.log('New dungeon:', newDungeon);

    alert(`✅ Kazamata "${name}" létrehozva!`);
    closeCreateDungeonModal();
    renderGMDungeons();
}

function showCreateCardModal() {
    if (!currentDungeon) {
        alert('Hiba: Nincs kazamata kiválasztva!');
        return;
    }
    document.getElementById('createCardModal').classList.add('active');
}

function closeCreateCardModal() {
    document.getElementById('createCardModal').classList.remove('active');
    document.getElementById('newCardName').value = '';
    document.getElementById('newCardType').value = 'unit';
    document.getElementById('newCardAttack').value = 5;
    document.getElementById('newCardDefense').value = 3;
    document.getElementById('attackGroup').style.display = 'block';
    document.getElementById('defenseGroup').style.display = 'block';
}

function toggleCardStats() {
    const cardType = document.getElementById('newCardType').value;
    const attackGroup = document.getElementById('attackGroup');
    const defenseGroup = document.getElementById('defenseGroup');
    
    if (cardType === 'spell') {
        attackGroup.style.display = 'none';
        defenseGroup.style.display = 'none';
        document.getElementById('newCardAttack').value = 0;
        document.getElementById('newCardDefense').value = 0;
    } else {
        attackGroup.style.display = 'block';
        defenseGroup.style.display = 'block';
        document.getElementById('newCardAttack').value = 5;
        document.getElementById('newCardDefense').value = 3;
    }
}

function createCard() {
    const name = document.getElementById('newCardName').value.trim();
    const type = document.getElementById('newCardType').value;
    const attack = parseInt(document.getElementById('newCardAttack').value) || 0;
    const defense = parseInt(document.getElementById('newCardDefense').value) || 0;

    if (!name) {
        alert('Add meg a kártya nevét!');
        return;
    }

    const newCard = {
        id: nextCardId++,
        name: name,
        type: type,
        attack: attack,
        defense: defense,
        isCustom: true
    };

    customCards.push(newCard);

    console.log('=== CREATE CARD ===');
    console.log('New card:', newCard);
    console.log('For dungeon:', currentDungeon);

    alert(`✅ Kártya "${name}" létrehozva!`);
    closeCreateCardModal();
    renderGMCards();
}

function deleteCustomCard(event, cardId) {
    event.stopPropagation();
    
    if (!confirm('Biztosan törölni szeretnéd ezt a kártyát?')) {
        return;
    }

    selectedCards = selectedCards.filter(id => id !== cardId);
    if (leaderCard === cardId) {
        leaderCard = null;
    }

    customCards = customCards.filter(card => card.id !== cardId);

    console.log('=== DELETE CARD ===');
    console.log('Deleted card ID:', cardId);

    renderGMCards();
}

window.onclick = function(event) {
    const dungeonModal = document.getElementById('createDungeonModal');
    const cardModal = document.getElementById('createCardModal');
    
    if (event.target === dungeonModal) {
        closeCreateDungeonModal();
    }
    if (event.target === cardModal) {
        closeCreateCardModal();
    }
}

function goToPlayerLogin() {
    window.location.href = 'player_login.html';
}

function goToGamemasterLogin() {
    window.location.href = 'gamemaster_login.html';
}

function playerLogin() {
    const username = document.getElementById('playerUsername').value.trim();
    const password = document.getElementById('playerPassword').value;
    if (!username || !password) {
        alert('Töltsd ki az összes mezőt!');
        return;
    }
    console.log('Player login:', username);
    window.location.href = 'player_dungeons.html';
}

function gamemasterLogin() {
    const username = document.getElementById('gmUsername').value.trim();
    const password = document.getElementById('gmPassword').value;
    if (!username || !password) {
        alert('Töltsd ki az összes mezőt!');
        return;
    }
    console.log('Gamemaster login:', username);
    window.location.href = 'gamemaster_dungeons.html';
}

function endBattle() {
    window.location.href = 'player_dungeons.html';
}

// Battle simulation functions
function loadBattleCards() {
    const enemyCards = JSON.parse(localStorage.getItem('enemyBattleCards')) || [];
    const playerCards = JSON.parse(localStorage.getItem('playerBattleCards')) || [];
    const enemyLeader = JSON.parse(localStorage.getItem('enemyLeaderCard')) || null;
    const currentDungeon = JSON.parse(localStorage.getItem('currentDungeon')) || {};

    // Ha nincsenek kártyák, visszatérünk
    if (enemyCards.length === 0 || playerCards.length === 0) {
        console.warn('Nincsenek kártyák a harchoz');
        return { enemyCards: [], playerCards: [] };
    }

    // Hozzáadjuk a vezérkártyát az ellenfél kártyáihoz, ha van
    if (enemyLeader) {
        enemyCards.push(enemyLeader);
    }

    return { enemyCards, playerCards, currentDungeon };
}

function simulateBattle() {
    const { enemyCards, playerCards, currentDungeon } = loadBattleCards();

    // Ha nincsenek kártyák, alapértelmezett értékeket használunk
    const finalEnemyCards = enemyCards.length > 0 ? enemyCards : [
        { name: "Sötét Varázsló", attack: 8, defense: 3, type: "unit" },
        { name: "Éjjeli Árnyék", attack: 6, defense: 2, type: "unit" }
    ];

    const finalPlayerCards = playerCards.length > 0 ? playerCards : [
        { name: "Harcos", attack: 5, defense: 4, type: "unit" },
        { name: "Íjász", attack: 4, defense: 2, type: "unit" }
    ];

    displayCards(finalEnemyCards, 'enemyCards');
    displayCards(finalPlayerCards, 'playerCards');
    simulateBattleRounds(finalEnemyCards, finalPlayerCards, currentDungeon);
}

function displayCards(cards, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `battle-card ${card.type}`;
        
        // Emoji kiválasztása
        let emoji = '⚔️';
        if (card.name.includes('Varázsló')) emoji = '🔮';
        if (card.name.includes('Íjász')) emoji = '🏹';
        if (card.name.includes('Lovag')) emoji = '🛡️';
        if (card.name.includes('Óriás')) emoji = '👹';
        if (card.name.includes('Sárkány')) emoji = '🐉';
        if (card.name.includes('Pap')) emoji = '🙏';
        if (card.name.includes('Orgyilkos')) emoji = '🗡️';
        if (card.name.includes('Tűz') || card.name.includes('Démon')) emoji = '🔥';
        if (card.name.includes('Jég') || card.name.includes('Fagy')) emoji = '❄️';
        if (card.name.includes('Villám')) emoji = '⚡';
        if (card.name.includes('Szellem')) emoji = '👻';
        
        cardElement.innerHTML = `
            <div class="card-image">${emoji}</div>
            <h4>${card.name}</h4>
            <div class="card-stats">
                <div class="stat">
                    <div class="stat-label">⚔️ Támadás</div>
                    <div class="stat-value">${card.attack}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">🛡️ Védelem</div>
                    <div class="stat-value">${card.defense}</div>
                </div>
            </div>
            <div class="card-type">${card.type === 'spell' ? 'Varázslat' : 'Egység'}</div>
        `;
        
        container.appendChild(cardElement);
    });
}

function simulateBattleRounds(enemyCards, playerCards, currentDungeon) {
    const battleLog = document.getElementById('battleLog');
    battleLog.innerHTML = '<h3>Harc napló:</h3>';
    
    let playerWins = 0;
    let enemyWins = 0;
    
    for (let i = 0; i < Math.min(enemyCards.length, playerCards.length); i++) {
        const enemyCard = enemyCards[i];
        const playerCard = playerCards[i];
        
        const roundResult = calculateRoundResult(playerCard, enemyCard);
        
        if (roundResult.playerWins) {
            playerWins++;
        } else {
            enemyWins++;
        }
        
        const roundElement = document.createElement('div');
        roundElement.className = 'battle-round';
        roundElement.innerHTML = `
            <strong>${i + 1}. kör:</strong> ${playerCard.name} vs ${enemyCard.name} - 
            <span class="${roundResult.playerWins ? 'victory' : 'defeat'}">
                ${roundResult.playerWins ? 'Győzelem' : 'Vereség'}
            </span>
            ${roundResult.details ? ` (${roundResult.details})` : ''}
        `;
        
        battleLog.appendChild(roundElement);
    }
    
    // Összesített eredmény
    const totalRounds = Math.min(enemyCards.length, playerCards.length);
    const resultElement = document.createElement('div');
    resultElement.className = 'battle-result';
    
    if (playerWins >= enemyWins) {
        resultElement.innerHTML = `
            <h3 class="victory">🎉 Győzelem!</h3>
            <p>${playerWins}/${totalRounds} kört nyertél meg!</p>
            ${currentDungeon.name ? `<p>Kazamata: ${currentDungeon.name}</p>` : ''}
        `;
    } else {
        resultElement.innerHTML = `
            <h3 class="defeat">💀 Vereség</h3>
            <p>Csak ${playerWins}/${totalRounds} kört nyertél meg.</p>
            ${currentDungeon.name ? `<p>Kazamata: ${currentDungeon.name}</p>` : ''}
        `;
    }
    
    battleLog.appendChild(resultElement);
}

function calculateRoundResult(playerCard, enemyCard) {
    if (playerCard.type === 'spell' && enemyCard.type === 'spell') {
        return { playerWins: false, details: "Varázslat semlegesítve" };
    }
    
    if (playerCard.attack > enemyCard.defense) {
        return { playerWins: true, details: `${playerCard.attack} > ${enemyCard.defense}` };
    } else if (playerCard.attack < enemyCard.defense) {
        return { playerWins: false, details: `${playerCard.attack} < ${enemyCard.defense}` };
    } else {
        return { playerWins: false, details: "Egyenlő erő" };
    }
}

window.onload = () => {
    loadDungeonsFromLocalStorage(); // Betöltjük a mentett kazamatákat

    const path = window.location.pathname;
    if (path.includes('player_dungeons.html')) renderPlayerDungeons();
    if (path.includes('gamemaster_dungeons.html')) renderGMDungeons();
    
    // Battle oldal betöltésekor automatikusan indítsuk a harcot
    if (path.includes('battle.html') && typeof simulateBattle === 'function') {
        simulateBattle();
    }
};