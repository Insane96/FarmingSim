"use strict";
//TODO
//Make stones generate and require you to break them to plant in the tile (Right now they are just empty tiles)
//Add hoe and watering can
//Make plants require water, first manually, then automatable with sprinklers
window.addEventListener('load', function () {
    Game.init();
});
function generateFarmlandDiv(width, height) {
    let farmlandsDiv = document.createElement("div");
    farmlandsDiv.style.width = "100%";
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.3) {
                let fl = new Farmland(y * width + x);
                farmlandsDiv.appendChild(fl.domObject);
            }
            else {
                let domObject = document.createElement("div");
                domObject.classList.add("empty-tile");
                //domObject.id = `cell${id}`;
                farmlandsDiv.appendChild(domObject);
            }
        }
        farmlandsDiv.appendChild(document.createElement("br"));
    }
    return farmlandsDiv;
}
function generatePlantsList() {
    let plantsDiv = document.createElement("div");
    //plantsDiv.style.width = "100%";
    PlantTypes.List.forEach(plantType => {
        plantsDiv.appendChild(plantType.domObject);
        plantsDiv.appendChild(document.createElement("br"));
    });
    return plantsDiv;
}
class Farmland {
    constructor(id) {
        this.tilled = false;
        this.planted = null;
        let domObject = document.createElement("div");
        domObject.classList.add("farmland");
        domObject.id = `cell${id}`;
        domObject.addEventListener("click", () => {
            if (this.tilled) {
                if (Game.selectedPlant == null) {
                    if (this.planted == null) {
                        Game.log("Select a plant type to plant");
                    }
                    else {
                        this.harvest();
                    }
                }
                else if (this.planted == null) {
                    this.planted = new Plant(Game.selectedPlant);
                    this.domObject.innerHTML = this.planted.plantType.id;
                }
                else {
                    Game.log("A plant is already growing here");
                }
            }
            else {
                if (Game.selectedPlant == null) {
                    this.till();
                }
                else if (this.planted == null) {
                    Game.log("You must till the dirt first");
                }
                else {
                    Game.log(`The plant is not yet grown`);
                }
            }
        });
        this.domObject = domObject;
        Game.Farmlands.push(this);
    }
    till() {
        this.tilled = true;
        this.domObject.classList.add("farmland-tilled");
    }
    harvest() {
        this.tilled = false;
        this.domObject.classList.remove("farmland-tilled");
        //Game.log(`Harvested ${this.planted!.plantType.id}`);
        Game.addToInventory(this.planted.plantType);
        this.planted = null;
        this.domObject.innerHTML = "";
    }
    tick() {
        if (this.planted != null) {
            if (this.planted.timeToGrown > 0) {
                this.planted.timeToGrown -= 0.1;
                if (this.planted.timeToGrown <= 0) {
                    this.domObject.innerHTML = `${this.planted.plantType.id} (grown)`;
                }
                else {
                    this.domObject.innerHTML = `${this.planted.plantType.id} (${Math.ceil(this.planted.timeToGrown).toFixed(0)})`;
                }
            }
        }
    }
}
class Plant {
    constructor(plantType) {
        this.plantType = plantType;
        this.timeToGrown = plantType.timeToGrow;
    }
}
class PlantType {
    constructor(id, timeToGrow) {
        this.id = id;
        this.timeToGrow = timeToGrow;
        let domObject = document.createElement("div");
        domObject.classList.add("plant-type");
        domObject.id = `plantType${this.id}`;
        domObject.addEventListener("click", () => {
            if (Game.selectedPlant != this) {
                if (Game.selectedPlant != null) {
                    Game.selectedPlant.domObject.classList.remove("plant-type-selected");
                }
                Game.selectedPlant = this;
                this.domObject.classList.add("plant-type-selected");
            }
            else {
                this.domObject.classList.remove("plant-type-selected");
                Game.selectedPlant = null;
            }
        });
        domObject.innerHTML = this.id;
        this.domObject = domObject;
    }
}
class PlantTypes {
    static registerPlantType(id, timeToGrow) {
        let plantType = new PlantType(id, timeToGrow);
        PlantTypes.List.push(plantType);
        return plantType;
    }
}
PlantTypes.List = new Array();
PlantTypes.POPPY = PlantTypes.registerPlantType("Poppy", 7);
PlantTypes.DANDELION = PlantTypes.registerPlantType("Dandelion", 10);
class Game {
    static init() {
        let plantTypesContainer = document.getElementById("plantTypesContainer");
        plantTypesContainer === null || plantTypesContainer === void 0 ? void 0 : plantTypesContainer.appendChild(generatePlantsList());
        let farmlandContainer = document.getElementById("farmlandContainer");
        farmlandContainer === null || farmlandContainer === void 0 ? void 0 : farmlandContainer.appendChild(generateFarmlandDiv(5, 4));
        Game.logDomObject = document.getElementById("logContainer");
        Game.inventoryDomObject = document.getElementById("inventoryContainer");
        window.setInterval(Game.tick, 100);
    }
    static tick() {
        Game.Farmlands.forEach(farmland => {
            farmland.tick();
        });
    }
    static addToInventory(plantType) {
        var _a;
        Game.inventory.set(plantType, ((_a = Game.inventory.get(plantType)) !== null && _a !== void 0 ? _a : 0) + 1);
        Game.updateInventoryDisplay();
    }
    static updateInventoryDisplay() {
        Game.inventoryDomObject.innerHTML = "";
        for (let entry of Game.inventory.entries()) {
            Game.inventoryDomObject.innerHTML += `${entry[0].id}: ${entry[1]}<br />`;
        }
    }
    static log(s) {
        if (Game.logDomObject != null)
            Game.logDomObject.innerHTML += s + "<br />";
    }
}
Game.Farmlands = new Array();
Game.inventory = new Map();
