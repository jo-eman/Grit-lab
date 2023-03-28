// initializing everything when the window is loaded
// create main container for the game layout

import { TopBar } from "./topbar.js";
import levelData from "../levels.json" assert { type: "json" };
import { levelConstructor } from "./levels.js";
import { createPlayer } from "./player.js";
import { levelCreator } from "./levelCreator.js"
import { sounds } from "./sounds.js"

export let objectRatio = window.innerHeight / 12;
export let allElems = {
  character: undefined,
  gravity: new Array,
  obstacle: new Array,
  monster: new Array,
  collectible: new Array
}
let keysPressed = {}
const worldGravity = 50
const frameRate = 60;

let gameData = { time: 0, timeStart: 0 };
let gameEnd = "";
let gameRunning = false;
//let sounds = {};
let bgMusic = new Audio("sounds/bgMusic.mp3");
let soundOn = false;
let topBar = undefined
let garbageCollector = {
  gravity: new Array,
  obstacle: new Array,
  monster: new Array,
  collectible: new Array,
  bullet: new Array
}
let nextLevel;

const mainContainer = document.getElementById("mainContainer")
mainContainer.style.height = window.outerHeight + "px";
mainContainer.style.width = window.outerWidth + "px";
mainContainer.style.backgroundImage = `url("./images/bg.png")`;

export function gameSetup(level = "lv1", gameTime = 150) {
  objectRatio = window.innerHeight / 12;
  // Clear all elements
  mainContainer.innerHTML = "";

  allElems = {
    character: createPlayer(),
    gravity: new Array,
    obstacle: new Array,
    monster: new Array,
    collectible: new Array,
    bullet: new Array
  }
  unsetGameEnd();
  allElems["gravity"].push(allElems["character"]);
  if (topBar?.characterStrength > 1) {
    allElems["character"].changeStrength(topBar.characterStrength - 1)
  }
  // scroll screen to 0,0 on page refresh or restart or at next level
  window.scroll(0, 0);
  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };

  // create level scene
  levelConstructor(levelData[level], objectRatio);
  if (!topBar) topBar = new TopBar();
  topBar.setLevel(level)

  let screenWidth = levelData[level]["levelWidth"] * objectRatio;
  let screenHeight = window.innerHeight;

  mainContainer.style.height = screenHeight + "px";
  mainContainer.style.width = screenWidth + "px";
  mainContainer.style.backgroundImage = `url("./images/bg.png")`;

  document.addEventListener("keydown", function (e) {
    if (e.key.charCodeAt(0) == "65" || e.key.charCodeAt(0) == "32") { // prevent default action for space and a to avoid unintentional scrolling
      e.preventDefault();
      return false;
    }

    keysPressed[e.key] = true;
  });
  document.addEventListener("keyup", (e) => {
    delete keysPressed[e.key];
  });

  disableScroll();

  gameData["time"] = gameTime;
  gameData["timeStart"] = 0;

}

export const init = () => {
  // Add eventlistners for pause menu
  document.getElementById("resume").addEventListener('click', () => {
    pause = false
    window.requestAnimationFrame(update)
    document.getElementById("overlay").style.display = "none";
  });
  document.getElementById("restart").addEventListener('click', () => {
    pause = false
    topBar = new TopBar();
    document.getElementById("overlay").style.display = "none";
    gameSetup();
    window.requestAnimationFrame(update)
  });
  document.getElementById("pauseToMainMenu").addEventListener('click', () => {
    pause = false
    topBar = new TopBar();
    mainContainer.innerHTML = ""
    document.getElementById("leaderboard").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("startMenu").style.display = "";
  });
  document.getElementById("toggleSound").checked = soundOn;
  document.getElementById("toggleSound").addEventListener('change', () => {
    soundOn = document.getElementById("toggleSound").checked;
    if(soundOn) {
      bgMusic.play()
      bgMusic.loop = true  
    } else {
      bgMusic.pause()
    }
  });
  document.getElementById("startGame").addEventListener('click', () => {
    gameSetup()
    topBar = new TopBar();
    window.requestAnimationFrame(update);
    document.getElementById("startMenu").style.display = "none";
  })
  document.getElementById("levelCreator").addEventListener('click', () => {
    console.log('load levelCreator()')
    gameSetup("empty", 99999)
    allElems["character"].invincible = 100000;
    levelCreator()
    window.requestAnimationFrame(update);
    document.getElementById("startMenu").style.display = "none";
  })
  document.getElementById("MMScoreBoard").addEventListener('click', () => {
    console.log("Call leaderboard");
    document.getElementById("startMenu").style.display = "none";
    loadLeaderboard()
  })
  document.getElementById("tryAgain").addEventListener('click', () => {
    topBar = undefined
    const gameEndOverlay = document.getElementById("gameEnd");
    gameEndOverlay.style.display = "none";
    pause = false
    mainContainer.innerHTML = ""
    document.getElementById("overlay").style.display = "none";
    document.getElementById("startMenu").style.display = "";
  })
  document.getElementById("saveRecord").addEventListener('click', function() {
    const playerName = document.getElementById("playerName").value
    const score = topBar.points
    const timer = topBar.realTimer / 60
    console.log(`player name: ${playerName}, score: ${score}, time: ${timer}`)
    addPlay(playerName, score, timer)
  })

    
  document.getElementById("backToMenu").addEventListener('click', () => {
    topBar = undefined
    const leaderboardOverlay = document.getElementById("leaderboard");
    leaderboardOverlay.style.display = "none";
    pause = false
    mainContainer.innerHTML = ""
    document.getElementById("startMenu").style.display = "";
  })
  
  // Start background music
  bgMusic.volume = 0.3
  if(soundOn) {
    bgMusic.play()
    bgMusic.loop = true
  }
};

