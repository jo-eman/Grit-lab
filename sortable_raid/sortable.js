"use strict";

// fetch api
export function loadData() {
    fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json").then(response => response.json()).then(createPage)
}

// the main flow of the program for creating the whole page
function createPage(json) {
    createHeadBar(json)

    const table = document.createElement("table")
    const tHead = document.createElement("thead")
    const tbody = document.createElement("tbody")
    document.body.append(table)
    table.append(tHead)
    table.append(tbody)
    
    const arrShow = [".images.xs", ".name", ".biography.fullName", ".powerstats", ".appearance.race", ".appearance.gender", ".appearance.height", ".appearance.weight", ".biography.placeOfBirth", ".biography.alignment"]

    tHead.append(createStickyTopRow(arrShow, json[0]["powerstats"]))

    createColumns(arrShow, json, tbody)

    addFilters()

    addSearches()
}

// createHeadBar creates the head bar of the page
function createHeadBar(json) {
    const headDiv = document.createElement('div')
    headDiv.classList.add('headBar')
    document.body.append(headDiv)
    
    const searchTextArea = generateHeadBarElement(headDiv, "Search Here: ", "textarea")
    searchTextArea.id = "searchTextArea"
    const selectPageSize = generateHeadBarElement(headDiv, "Select Page Size: ", "select")
    selectPageSize.id = "pageSizeSelect"
    const pageSelect = generateHeadBarElement(headDiv, "Select Page: ", "select")
    pageSelect.id = "pageSelect"

    // populate the page size select
    const pageSize = [10, 20, 50, 100, "all results"]
    pageSize.map(size => {
        const option = document.createElement('option')
        option.value = size
        option.textContent = size
        selectPageSize.append(option)
    })
    selectPageSize.value = "20"

    // calculate the number of pages
    let numPages = Math.ceil(json.length / selectPageSize.value)

    // create the page select if it does not exist
    for (let i = 1; i <= numPages; i++) {
        const option = document.createElement('option')
        option.value = i
        option.textContent = i
        pageSelect.append(option)
    }

    selectPageSize.addEventListener("input", function() {
        // if it exists, update the number of pages
        pageSelect.innerHTML = ""
        if (selectPageSize.value === "all results") {
            numPages = 1
        } else {
            numPages = Math.ceil((document.getElementsByTagName('tbody')[0].children.length - document.getElementsByClassName('hidden').length) / selectPageSize.value)
        }
        for (let i = 1; i <= numPages; i++) {
            const option = document.createElement('option')
            option.value = i
            option.textContent = i
            pageSelect.append(option)
        }
        pageSelectEvent()
    })

    pageSelect.addEventListener("input", pageSelectEvent)
    function pageSelectEvent () {
        let start = 0
        let end = 0
        if (selectPageSize.value === "all results") {
            end = json.length - 1
        } else {
            start = (pageSelect.value - 1) * selectPageSize.value
            end = start + parseInt(selectPageSize.value)
        }
        let rowsDisplay = [...document.getElementsByTagName('tbody')[0].children]
        rowsDisplay = rowsDisplay.filter(row => !row.classList.contains("hidden"))
        rowsDisplay.forEach((row, i) => {
            i >= start && i < end? row.classList.remove("pageHidden") : row.classList.add("pageHidden")
        })
    }
}

// generateHeadBarElement generates the elements in the head bar
function generateHeadBarElement(headDiv, label, element) {
    const elemLabel = document.createElement('label')
    elemLabel.textContent = label;
    elemLabel.classList.add('headBarLabel')

    const elem = document.createElement(element)
    elem.classList.add('headBarElement')

    headDiv.append(elemLabel)
    headDiv.append(elem)
    return elem
}

// createStickyTopRow creates the sticky top row of the table
function createStickyTopRow(arrShow, powerstats) {
    const stickyTopRow = document.createElement('tr')
    stickyTopRow.classList.add('sticky')
    arrShow.map(show => {
        const col = document.createElement('td')
        switch (show) {
            case ".images.xs":
                col.textContent = "Icon"
                col.value = show
                stickyTopRow.append(col)
                break;
            case ".powerstats":
                for (const [stat] of Object.entries(powerstats)) {
                    const colPower = document.createElement('td')
                    colPower.textContent = reformString(stat)
                    colPower.value = `${show}.${stat}`
                    stickyTopRow.append(colPower)
                }
                break;
            default:
                col.textContent = reformString(show)
                col.value = show
                stickyTopRow.append(col)
                break;
        }
    })
    return stickyTopRow
}

// createColumns creates the columns of the table
function createColumns(arrShow, json, tbody, rowsNum = 20) {
    json.map((data, i) => {
        const row = document.createElement('tr')
        row.classList.add('row')
        if (i >= rowsNum) row.classList.add("pageHidden")
        arrShow.map(show => {
            const key = show.split('.')
            const col = document.createElement('td')
            if (show === ".name") {
                col.setAttribute("class", "heroName");
            }
            switch (show) {
                case ".images.xs":
                    const img = document.createElement('img')
                    img.src = data[`${key[1]}`][`${key[2]}`]
                    col.append(img)
                    row.append(col)
                    break;
                case ".powerstats":
                    for (const [stat, value] of Object.entries(data[`${key[1]}`])) {
                        const colPower = document.createElement('td')
                        colPower.textContent += value
                        row.append(colPower)
                    }
                    break;
                default:
                    col.textContent = key.at(2)? data[`${key[1]}`][`${key[2]}`] : data[`${key[1]}`]

                    // only show cm and kg for height and weight
                    if (key.at(2) === "height" || key.at(2) === "weight") {

                        // check specific height value like Shaker Heights, Ohio instead of number
                        col.textContent = Number.isNaN(Number.parseInt(col.textContent.split(',')[1]))? col.textContent : col.textContent.split(',')[1]
                    }
                    row.append(col)
            }
        })
        tbody.append(row)
    })
}

