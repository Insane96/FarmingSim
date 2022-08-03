"use strict";
//TODO
//Make stones generate and require you to break them to plant in the tile (Right now they are just empty tiles)
//Add hoe and watering can
//Make plants require water, first manually, then automatable with sprinklers
//Seasons?
window.addEventListener('load', function () {
    Game.init();
});
class Farmland {
    constructor(id) {
        this.tilled = false;
        this.planted = null;
        let domObject = document.createElement("div");
        domObject.classList.add("farmland");
        domObject.id = `cell${id}`;
        domObject.addEventListener("click", () => {
            if (Game.selectedItem != null) {
                Game.selectedItem.onTileClick(this);
            }
            else if (this.planted != null) {
                this.harvest();
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
class Item {
    constructor(id, type) {
        this.id = id;
        let domObject = document.createElement("div");
        if (type != null)
            domObject.classList.add(type);
        domObject.classList.add("item");
        domObject.id = `${type}${this.id}`;
        domObject.addEventListener("click", () => {
            if (Game.selectedItem != this) {
                if (Game.selectedItem != null) {
                    Game.selectedItem.domObject.classList.remove(`item-selected`);
                }
                Game.selectedItem = this;
                this.domObject.classList.add(`item-selected`);
            }
            else {
                this.domObject.classList.remove(`item-selected`);
                Game.selectedItem = null;
            }
        });
        domObject.innerHTML = this.id;
        this.domObject = domObject;
    }
    onTileClick(tile) {
    }
}
class HoeItem extends Item {
    constructor() {
        super("Hoe");
    }
    onTileClick(tile) {
        //if (tile.getType() == TileType.Farmland) {
        if (!tile.tilled) {
            tile.till();
        }
        else {
            Game.log("The tile is already tilled");
        }
        //}
        //else {
        //}
    }
}
class PlantType extends Item {
    constructor(id, timeToGrow) {
        super(id, "plant-type");
        this.timeToGrow = timeToGrow;
    }
    onTileClick(tile) {
        //if (tile.getType() == TileType.Farmland) {
        if (tile.tilled) {
            if (tile.planted == null) {
                tile.planted = new Plant(Game.selectedItem);
                tile.domObject.innerHTML = tile.planted.plantType.id;
            }
        }
        else {
            Game.log("You must till the dirt before planting");
        }
        //}
        //else {
        //}
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
PlantTypes.WHEAT = PlantTypes.registerPlantType("Wheat", 20);
class Items {
    static registerItem(item) {
        Items.List.push(item);
        return item;
    }
}
Items.List = new Array();
Items.HOE = Items.registerItem(new HoeItem());
//static SCYTHE: Item = Items.registerItem("Scythe");
Items.PICK = Items.registerItem(new Item("Pick"));
Items.WATERING_CAN = Items.registerItem(new Item("Watering Can"));
class Game {
    static init() {
        let itemsContainer = document.getElementById("itemsContainer");
        itemsContainer === null || itemsContainer === void 0 ? void 0 : itemsContainer.appendChild(Game.generateItemsList());
        let farmlandContainer = document.getElementById("farmlandContainer");
        farmlandContainer === null || farmlandContainer === void 0 ? void 0 : farmlandContainer.appendChild(Game.generateFarmlandDiv(3, 3));
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
    static generateFarmlandDiv(width, height) {
        let farmlandDiv = document.createElement("div");
        farmlandDiv.style.display = "table";
        farmlandDiv.style.margin = "0 auto";
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.3) {
                    let fl = new Farmland(y * width + x);
                    farmlandDiv.appendChild(fl.domObject);
                }
                else {
                    let domObject = document.createElement("div");
                    domObject.classList.add("empty-tile");
                    //domObject.id = `cell${id}`;
                    farmlandDiv.appendChild(domObject);
                }
            }
            farmlandDiv.appendChild(document.createElement("br"));
        }
        return farmlandDiv;
    }
    static generateItemsList() {
        let itemsDiv = document.createElement("div");
        itemsDiv.style.display = "table";
        itemsDiv.style.margin = "0 auto";
        Items.List.forEach(item => {
            itemsDiv.appendChild(item.domObject);
        });
        itemsDiv.appendChild(document.createElement("br"));
        itemsDiv.appendChild(document.createElement("br"));
        PlantTypes.List.forEach(plantType => {
            itemsDiv.appendChild(plantType.domObject);
            itemsDiv.appendChild(document.createElement("br"));
        });
        return itemsDiv;
    }
}
Game.Farmlands = new Array();
Game.inventory = new Map();
