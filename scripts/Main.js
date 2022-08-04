"use strict";
//TODO
//Make stones generate and require you to break them to plant in the tile (Right now they are just empty tiles)
//Add hoe and watering can
//Make plants require water, first manually, then automatable with sprinklers
//Seasons?
window.addEventListener('load', function () {
    //if (this.location.hostname.match("insane96.eu"))
    Game.init();
});
class Game {
    static init() {
        let itemsContainer = document.getElementById("itemsContainer");
        itemsContainer === null || itemsContainer === void 0 ? void 0 : itemsContainer.appendChild(Game.generateItemsList());
        Game.logDomObject = document.getElementById("logContainer");
        Game.inventoryDomObject = document.getElementById("inventoryContainer");
        Game.infoDomObject = document.getElementById("infoContainer");
        Game.generateTiles();
        Game.drawTiles();
        Season.init();
        window.setInterval(Game.tick, 100);
    }
    static tick() {
        Game.globalTick++;
        Season.tick();
        Game.updateInfos();
        Game.tiles.forEach(tile => {
            tile.tick();
        });
    }
    static updateInfos() {
        let s = "";
        Game.Infos.forEach(info => {
            s += info.onTick() + "<br />";
        });
        Game.infoDomObject.innerHTML = s;
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
        if (Game.logDomObject != null) {
            Game.logDomObject.innerHTML += s + "<br />";
            Game.logRows++;
        }
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
    static onTileClick(tile) {
        tile.onClick(Game.selectedItem);
    }
    static generateTiles() {
        for (let y = 0; y < this.tilesHeight; y++) {
            for (let x = 0; x < this.tilesWidth; x++) {
                let tile;
                if (Math.random() < 0.4) {
                    tile = new FarmlandTile(y * this.tilesWidth + x);
                }
                else {
                    tile = new StoneTile(y * this.tilesWidth + x);
                }
                //tileDiv.appendChild(tile.domObject);
                Game.tiles.push(tile);
            }
            //tileDiv.appendChild(document.createElement("br"));
        }
    }
    static generateTilesDiv() {
        let tileDiv = document.createElement("div");
        tileDiv.style.display = "table";
        tileDiv.style.margin = "0 auto";
        for (let y = 0; y < this.tilesHeight; y++) {
            for (let x = 0; x < this.tilesWidth; x++) {
                tileDiv.appendChild(Game.tiles[y * this.tilesWidth + x].domObject);
            }
            tileDiv.appendChild(document.createElement("br"));
        }
        return tileDiv;
    }
    static drawTiles() {
        let farmlandContainer = document.getElementById("farmlandContainer");
        farmlandContainer === null || farmlandContainer === void 0 ? void 0 : farmlandContainer.appendChild(Game.generateTilesDiv());
    }
    static setTile(id, tile) {
        let index = Game.tiles.findIndex(t => t.id == id);
        Game.tiles[index].onRemove();
        Game.tiles[index].domObject.replaceWith(tile.domObject);
        Game.tiles[index] = tile;
    }
}
Game.globalTick = 0;
Game.tiles = new Array();
Game.tilesWidth = 3;
Game.tilesHeight = 2;
Game.inventory = new Map();
Game.Infos = new Array();
Game.logRows = 0;
class Season {
    constructor(id) {
        this.id = id;
    }
    static init() {
        Season.current = Season.SUMMER;
        Season.timer = Season.SEASON_DURATON;
        Game.Infos.push(new Info("season", 10, () => `Season: ${Season.current.id} (${Season.timer})`));
    }
    static tick() {
        if (--Season.timer <= 0) {
            Season.advanceSeason();
        }
    }
    static advanceSeason() {
        let index = Season.SEASONS.findIndex(s => Season.current.id == s.id);
        if (++index > Season.SEASONS.length - 1)
            index = 0;
        Season.current = Season.SEASONS[index];
        Season.timer = Season.SEASON_DURATON;
    }
    static registerSeason(id) {
        let s = new Season(id);
        Season.SEASONS.push(s);
        return s;
    }
}
Season.SEASONS = new Array();
Season.SUMMER = Season.registerSeason("Summer");
Season.AUTUMN = Season.registerSeason("Autumn");
Season.WINTER = Season.registerSeason("Winter");
Season.SPRING = Season.registerSeason("Spring");
Season.SEASON_DURATON = 6000;
Season.timer = 0;
class Info {
    constructor(id, updateFrequency, func) {
        this.id = id;
        this.updateFrequency = updateFrequency;
        this.func = func;
        this.cached = "";
        this.onTick();
    }
    onTick() {
        if (this.updateFrequency > 0 && Game.globalTick % this.updateFrequency == 0) {
            this.update();
        }
        return this.cached;
    }
    update() {
        this.cached = this.func();
    }
}
class Tile {
    constructor(id, type) {
        this.id = id;
        let domObject = document.createElement("div");
        domObject.classList.add("tile");
        domObject.classList.add(type);
        domObject.id = `tile${id}`;
        domObject.addEventListener("click", () => {
            Game.onTileClick(this);
        });
        this.domObject = domObject;
    }
    tick() {
    }
    onClick(item) {
    }
    onRemove() {
    }
}
class FarmlandTile extends Tile {
    constructor(id) {
        super(id, "farmland");
        this.tilled = false;
        this.fertilizingPower = 0;
        this.planted = null;
    }
    tick() {
        if (this.planted != null) {
            if (this.planted.timeToGrown > 0) {
                this.planted.timeToGrown -= 0.1;
                if (this.fertilizingPower > 0)
                    this.planted.timeToGrown -= 0.1 * this.fertilizingPower;
                if (this.planted.timeToGrown <= 0) {
                    this.domObject.innerHTML = `${this.planted.plantType.id} (grown)`;
                }
                else {
                    this.domObject.innerHTML = `${this.planted.plantType.id} (${Math.ceil(this.planted.timeToGrown).toFixed(0)})`;
                }
            }
        }
    }
    onClick(item) {
        if (item instanceof HoeItem) {
            if (!this.tilled) {
                this.till();
            }
            else {
                Game.log("The tile is already tilled");
            }
        }
        else if (item instanceof PlantItem) {
            if (this.tilled && this.planted == null) {
                this.planted = new Plant(Game.selectedItem);
                this.domObject.innerHTML = this.planted.plantType.id;
            }
            else if (this.planted == null) {
                Game.log("You must till the dirt before planting");
            }
        }
        else {
            this.harvest();
        }
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
}
class StoneTile extends Tile {
    constructor(id) {
        super(id, "stone");
    }
    onClick(item) {
        if (item instanceof HoeItem) {
            Game.setTile(this.id, new FarmlandTile(this.id));
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
        tile.onClick(this);
    }
}
class HoeItem extends Item {
    constructor() {
        super("Hoe");
    }
}
class PlantItem extends Item {
    constructor(id, timeToGrow) {
        super(id, "plant-type");
        this.timeToGrow = timeToGrow;
    }
    onTileClick(tile) {
    }
}
class PlantTypes {
    static registerPlantType(id, timeToGrow) {
        let plantType = new PlantItem(id, timeToGrow);
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
