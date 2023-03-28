import { objectRatio } from "./main.js"
import { monsterTemplate, createObstacle, createCollectible, createMonster } from "./objects.js";

export function levelCreator() {
    const mainContainer = document.getElementById("mainContainer")

    // reset top bar
    const topBar = document.getElementById("topBar")

    // write innerHTML of the top bar structure
    topBar.innerHTML = `<form id="elementOptions">
    <label for="obstacleBtn" id="obstacleLabel">Obstacle</label>
    <input type="radio" id="obstacleBtn" name="elementBtn" value="obstacle" />
    <select id="obstacleDropdown" class="creatorDropdown">
    <option value="crate">Crate</option>
    <option value="mushroomBox">Mushroom in box</option>
    <option value="coinBox">Coin box</option>
    <option value="castle">Castle</option>
    <option value="ground">Ground</option>
    <option value="pipe">Pipe</option>
    </select>

    <label for="monsterBtn" id="monsterLabel">Monster</label>
    <input type="radio" id="monsterBtn" name="elementBtn" value="monster" />
    <select id="monsterDropdown" class="creatorDropdown">
    <option value="stinky">Stinky</option>
    <option value="hattifnatt">Hattifnatt</option>
    </select>

    <label for="collectibleBtn" id="collectibleLabel">Collectible</label>
    <input type="radio" id="collectibleBtn" name="elementBtn" value="collectible" />
    <select id="collectibleDropdown" class="creatorDropdown">
    <option value="coin">Coin</option>
    <option value="mushroom">Mushroom</option>
    </select>

    <label for="deleteItem" id="deleteItemLabel" class="topBarElement topElementLabel">Delete</label>
    <input type="checkbox" name="deleteItem" id="deleteItem" value="1" >

    <button id="createJSON">Create Level</button>
    </form>
    `

    // create labels
    const obstacleLabel = document.getElementById("obstacleLabel")
    const monsterLabel = document.getElementById("monsterLabel")
    const collectibleLabel = document.getElementById("collectibleLabel")
    obstacleLabel.classList.add("topBarElement", "topElementLabel")
    monsterLabel.classList.add("topBarElement", "topElementLabel")
    collectibleLabel.classList.add("topBarElement", "topElementLabel")

    // create radio buttons
    const obstacleBtn = document.getElementById("obstacleBtn")
    const monsterBtn = document.getElementById("monsterBtn")
    const collectibleBtn = document.getElementById("collectibleBtn")
    obstacleBtn.classList.add("topBarElement", "topElementButton")
    monsterBtn.classList.add("topBarElement", "topElementButton")
    collectibleBtn.classList.add("topBarElement", "topElementButton")

    // create dropdown menu
    const obstacleDropdown = document.getElementById("obstacleDropdown")
    obstacleDropdown.classList.add("topBarElement", "topElementDropdown")


    // add changes to different element types
    const elementOptions = document.getElementById("elementOptions")
    elementOptions.addEventListener('input', function (e) {
        console.log(e.target.value)
    })

    // export JSON format for creating the level data
    const submitBtn = document.getElementById("createJSON")
    submitBtn.classList.add("topBarElement")
    submitBtn.style.float = "right"
    submitBtn.style.marginRight = "5%"
    submitBtn.style.backgroundColor = "grey"
    submitBtn.style.borderRadius = "10%"

    submitBtn.addEventListener('click', function (e) {
        e.preventDefault()
        console.log("creating json")
        console.log(JSON.stringify(newLevelData))
    })

    // click to add element to the newLevelData object
    let xPos = 0
    let yPos = 0

    const newLevelData = {
        levelWidth: 200,
        obstacle: [
            [1, [], 11, 0, true, "ground", 1, 200]
        ],
        monster: [],
        collectible: []
    }
    mainContainer.addEventListener('click', function (e) {
        let selected = document.querySelector('input[name="elementBtn"]:checked')?.value;
        if (!selected) {
            selected = document.querySelector('input[name="deleteItem"]');
            if(selected.checked) {
                // Delete item if found in this tile
                for(const [itemType, itemTypeList] of Object.entries(newLevelData)) {
                    for(const [thisItemIndex, thisItemData] of Object.entries(itemTypeList)) {
                        if(yPos == thisItemData[2] && xPos == thisItemData[3]) {
                            console.log("Delete item from ", itemType, " has object ", thisItemData, " at y ", yPos, " vs ", thisItemData[2], ", at x ", xPos, " vs ", thisItemData[3]);
                            // Delete from level data
                            newLevelData[itemType].splice(thisItemIndex, 1);

                            // Delete from document
                            let targetElements = document.getElementsByClassName(itemType)

                            for(let i=0; i < targetElements.length; i++) {
                                if(Math.round(targetElements[i].offsetTop/objectRatio, 0) == yPos && Math.round(targetElements[i].offsetLeft/objectRatio, 0) == xPos) {
                                    targetElements[i].remove();
                                    return
                                }
                            }
                            return
                        }
                    }
                }
            }
            return
        }
        console.log(`creating ${selected} element at ypos${yPos} xpos${xPos}`)

        // Check for duplicate at possition
        for(const [itemType, itemTypeList] of Object.entries(newLevelData)) {
            for(const [thisItemIndex, thisItemData] of Object.entries(itemTypeList)) {
                if(yPos == thisItemData[2] && xPos == thisItemData[3]) {
                    // Possition already taken
                    console.log("Item found at this location");
                    return
                }
            }
        }

        switch (selected) {
            case "obstacle":
                let selectedObstacle = document.getElementById("obstacleDropdown").value
                let content = ""
                let destructable = true;
                switch(selectedObstacle) {
                    case "coinBox":
                        selectedObstacle = "lootbox"
                        content = "mushroom";
                        destructable = false;
                        break;
                    case "mushroomBox":
                        selectedObstacle = "lootbox"
                        content = 5;
                        destructable = false;
                        break;
                }
                const obstacleData = [1, content, yPos, xPos, destructable, selectedObstacle]
                newLevelData[selected].push(obstacleData)
                createObstacle(...obstacleData)
                break
            case "monster":
                let selectedMonster = document.getElementById("monsterDropdown").value
                let monsterData = [selectedMonster, yPos, xPos, -1]
                newLevelData[selected].push(monsterData)
                // monsterData.push(true)
                monsterData = [selectedMonster, yPos, xPos, -1, true]
                monsterTemplate(...monsterData)
                break
            case "collectible":
                let selectedCollectible = document.getElementById("collectibleDropdown").value
                const collectibleData = [1, selectedCollectible, yPos, xPos, true, selectedCollectible, 0, 0, "", false]
                newLevelData[selected].push(collectibleData)
                createCollectible(...collectibleData)
                break
        }
    })

    // add element tracker on mouse move
    const tracker = document.createElement("div")
    tracker.classList.add("tracker")
    tracker.style.height = objectRatio + "px"
    tracker.style.width = objectRatio + "px"
    console.log("hello")
    mainContainer.append(tracker)
    mainContainer.addEventListener('mousemove', function (e) {
        yPos = Math.floor(e.pageY / objectRatio)
        xPos = Math.floor(e.pageX / objectRatio)
        tracker.style.top = yPos * objectRatio + "px"
        tracker.style.left = xPos * objectRatio + "px"
    })

    // Eventlistener for delete
    document.getElementById("deleteItem").addEventListener("change", function (e) {
        let radioB = document.querySelectorAll('input[name="elementBtn"]')
        console.log(radioB);
        for(let i=0; i < radioB.length; i++) {
            radioB[i].checked = false;
        }
    });

}