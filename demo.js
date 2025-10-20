// Minimal RPG demo for testing a static site
(() => {
  // Game state
  const state = {
    player: { hp: 20, maxHp: 20, xp: 0, gold: 0 },
    location: 'Town',
    inventory: [],
    inBattle: false,
    enemy: null,
  };

  // Map & encounters
  const map = {
    Town: { desc: 'A peaceful town. You can rest or go to the fields.', exits: ['Fields'] },
    Fields: { desc: 'Windy fields where low-level monsters appear.', exits: ['Town', 'Forest'], encounterRate: 0.4, monsters: ['Slime', 'Wolf'] },
    Forest: { desc: 'A dark forest with tougher foes.', exits: ['Fields'], encounterRate: 0.6, monsters: ['Goblin', 'Bandit'] },
  };

  // DOM refs
  const $text = document.getElementById('text');
  const $choices = document.getElementById('choices');
  const $log = document.getElementById('log');
  const $hp = document.getElementById('hp');
  const $xp = document.getElementById('xp');
  const $gold = document.getElementById('gold');
  const $loc = document.getElementById('loc');

  function log(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    $log.prepend(el);
  }

  function renderStats() {
    $hp.textContent = `${state.player.hp}/${state.player.maxHp}`;
    $xp.textContent = state.player.xp;
    $gold.textContent = state.player.gold;
    $loc.textContent = state.location;
  }

  function clearChoices() {
    $choices.innerHTML = '';
  }

  function button(text, onClick) {
    const b = document.createElement('button');
    b.textContent = text;
    b.addEventListener('click', onClick);
    $choices.appendChild(b);
    return b;
  }

  function start() {
    renderLocation();
    renderStats();
    log('Game started. Good luck!');
  }

  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function renderLocation() {
    const loc = map[state.location];
    $text.textContent = loc.desc;
    clearChoices();
    // Movement
    loc.exits.forEach(exit => {
      button('Go to ' + exit, () => moveTo(exit));
    });
    // Rest in town
    if (state.location === 'Town') {
      button('Rest (restore HP)', () => {
        state.player.hp = state.player.maxHp;
        renderStats();
        log('You rest at the inn and recover your strength.');
      });
    }
    // Look for trouble
    button('Look around', () => {
      if (Math.random() < (loc.encounterRate || 0)) {
        const enemyName = randomChoice(loc.monsters || []);
        startBattle(createEnemy(enemyName));
      } else {
        $text.textContent = 'You look around but nothing happens.';
        log('No encounters this time.');
      }
    });
  }

  function moveTo(destination) {
    state.location = destination;
    renderLocation();
    renderStats();
    log('You travel to ' + destination + '.');
    // chance for a surprise encounter while moving
    const loc = map[state.location];
    if (Math.random() < (loc.encounterRate || 0) * 0.3) {
      const enemyName = randomChoice(loc.monsters || []);
      startBattle(createEnemy(enemyName));
    }
  }

  function createEnemy(name) {
    const stats = {
      Slime: { hp: 6, atk: 2, xp: 3, gold: 2 },
      Wolf: { hp: 8, atk: 3, xp: 5, gold: 4 },
      Goblin: { hp: 12, atk: 4, xp: 10, gold: 8 },
      Bandit: { hp: 16, atk: 5, xp: 14, gold: 12 },
    };
    const s = stats[name] || { hp: 5, atk: 1, xp: 1, gold: 1 };
    return { name, hp: s.hp, atk: s.atk, xp: s.xp, gold: s.gold };
  }

  function startBattle(enemy) {
    state.inBattle = true;
    state.enemy = enemy;
    $text.textContent = `A wild ${enemy.name} appears!`;
    clearChoices();
    renderBattleOptions();
    log(`Encounter: ${enemy.name} (HP ${enemy.hp})`);
  }

  function endBattle(victory) {
    if (victory) {
      log(`You defeated the ${state.enemy.name}! Gained ${state.enemy.xp} XP and ${state.enemy.gold} gold.`);
      state.player.xp += state.enemy.xp;
      state.player.gold += state.enemy.gold;
      // small heal on victory
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 2);
    } else {
      log('You were defeated... You wake back in town.');
      // penalties
      state.player.hp = Math.max(1, Math.floor(state.player.maxHp / 2));
      state.player.gold = Math.max(0, Math.floor(state.player.gold / 2));
      state.location = 'Town';
    }
    state.inBattle = false;
    state.enemy = null;
    renderStats();
    renderLocation();
  }

  function renderBattleOptions() {
    const enemy = state.enemy;
    $text.textContent = `Battle: ${enemy.name} (HP ${enemy.hp})`;
    clearChoices();
    button('Attack', () => {
      // player attack
      const dmg = Math.max(1, Math.floor(Math.random() * 6));
      enemy.hp -= dmg;
      log(`You hit the ${enemy.name} for ${dmg} damage.`);
      if (enemy.hp <= 0) {
        endBattle(true);
        return;
      }
      // enemy turn
      enemyAttack();
      renderBattleOptions();
    });
    button('Use Potion', () => {
      const idx = state.inventory.indexOf('Potion');
      if (idx >= 0) {
        state.inventory.splice(idx, 1);
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + 8);
        log('You drink a potion and heal 8 HP.');
        enemyAttack();
        renderBattleOptions();
        renderStats();
      } else {
        log('No potions in inventory.');
      }
    });
    button('Run', () => {
      if (Math.random() < 0.5) {
        log('You escaped successfully.');
        state.inBattle = false;
        state.enemy = null;
        renderLocation();
      } else {
        log('Failed to escape!');
        enemyAttack();
        renderBattleOptions();
      }
    });
  }

  function enemyAttack() {
    const enemy = state.enemy;
    const dmg = Math.max(0, enemy.atk + Math.floor(Math.random() * 3) - 1);
    state.player.hp -= dmg;
    log(`The ${enemy.name} hits you for ${dmg} damage.`);
    renderStats();
    if (state.player.hp <= 0) {
      endBattle(false);
    }
  }

  // Add a tiny shop drop chance on victory
  function maybeDropItem() {
    if (Math.random() < 0.15) {
      state.inventory.push('Potion');
      log('You found a Potion on the enemy!');
    }
  }

  // Hook into endBattle to drop items when victorious
  const originalEndBattle = endBattle;
  endBattle = function(victory) {
    if (victory) maybeDropItem();
    originalEndBattle(victory);
  };

  // initialize
  start();
  renderStats();
})();