// addFilters adds the filters to the sticky top row
function addFilters() {
    const stickyCols = document.getElementsByClassName('sticky')[0].children
    for (const [i, stat] of Object.entries(stickyCols)) {
        stickyCols[i].addEventListener("click", function () {
            const empty = []
            const filled = []
            const normalUnits = []
            const tonsOrMeters = []
            const tbody = document.getElementsByTagName("tbody")[0]
            const rows = [...tbody.children]
            // filter the missing unit to the bottom
            rows.forEach((row) => [...row.children][i].textContent === "-" || ![...row.children][i].textContent || [...row.children][i].textContent.split(" ")[0] === "0" || ([...row.children][i].textContent === "Shaker Heights, Ohio" && stat.textContent === "Height")? empty.push(row):filled.push(row))
            filled.forEach((row) => {
                // handle meters unit
                if (stat.textContent === "Height") {
                    ![...row.children][11].textContent.split(" ")[1].includes("cm")? tonsOrMeters.push(row):normalUnits.push(row)
                // handle tons unit
                } else if (stat.textContent === "Weight") {
                    ![...row.children][12].textContent.split(" ")[1]?.includes("kg")? tonsOrMeters.push(row):normalUnits.push(row)
                // normal filter
                } else normalUnits.push(row)
            })

            normalUnits.sort((a, b) => {
                const aValue = Number.parseInt([...a.children][i].textContent) ? Number.parseInt([...a.children][i].textContent): [...a.children][i].textContent
                const bValue = Number.parseInt([...b.children][i].textContent) ? Number.parseInt([...b.children][i].textContent): [...b.children][i].textContent
                if (aValue > bValue) return 1
                if (aValue < bValue) return -1
                if (aValue === bValue) return 0
            })

            tonsOrMeters.sort((a, b) => {
                const aValue = Number.parseInt([...a.children][i].textContent) ? Number.parseInt([...a.children][i].textContent): [...a.children][i].textContent
                const bValue = Number.parseInt([...b.children][i].textContent) ? Number.parseInt([...b.children][i].textContent): [...b.children][i].textContent
                if (aValue > bValue) return 1
                if (aValue < bValue) return -1
                if (aValue === bValue) return 0
            })

            tbody.innerHTML = ""
            const newArr1 = normalUnits.concat(tonsOrMeters)
            // toggle the filter for reversing
            if (!this.classList.toggle('sorted')) newArr1.reverse()
            const newArr2 = newArr1.concat(empty)
            for (const row of newArr2) {
                tbody.append(row)
            }
        })
    }
}

// searchHandler handles the search bar by hiding the rows that don't match the search
function searchHandler() {
    const searchTextarea = document.getElementById("searchTextArea");
    let heroNames = document.getElementsByClassName("heroName");
    for (let i = 0; i < heroNames.length; i++) {
        if (!heroNames[i].textContent.toLowerCase().includes(searchTextarea.value.toLowerCase())) {
            heroNames[i].parentElement.classList.add("hidden")
        } else {
            heroNames[i].parentElement.classList.remove("hidden");
        }
    }

    const selectPageSize = document.getElementById("pageSizeSelect")
    const pageSelect = document.getElementById("pageSelect")
    let start = 0
    let end = 0
    let numPages
    pageSelect.innerHTML = ""
    if (selectPageSize.value === "all results") {
        numPages = 1
    } else {
        numPages = Math.ceil((document.getElementsByTagName('tbody')[0].children.length - document.getElementsByClassName('hidden').length) / selectPageSize.value)
    }
    for (let i = 1; i <= numPages; i++) {
        const option = document.createElement('option')
        option.value = i
        option.textContent = i
        pageSelect.append(option)
    }
    if (selectPageSize.value === "all results") {
        end = document.getElementsByTagName('tbody')[0].children.length - 1
    } else {
        start = (pageSelect.value - 1) * selectPageSize.value
        end = start + parseInt(selectPageSize.value)
    }
    let rowsDisplay = [...document.getElementsByTagName('tbody')[0].children]
    rowsDisplay = rowsDisplay.filter(row => !row.classList.contains("hidden"))
    rowsDisplay.forEach((row, i) => {
        i >= start && i < end? row.classList.remove("pageHidden") : row.classList.add("pageHidden")
    })
}

// addSearches adds the event listener to the search bar
function addSearches() {
    const searchTextarea = document.getElementById("searchTextArea");
    searchTextarea.addEventListener("input", searchHandler);
}

// reformString reformats the string to be more readable for the sticky top row
function reformString(str) {
    // for powerstats
    if (!str.includes('.')) return str[0].toUpperCase() + str.slice(1)

    // for other stats
    const keyword = str.split('.').at(-1)
    const regex = keyword.match(/[A-Z]*[a-z]+/g)
    regex[0] = regex[0][0].toUpperCase() + regex[0].slice(1)
    return regex.join(' ')
}
