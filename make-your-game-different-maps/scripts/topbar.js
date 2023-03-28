const topBar = document.getElementById("topBar")
const points = document.createElement("div")
const coins = document.createElement("div")
const level = document.createElement("div")
const time = document.createElement("div")
const lives = document.createElement("div")
points.classList.add("topBarElement", "topElementScoreWidth")
coins.classList.add("topBarElement", "topElementWidth")
level.classList.add("topBarElement", "topElementWidth")
time.classList.add("topBarElement", "topElementWidth")
lives.classList.add("topBarElement", "topElementWidth")

export const TopBar = function () {
    topBar.innerHTML = ""
    topBar.append(points, coins, lives, level, time)

    this.points = 0
    this.coins = 0
    this.level = "lv1"
    this.time = 0
    this.lives = 2
    this.realTimer = 0
    this.characterStrength = undefined

    points.textContent = `SCORE ${this.points.toString().padStart(6, "0")}`
    coins.textContent = `COIN x ${this.coins.toString().padStart(2, "0")}`
    level.textContent = `WORLD ${this.level}`
    time.textContent = `TIME ${this.time.toString().padStart(3, "0")}`
    lives.textContent = `LIVES x ${this.lives.toString().padStart(2, "0")}`
}

TopBar.prototype.setPoints = function (pointsAdded) {
    this.points += pointsAdded
    points.textContent = `SCORE ${this.points.toString().padStart(6, "0")}`
}

TopBar.prototype.addCoins = function () {
    this.coins++
    coins.textContent = `COIN x ${this.coins.toString().padStart(2, "0")}`
}

TopBar.prototype.setLevel = function (newLevel) {
    this.level = newLevel
    level.textContent = `WORLD ${this.level}`
}

TopBar.prototype.setTime = function (seconds) {
    this.time = seconds
    time.textContent = `TIME ${seconds.toString().padStart(3, "0")}`
}

TopBar.prototype.setLives = function (liveChange) {
    this.lives += liveChange
    lives.textContent = `LIVES x ${this.lives.toString().padStart(2, "0")}`
}
