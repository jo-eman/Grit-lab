import { createPlayer } from "./player.js"
import { createMonster, monsterTemplate, createObstacle, createCollectible } from "./objects.js";

export function levelConstructor(levelData, objectRatio) {
    /* levelData["obstacles"] = array of obstacles */

    // create world walls
    levelData["obstacle"].push([1, "", 1, 0, false, "white", window.innerHeight - objectRatio, 0.2])
    levelData["obstacle"].push([1, "", 1, levelData["levelWidth"], false, "white", window.innerHeight - objectRatio, 0.2])
    // add end game castle
    // const castleSize = 6
    levelData["obstacle"].push()
    // construct player
    // createPlayer()

    // construct obstacles
    for (const [key, obstacleData] of Object.entries(levelData["obstacle"])) {
        createObstacle(...obstacleData)
    }
    // construct monsters
    for (const [key, monsterData] of Object.entries(levelData["monster"])) {
        monsterTemplate(...monsterData)
        // createMonster(...monsterData)
    }
    // construct collectibles
    for (const [key, collectibleData] of Object.entries(levelData["collectible"])) {
        createCollectible(...collectibleData)
    }
}

// export async function parseLevel(levelJSON) {
//     let data 
//     await fetch(levelJSON).then(response => {
//         data = response.json()
//         console.log(data)
//     })
// }

// export function stringifyLevel(levelObj) {
//     return JSON.stringify(levelObj)
// }