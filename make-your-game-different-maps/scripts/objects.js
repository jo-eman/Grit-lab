import { objectRatio, allElems } from "./main.js";
import { sounds } from "./sounds.js"
// import { topBar } from "./topbar.js";

const mainContainer = document.getElementById("mainContainer");

const ObjectClass = function (size, content, yPos, xPos, destructible, color) {
  this.size = size;
  this.content = content;
  this.destructible = destructible;
  this.yPos = yPos * objectRatio;
  this.xPos = xPos * objectRatio;
  this.color = color;

  this.elem = document.createElement("div");
};

class Obstacle extends ObjectClass {
  constructor(size, content, yPos, xPos, destructible, color) {
    super(size, content, yPos, xPos, destructible, color);
  }
}

class Monster extends ObjectClass {
  constructor(
    size,
    content,
    yPos,
    xPos,
    destructible,
    sprite,
    xSpeed,
    ySpeed,
    gravity = true
  ) {
    super(size, content, yPos, xPos, destructible, sprite);
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.gravity = gravity;
    this.activated = false;
  }
}

class Collectible extends ObjectClass {
  constructor(
    size,
    content,
    yPos,
    xPos,
    destructible,
    sprite,
    xSpeed,
    ySpeed,
    effect,
    gravity = true
  ) {
    super(size, content, yPos, xPos, destructible, sprite);
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.effect = effect;
    this.gravity = gravity;
  }
}

export class Bullet extends ObjectClass {
  constructor(
    size,
    content,
    yPos,
    xPos,
    destructible,
    color,
    xSpeed,
    ySpeed,
    gravity = true,
    friction = false,
    stayInScreen = false
  ) {
    super(size, content, yPos, xPos, destructible, color);
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.gravity = gravity;
    this.friction = friction;
    this.stayInScreen = stayInScreen;
  }
}

export const createObstacle = function (
  size,
  content,
  yPos,
  xPos,
  destructible,
  sprite,
  customHeight,
  customWidth
) {
  const obstacle = new Obstacle(size, content, yPos, xPos, destructible, sprite);
  switch (sprite) {
    case "lootbox":
      obstacle.elem.style.background = "url(./images/lootbox.png)";
      break;
    case "crate":
      obstacle.elem.style.background = "url(./images/crate.png)";
      break;
    case "pipe":
      obstacle.elem.style.background = "url(./images/pipe.png)";
      break;
    case "ground":
      obstacle.elem.style.background = "url(./images/ground.png)";
      obstacle.elem.style.borderRadius = "8%";
      break;
    case "castle":
      obstacle.elem.style.background = "url(./images/moominhouse.png)";
      break;
  }

  obstacle.elem.style.backgroundSize = "100% 100%";
  obstacle.elem.style.left = obstacle.xPos + "px";
  obstacle.elem.style.top = obstacle.yPos + "px";
  obstacle.elem.style.height = customHeight
    ? customHeight * objectRatio + "px"
    : size * objectRatio + "px";
  obstacle.elem.style.width = customWidth
    ? customWidth * objectRatio + "px"
    : size * objectRatio + "px";
  obstacle.elem.classList.add("obstacle");
  allElems["obstacle"].push(obstacle);
  mainContainer.append(obstacle.elem);
  return obstacle;
};

export const createMonster = function (
  size,
  content,
  yPos,
  xPos,
  destructible,
  sprite,
  xSpeed,
  ySpeed,
  gravity = true
) {
  const monster = new Monster(
    size,
    content,
    yPos,
    xPos,
    destructible,
    sprite,
    xSpeed,
    ySpeed,
    gravity
  );
  monster.elem.style.background = sprite;
  monster.elem.style.backgroundSize = "100% 100%";
  monster.elem.style.left = monster.xPos + "px";
  monster.elem.style.top = monster.yPos + "px";
  monster.elem.style.height = size * objectRatio + "px";
  monster.elem.style.width = size * objectRatio + "px";
  monster.elem.classList.add("monster");
  allElems["monster"].push(monster);
  if (monster.gravity) allElems["gravity"].push(monster);
  mainContainer.append(monster.elem);
  monster.jumping = false;
  return monster;
};

export const createCollectible = function (
  size,
  content,
  yPos,
  xPos,
  destructible,
  sprite,
  xSpeed,
  ySpeed,
  effect,
  gravity = true
) {
  const collectible = new Collectible(
    size,
    content,
    yPos,
    xPos,
    destructible,
    sprite,
    xSpeed,
    ySpeed,
    effect,
    gravity
  );
  switch (sprite) {
    case "coin":
      collectible.elem.style.background = "url(./images/coin.gif)";
      break;
    case "mushroom":
      collectible.elem.style.background = "url(./images/mushroom.png)";
      break;
  }
  collectible.elem.style.backgroundSize = "100% 100%";
  collectible.elem.style.left = collectible.xPos + "px";
  collectible.elem.style.top = collectible.yPos + "px";
  collectible.elem.style.height = size * objectRatio + "px";
  collectible.elem.style.width = size * objectRatio + "px";
  collectible.elem.classList.add("collectible");
  allElems["collectible"].push(collectible);
  if (collectible.gravity) allElems["gravity"].push(collectible);
  mainContainer.append(collectible.elem);
  return collectible;
};

ObjectClass.prototype.yForce = function (force) {
  this.ySpeed += force;
};

