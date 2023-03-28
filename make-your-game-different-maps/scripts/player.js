import { objectRatio, allElems } from "./main.js"
import { Bullet } from "./objects.js"

const mainContainer = document.getElementById("mainContainer")

const Player = function () {
    this.size = 1
    this.strength = 1
    this.invincible = 0
    this.xSpeed = 0
    this.ySpeed = 0
    this.maxSpeed = 14
    this.jumping = true
    this.player = true
    this.friction = true
    this.stayInScreen = true
    this.shootTimer = 0
    this.facing = "right"
    this.maxStrength = 3
    this.acceleration = 4
    this.elem = document.createElement("div");
    this.elem.classList.add("character");
    // this.currentLevel
};

Player.prototype.yForce = function (force) {
    this.ySpeed += force;
};

Player.prototype.xForce = function (force) {
    this.xSpeed += force;
    // apply speed limit
    if (this.xSpeed > this.maxSpeed) this.xSpeed = this.maxSpeed;
    if (this.xSpeed < -this.maxSpeed) this.xSpeed = -this.maxSpeed;
};

Player.prototype.yDisplace = function () {
    // this.elem.style.transform = `translate(0px, ${this.elem.offsetTop + this.ySpeed}px)`;
    // this.elem.offsetTop = this.elem.offsetTop + this.ySpeed;
    // console.log(this.ySpeed, this.elem.offsetTop)
    this.elem.style.top = this.elem.offsetTop + this.ySpeed + "px";
};

Player.prototype.xDisplace = function () {
    // this.elem.style.transform = "translate(" + this.xSpeed + "px 0px)"; // this.elem.offsetLeft + this.xSpeed + "px";
    this.elem.style.left = this.elem.offsetLeft + this.xSpeed + "px";
};


Player.prototype.changeStrength = function (direction) {
    this.strength += direction;
    if (this.strength > this.maxStrength) {
        this.strength = this.maxStrength
        return
    }
    console.log(this.strength);
    switch (this.strength) {
        case 1:
            this.size = 1;
            console.log(this.elem.style.top);
            this.elem.style.top = this.elem.offsetTop + objectRatio + "px";
            console.log(this.elem.style.top);
            this.elem.style.height = this.size * objectRatio + "px";
            break;
        case 2:
            this.size = 1.7;
            // set widht and height of background to 100%
            this.elem.style.backgroundSize = "100% 100%";

            this.elem.style.height = this.size * objectRatio + "px";
            if (direction < 0) {
                this.elem.style.background = "url(./images/supermoomin.png)";
                this.elem.style.backgroundSize = "100% 100%"

            }
            break;
        case 3:
            this.size = 1.7;
            console.log("player can shoot");
            this.elem.style.height = this.size * objectRatio + "px";
            this.elem.style.background = "url(./images/cowboymoomin.png)";
            this.elem.style.backgroundSize = "100% 100%"

            break;
    }

    Player.prototype.shoot = function () {
        // import bullet class from object.js 
        // constructor: size, content, yPos, xPos, destructible, color, xSpeed, ySpeed, gravity?, friction?, stayInScreen?
        const bullet = new Bullet(0.3, 0, 0, 0, true, "orange", this.maxSpeed, 0)
        bullet.xSpeed = this.facing == "right" ? bullet.xSpeed : -bullet.xSpeed
        bullet.bounce = -14
        bullet.elem.style.backgroundColor = bullet.color
        bullet.elem.style.height = bullet.size * objectRatio + "px"
        bullet.elem.style.width = bullet.size * objectRatio + "px"
        bullet.elem.style.top = this.elem.offsetTop + this.size * objectRatio / 2 + "px"
        bullet.elem.style.left = this.facing == "right" ? this.elem.offsetLeft + objectRatio + "px" : this.elem.offsetLeft + "px"
        bullet.elem.classList.add("bullet")
        allElems["gravity"].push(bullet)
        allElems["bullet"].push(bullet)
        mainContainer.append(bullet.elem)
        console.log(`created ${bullet.elem}`)
    }

};

// when get mushrooms, change size animation. the game should be paused
Player.prototype.changeSize = function (direction) {
    // detecth when player change state in this.elem.strength
    let changingStatus;
    switch (this.strength) {
        case 1:
            changingStatus = "size change";
            break;
        case 2:
            if (direction < 0) {
                changingStatus = "sprite change"; // when player gain strength, change sprite
                console.log("mario gets a gun");
            } else {
                changingStatus = "size change";
            }
            break;
        case 3:
            changingStatus = "sprite change";
            break;
    }

    if (changingStatus == "size change") {
        let sizeNow = this.size;
        let sizeTimer = setInterval(() => {
            if (sizeNow == 1) {
                sizeNow = 2;
                this.elem.style.height = sizeNow * objectRatio + "px";
            } else {
                sizeNow = 1;
                this.elem.style.height = objectRatio + "px";
                this.elem.style.top = this.elem.offsetTop + objectRatio + "px";
            }
        }, 100);

        setTimeout(() => {
            clearInterval(sizeTimer);
            this.elem.style.height = this.size * objectRatio + "px";
        }, 1500);
    } else if (changingStatus == "sprite change") {
        this.elem.style.backgroundColor = "red";
    }
};

Player.prototype.collision = function (obj) {
    const obj1Rect = this.elem.getBoundingClientRect();
    const obj2Rect = obj.elem.getBoundingClientRect();

    // stop checking if character is not colliding anything
    if (
        obj1Rect.top > obj2Rect.bottom ||
        obj1Rect.right < obj2Rect.left ||
        obj1Rect.bottom < obj2Rect.top ||
        obj1Rect.left > obj2Rect.right
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
}

export const createPlayer = function () {
    const player = new Player();
    player.elem.style.background = "url(./images/supermoomin.png)";
    player.elem.style.backgroundSize = "100% 100%"
    player.elem.style.left = "50px";
    player.elem.style.height = player.size * objectRatio + "px";
    player.elem.style.width = player.size * objectRatio + "px";
    allElems["character"] = player
    allElems["gravity"].push(player)
    mainContainer.append(player.elem)
    return player
}
