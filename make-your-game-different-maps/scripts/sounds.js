const soundEffects = function() { 
    this.sounds = {}
    // Prepare sound effects
    this.sounds["jump"] = new Audio("sounds/jump.mp3");
    this.sounds["collect"] = new Audio("sounds/collect.mp3");
    this.sounds["shoot"] = new Audio("sounds/shoot.mp3");
    this.sounds["powerUp"] = new Audio("sounds/powerUp.mp3");
    this.sounds["monsterKill"] = new Audio("sounds/monsterKill.mp3");
    this.sounds["destroy"] = new Audio("sounds/destroy.mp3");
    this.sounds["mushroomOut"] = new Audio("sounds/mushroomOut.mp3");
}

soundEffects.prototype.playEffect = async function(effect) {
     if(!document.getElementById("toggleSound").checked) {
        return
     }

    if (this.sounds[effect].paused) {
        this.sounds[effect].play();
    } else {
        this.sounds[effect].currentTime = 0;
    }       
}

export const sounds = new soundEffects();