ObjectClass.prototype.xForce = function (force) {
  this.xSpeed += force;
  if (this.xSpeed > this.maxSpeed) this.xSpeed = this.maxSpeed;
  if (this.xSpeed < -this.maxSpeed) this.xSpeed = -this.maxSpeed;
};
ObjectClass.prototype.yDisplace = function () {
  this.elem.style.top = this.elem.offsetTop + this.ySpeed + "px";
};
ObjectClass.prototype.xDisplace = function () {
  this.elem.style.left = this.elem.offsetLeft + this.xSpeed + "px";
};

Obstacle.prototype.destroy = function () {
  //fade out slowly
  this.elem.classList.add("transparentObstacle");
  this.elem.style.background = "url(./images/clownsplode.gif)";
  this.elem.style.backgroundSize = "100% 100%";
}

function lootboxReaction(lootboxelem) {
  lootboxelem.style.top = lootboxelem.offsetTop - 20 + "px";
  setTimeout(() => {
    lootboxelem.style.top = lootboxelem.offsetTop + 20 + "px";
  }, 200);
}


ObjectClass.prototype.contentHandler = function (allElems, topBar) {
  if (!this.content) return;
  if (Number.isFinite(this.content)) {
    this.content--;
    topBar.addCoins();
    topBar.setPoints(100);
    lootboxReaction(this.elem);
    // display coin.gif above block for 0.5 seconds if block contains coin

    const coin = document.createElement("div");
    coin.style.background = "url(./images/coin.gif)";
    coin.style.backgroundSize = "100% 100%";
    coin.style.height = "70px";
    coin.style.width = "70px";
    coin.style.position = "absolute";
    coin.style.top = this.elem.offsetTop - 70 + "px";
    coin.style.left = this.elem.offsetLeft + "px";
    mainContainer.append(coin);
    setTimeout(() => {
      coin.remove();
    }, 500);

    // handle empty block after coin is empty
    if (!this.content) {
      this.elem.style.background = "url(./images/crate.png)";
      this.elem.style.backgroundSize = "100% 100%";
    }

    sounds.playEffect("collect")
    return;
  }
  switch (this.content) {
    case "mushroom":
      this.elem.style.background = "url(./images/crate.png)";
      this.elem.style.backgroundSize = "100% 100%";
      lootboxReaction(this.elem);
      sounds.playEffect("mushroomOut")
      const thisCollectible = createCollectible(
        1,
        "mushroom",
        this.elem.offsetTop / objectRatio - 1.1,
        this.elem.offsetLeft / objectRatio,
        true,
        "mushroom",
        2,
        -3,
        "",
        true
      );
      allElems["collectible"].push(thisCollectible);
      if (thisCollectible.gravity) allElems["gravity"].push(thisCollectible);
      mainContainer.append(thisCollectible.elem);
      break;
  }
  this.content = 0;
  // this.content = "mushroom" // create collectible
};

ObjectClass.prototype.collision = function (obj) {
  const obj1Rect = this.elem.getBoundingClientRect();
  const obj2Rect = obj.elem.getBoundingClientRect();

  // stop checking if character is not colliding anything
  // adding one to left and right for decreasing sensitivity of hitting side walls when falling from the edge
  if (
    obj1Rect.top > obj2Rect.bottom ||
    obj1Rect.right < obj2Rect.left + 1 ||
    obj1Rect.bottom < obj2Rect.top ||
    obj1Rect.left + 1 > obj2Rect.right
  )
    return false;
  // find the closest collision side, thus the collision angle
  const angles = [
    Math.abs(obj1Rect.top - obj2Rect.bottom),
    Math.abs(obj1Rect.right - obj2Rect.left),
    Math.abs(obj1Rect.bottom - obj2Rect.top),
    Math.abs(obj1Rect.left - obj2Rect.right),
  ];
  let collisionAngle = angles.indexOf(Math.min(...angles));
  switch (collisionAngle) {
    case 0:
      collisionAngle = "bottom";
      break;
    case 1:
      // collisionAngle is top even if left is the closest side when the character is above ob2Tect.top
      if (obj1Rect.bottom <= obj2Rect.top && !this.jumping) {
        collisionAngle = "top";
      } else {
        collisionAngle = "left";
      }
      break;
    case 2:
      collisionAngle = "top";
      break;
    case 3:
      // same as case 1
      if (obj1Rect.bottom <= obj2Rect.top && !this.jumping) {
        collisionAngle = "top";
      } else {
        collisionAngle = "right";
      }
      break;
  }
  return collisionAngle;
};

// size, content, yPos, xPos, destructible, color, xSpeed, ySpeed, gravity = true
export const monsterTemplate = (mType, yPos, xPos, direction, template = false) => {
  if (direction < 0) {
    direction = -1;
  } else {
    direction = 1;
  }

  if (direction < 0) {
    direction = -1
  } else {
    direction = 1
  }
  let gravity = true;
  if (template) {
    direction = 0;
    gravity = false;
  }
  switch (mType) {
    case "stinky":
      return createMonster(1, 100, yPos, xPos, true, "url(./images/stinky.png)", direction * 2, 0, gravity)
    case "hattifnatt":
      return createMonster(1.5, 100, yPos, xPos, true, "url(./images/hattifnatt.png)", direction * 2, 0, gravity)
  }
  return false;
}