function addPlay(playerName, score, timer) {
  if(playerName != playerName.trim() || !playerName.trim() || playerName.length > 8) {
    alert("Name can not be empty nor longer than 8 characters");
    return false;
  }

  const play = {
    Name: playerName,
    Score: score,
    Time: timer
  };
  fetch("http://127.0.0.1:8080/addPlay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(play),
  })
    .then((response) => {
      if (response.ok) loadLeaderboard()
    })
    .catch((error) => console.error(error));

    document.getElementById("playerName").value = ""
} 

function loadLeaderboard() {
  const PAGE_SIZE = 5;
  let currentPage = 1;
  let data = [];

  fetch("http://127.0.0.1:8080/plays", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((responseData) => {
      data = responseData;
      if(data) {
        renderTable(data.slice(0, PAGE_SIZE));
        renderPagination(data);
      } else {
        data = [];
        renderTable(data);
      }
    });

  function renderPagination(data) {
    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const pagination = document.querySelector("#pagination");
    pagination.innerHTML = "";

    // Previous button
    if (currentPage > 5) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "<<";
      prevButton.classList.add("page-link");
      prevButton.addEventListener("click", () => {
        if (currentPage - 5 <= totalPages) {
          currentPage -= 5;
        } 
        renderTable(data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));
        renderPagination(data);
      });
      pagination.appendChild(prevButton);
    }

    for (let i = Math.max(1, currentPage - 2); i <= Math.min(currentPage + 2, totalPages); i++) {
      const pageLink = document.createElement("a");
      pageLink.textContent = i;

      pageLink.classList.add("page-link");
      if (i === currentPage) {
        pageLink.classList.add("active");
      }
      pageLink.addEventListener("click", () => {
        currentPage = i;
        renderTable(data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));
        renderPagination(data);
      });
      pagination.appendChild(pageLink);
    }

    // Next button
    if (currentPage < totalPages-5) {
      const nextButton = document.createElement("button");
      // add class to button
      nextButton.classList.add("page-link");
      nextButton.textContent = ">>";
      nextButton.addEventListener("click", () => {
        if (currentPage+5 < totalPages)
        currentPage = currentPage + 5;
        renderTable(data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));
        renderPagination(data);
      });
      pagination.appendChild(nextButton);
    }
  }

  function renderTable(data) {
    document.getElementById("gameEnd").style.display = "none";
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.style.display = "";
    const highscoreTable = document.getElementById("table-body");
    highscoreTable.innerHTML = "";
    data.forEach((record) => {
      console.log(record);
      const { Name, Rank, Score, Time } = record;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${Rank}</td>
        <td>${Name}</td>
        <td>${Score}</td>
        <td>${Number.parseInt(Time / 60)
          .toString()
          .padStart(2, "0")}:${Number.parseInt(Time % 60)
          .toString()
          .padStart(2, "0")}</td>
      `;
      highscoreTable.append(row);
    });
  }
}

const GameManager = function () {
  this.gameContainer = document.getElementById("mainContainer")
  this.gravity = worldGravity / frameRate
  this.run = undefined
  this.applyMovement = function (obj) {
    if ("activated" in obj) {
      if (!obj["activated"]) {
        // Check if this object needs to be activated
        if (window.scrollX + window.innerWidth < obj.elem.offsetLeft) {
          return
        }
        obj.activated = true;
      }
    }
    // handle friction to stop character moving automatically
    if (obj.xSpeed && obj.friction) obj.xForce(-obj.xSpeed / 6);

    // apply gravity
    obj.yForce(this.gravity);

    // move character every frame
    obj.yDisplace();

    if (obj.stayInScreen) {
      // Check that object is not about to exit screen
      if (obj.xSpeed + obj.elem.offsetLeft <= window.scrollX) {
        obj.xSpeed = 0;
        obj.elem.style.left = window.scrollX + "px";
      } else if (
        obj.xSpeed + obj.elem.offsetLeft + objectRatio >=
        document.getElementById("mainContainer").offsetWidth
      ) {
        obj.xSpeed = 0;
        obj.elem.style.left =
          document.getElementById("mainContainer").offsetWidth -
          objectRatio +
          "px";
      } else if (
        obj.elem.style.top.replace("px", "") >
        document.getElementById("mainContainer").offsetHeight
      ) {
        gameEnd = "die";
      }
    }
    obj.xDisplace();
  };

  this.checkCollectibleCollision = function (collectible, index) {
    const character = allElems["character"];
    const collisionAngle = character.collision(collectible);
    if (!collisionAngle) return;
    const collectibleType = collectible.content;
    switch (collectibleType) {
      case "mushroom":
        character.changeStrength(1);
        sounds.playEffect("powerUp")
        break;
      case "star":
        character.invincible = frameRate * 10;
        break;
      case "coin":
        topBar.addCoins();
        topBar.setPoints(100);
        playEffect("collect");
        break;
    }
    collectible.elem.classList.add("hidden");
    garbageCollector["collectible"].push(index);
  };
  this.checkMonsterCollision = function (monster, index) {
    const character = allElems["character"];
    const collisionAngle = character.collision(monster);
    if (!collisionAngle) return;
    switch (collisionAngle) {
      case "top":
        if (character.ySpeed < 0) return;
        character.ySpeed = 0;
        character.yForce(-8);
        topBar.setPoints(monster.content)
        console.log(
          `kill monster, got points ${monster.content}. Player has now ${character.points} points`
        );
        monster.elem.classList.add("hidden");
        garbageCollector["monster"].push(index);
        break;
      default:
        if (!character.invincible) {
          character.changeStrength(-1);
          if (!character.strength) gameEnd = "die";
          else character.invincible = 3 * frameRate;
          console.log(`monster hit. strength remaining ${character.strength}`);
        }
    }
  };
  this.checkBulletCollision = function (bullet) {
    for (const [monsterIndex, monster] of Object.entries(allElems["monster"])) {
      if (bullet.collision(monster)) {
        topBar.setPoints(monster["content"]);
        monster.elem.classList.add("hidden");
        bullet.elem.classList.add("hidden");
        garbageCollector["monster"].push(monsterIndex);
      }
    }
  };
  this.checkObstacleCollision = function (character, index) {
    // check all obstacles collision every frame
    let inAir = true;
    for (const [obstacleIndex, obstacle] of Object.entries(allElems["obstacle"])) {
      const collisionAngle = character.collision(obstacle);
      if (!collisionAngle) continue;
      if (
        obstacle.content.toString().includes("lv") &&
        character.player
      ) {
        topBar.characterStrength = character.strength;
        topBar.setLevel(obstacle.content)
        nextLevel = obstacle.content;
        gameEnd = "lv"
        break;
      } else if (
        obstacle.content.toString().includes("endGame") &&
        character.player
      ) {
        gameEnd = "victory"
        break;
      }
      switch (collisionAngle) {
        case "bottom":
          if (character.elem.classList.contains("bullet")) break;
          character.ySpeed = 0;
          character.yForce(4);
          // handle destruction of obstacle
          obstacle.contentHandler(allElems, topBar);
          if (obstacle.destructible && character.strength > 1) {
            console.log(obstacleIndex, obstacle)
            obstacle.destroy();
            garbageCollector["obstacle"].push(obstacleIndex);
            sounds.playEffect("destroy")
          }
          break;
        case "top":
          // stop character at ySpeed and set it on top of the obstacle. reset jumping to false
          character.ySpeed = 0;
          if (character.elem.classList.contains("bullet")) {
            // character.ySpeed = 0
            character.yForce(character.bounce);
            break;
          }
          character.elem.style.top =
            Number.parseFloat(obstacle.elem.style.top) -
            objectRatio * character.size +
            "px";
          inAir = false;
          break;
        case "left":
          if (character.elem.classList.contains("bullet")) {
            garbageCollector["gravity"].push(index);
            character.elem.classList.add("hidden");
          }
          // stop play character and bounce character back a bit
          if (character.elem.classList.contains("character")) {
            character.xSpeed = 0;
            character.xForce(-character.acceleration);
          } else {
            // for moving objects other than player character
            character.xForce(-(character.xSpeed * 2));
          }
          break;
        case "right":
          if (character.elem.classList.contains("bullet")) {
            garbageCollector["gravity"].push(index);
            character.elem.classList.add("hidden");
          }
          // same as left
          if (character.elem.classList.contains("character")) {
            character.xSpeed = 0;
            character.xForce(character.acceleration);
          } else {
            character.xForce(-(character.xSpeed * 2));
          }
          break;
      }
    }
    if (!inAir) character.jumping = false;
  };
};

const gameManager = new GameManager(worldGravity, frameRate); // 9.8, frameRate

// let previousTimestamp = 0;
// let fpsInterval = 1000 / frameRate; // 60 FPS

let pauseTimer = 0;
function update(timestamp) { // timestamp is declared 
  if (!gameData["timeStart"]) {
    gameData["timeStart"] = timestamp;
  } else if (pause) {
    pauseTimer = timestamp
    return;
  } else if(pauseTimer) {
    gameData["timeStart"] += timestamp-pauseTimer;
    pauseTimer=0;
  }
  gameRunning = true;

  if (gameEnd) {
    if (gameEndHandler()) {
      //setLives(allElems["character"].lives.toString());

      window.requestAnimationFrame(update);
    }
    return;
  }
  // Limit the FPS to 60
  //if (timestamp - previousTimestamp <= fpsInterval) {
  // window.requestAnimationFrame(update);
  //   return;
  // }
  //previousTimestamp = timestamp;

  if (allElems["character"].invincible > 0) {
    allElems["character"].elem.classList.add("invincible");
  } else {
    allElems["character"].elem.classList.remove("invincible");
  }

  updateTime(timestamp);
  
  // handle invincible
  if (allElems["character"].invincible) allElems["character"].invincible--;
  if (keysPressed["a"]) {
    allElems["character"].facing = "left";
    allElems["character"].xForce(-allElems["character"].acceleration);
    //transform background to the right
    if (allElems["character"].elem.style.transform != "scaleX(-1)") {
      allElems["character"].elem.style.transform = "scaleX(-1)";
    }
  } else if (keysPressed["d"]) {
    allElems["character"].facing = "right";
    allElems["character"].xForce(allElems["character"].acceleration);
    if (allElems["character"].elem.style.transform != "scaleX(1)") {
      allElems["character"].elem.style.transform = "scaleX(1)";
    }
  }
  if (keysPressed["w"] && !allElems["character"].jumping) {
    allElems["character"].yForce(
      -Math.sqrt(((objectRatio * 4 * 2 * worldGravity) / frameRate) * 1.1)
    );
    playEffect("jump");
    allElems["character"].jumping = true;
  }
  if (
    keysPressed["e"] &&
    allElems["character"].strength >= 3 &&
    !allElems["character"].shootTimer
  ) {
    allElems["character"].shoot(10, 0, "orange", 0.2);
    allElems["character"].shootTimer = 30;
    playEffect("shoot")
  }
  if (allElems["character"].shootTimer) allElems["character"].shootTimer--;
  // apply movement per frame
  for (let i = 0; i < allElems["gravity"].length; i++) {
    gameManager.applyMovement(allElems["gravity"][i]);
    gameManager.checkObstacleCollision(allElems["gravity"][i], i);
  }

  // check monsters' collision with player
  for (let j = 0; j < allElems["monster"].length; j++) {
    gameManager.checkMonsterCollision(allElems["monster"][j], j);
  }

  // check bullets' collision with monster
  for (let l = 0; l < allElems["bullet"].length; l++) {
    gameManager.checkBulletCollision(allElems["bullet"][l], l);
  }

  // check player's collision with collectibles
  for (let k = 0; k < allElems["collectible"].length; k++) {
    gameManager.checkCollectibleCollision(allElems["collectible"][k], k);
  }

  for (let m = 0; m < allElems["bullet"].length; m++) {
    if (allElems["bullet"][m].elem.classList.contains("hidden"))
      garbageCollector["bullet"].push(m);
  }
  garbageCollecting();

  // Check if character is passed 45% of screen
  if (
    window.scrollX + window.innerWidth / 2.22 <
    allElems["character"].elem.offsetLeft
  ) {
    window.scroll(
      allElems["character"].elem.offsetLeft - window.innerWidth / 2.22,
      0
    );
  }
  topBar.realTimer++
  window.requestAnimationFrame(update);
}

const garbageCollecting = function () {
  for (const [key, garbage] of Object.entries(garbageCollector)) {
    for (let m = 0; m < garbage.length; m++) {
      console.log(allElems)
      if(key == "monster") {
        sounds.playEffect("monsterKill")
      }
      delete allElems[key][garbage[m]]
    }
    allElems[key] = allElems[key].filter(garbage => garbage)
    garbageCollector[key] = []
  }
}

// Time handler
const updateTime = async (currentTS) => {
  let newTime = Math.floor(
    gameData["time"] - (currentTS - gameData["timeStart"]) / 450
  );
  topBar.setTime(newTime.toString());
  if (newTime <= 0) {
    // End game
    gameEnd = "timeout";
    return;
  }
};

// play sound
const playEffect = async (targetEffect) => {
  if (!soundOn) {
    console.log("Sound is off");
    return;
  }
  console.log("Sound is on and playing " + targetEffect);

  sounds.playEffect(targetEffect)
};

const gameEndHandler = () => {
  gameRunning = false;
  const gameEndOverlay = document.getElementById("gameEnd");
  const miscOverlay = document.getElementById("miscOverlay");

  if (gameEnd == "die" || gameEnd == "timeout") {
    //reduce life
    if (topBar.lives == 0 || gameEnd == "timeout") {
      // handle game end completely

      gameEndOverlay.querySelector("#gameEndMessage").textContent = "Game Over..."
      gameEndOverlay.style.display = "";
      return false;
    } else {
      // handle losing life
      // TODO reset with undefined character and add lives, score, coins from topBar?

      keysPressed = {};
      topBar.setLives(-1);
      topBar.characterStrength = 1;
    
      miscOverlay.innerHTML = ""; // Reset
    
      // Get end game template
      const template = document.querySelector('#diedOverlay');
      let clone = template.content.cloneNode(true);

      miscOverlay.append(clone);
      miscOverlay.querySelector("#showLeve").textContent = topBar.level
      miscOverlay.querySelector("#showLives").textContent = "Lives left: " + topBar.lives
      miscOverlay.style.display = "";

      setTimeout(() => {
          gameSetup(topBar.level);
          window.requestAnimationFrame(update)
      }, 3000);
      return false
    }
  } else if (gameEnd == "lv") {
      // Rebuild to show next level screen and then call gamesetup to start next level
      miscOverlay.innerHTML = ""; // Reset
    
      // Get end game template
      const template = document.querySelector('#nextLevel');
      let clone = template.content.cloneNode(true);

      miscOverlay.append(clone);
      miscOverlay.querySelector("#levelData").textContent = "Level finished"
      miscOverlay.querySelector("#bonusPoints").textContent = "Time Bonus: " + topBar.time + " x 10 = " + topBar.time*10
      topBar.setPoints(topBar.time*10);
      miscOverlay.querySelector("#totalPoints").textContent = "Total score: " + topBar.points
      miscOverlay.style.display = "";
      
        setTimeout(() => {
            gameSetup(nextLevel);
            window.requestAnimationFrame(update)
        }, 6000);
      
      return false
  } else if (gameEnd == "victory") {
      gameEndOverlay.querySelector("#gameEndMessage").textContent = "Congratulations! You won!"
      gameEndOverlay.style.display = "";
      return false

  }
};

const unsetGameEnd = () => {
  gameEnd = "";
  const endGameContainer = document.getElementById("gameEnd");
  endGameContainer.style.display = "none";
  document.getElementById("miscOverlay").style.display = "none";
};

// pause handler
let pause = false;
document.addEventListener("keyup", function (e) {
  if (e.key == "Escape") {
    if (pause === true) {
      pause = false;
      window.requestAnimationFrame(update);
      document.getElementById("overlay").style.display = "none";
    } else if(gameRunning) {
      pause = true;
      document.getElementById("overlay").style.display = "";
      document.getElementById("resume").focus();
    }
    console.log("game paused");
  }
});

function preventDefault(e) {
  e.preventDefault();
}

// disable mouse and keyboard scrolling
var supportsPassive = false;
try {
  window.addEventListener(
    "test",
    null,
    Object.defineProperty({}, "passive", {
      get: function () {
        supportsPassive = true;
      },
    })
  );
} catch (e) { }

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent =
  "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

// call this to Disable
function disableScroll() {
  window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
}
