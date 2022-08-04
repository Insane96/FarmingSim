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
    static globalTick: number = 0;

    static tiles: Array<Tile> = new Array<Tile>();
    static tilesWidth: number = 3;
    static tilesHeight: number = 2;
    static selectedItem: Item | null;
    static timer: number;
    static inventory = new Map<PlantItem, number>();

    static infoDomObject: HTMLElement | null;

    static Infos: Array<Info> = new Array<Info>();

    static season: Season;

    public static init() {
        let itemsContainer = document.getElementById("itemsContainer");
        itemsContainer?.appendChild(Game.generateItemsList());

        Game.logDomObject = document.getElementById("logContainer");
        Game.inventoryDomObject = document.getElementById("inventoryContainer");
        Game.infoDomObject = document.getElementById("infoContainer");

        Game.generateTiles();
        Game.drawTiles();

        Season.init();

        window.setInterval(Game.tick, 100);
    }

    public static tick() {
        Game.globalTick++;
        Season.tick();
        Game.updateInfos();
        Game.tiles.forEach(tile => {
            tile.tick();
        });
    }

    public static updateInfos() {
        let s: string = "";
        Game.Infos.forEach(info => {
            s += info.onTick() + "<br />";
        });
        Game.infoDomObject!.innerHTML = s;
    }

    public static addToInventory(plantType: PlantItem) {
        Game.inventory.set(plantType, (Game.inventory.get(plantType) ?? 0) + 1);
        Game.updateInventoryDisplay();
    }

    static inventoryDomObject: HTMLElement | null;

    public static updateInventoryDisplay() {
        Game.inventoryDomObject!.innerHTML = "";
        for (let entry of Game.inventory.entries()) {
            Game.inventoryDomObject!.innerHTML += `${entry[0].id}: ${entry[1]}<br />`;
        }
    }

    static logDomObject: HTMLElement | null;
    static logRows: number = 0;

    public static log(s: string) {
        if (Game.logDomObject != null) {
            Game.logDomObject.innerHTML += s + "<br />";
            Game.logRows++;
        }
    }
    
    private static generateItemsList(): HTMLDivElement {
        let itemsDiv: HTMLDivElement = document.createElement("div");
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

    public static onTileClick(tile: Tile): void {
        tile.onClick(Game.selectedItem);
    }

    public static generateTiles(): void {
        for (let y = 0; y < this.tilesHeight; y++) {
            for (let x = 0; x < this.tilesWidth; x++) {
                let tile: Tile;
                if (Math.random() < 0.4) {
                    tile = new FarmlandTile(y * this.tilesWidth + x)
                }
                else {
                    tile = new StoneTile(y * this.tilesWidth + x)
                }
                //tileDiv.appendChild(tile.domObject);
                Game.tiles.push(tile);
            }
            //tileDiv.appendChild(document.createElement("br"));
        }
    }

    private static generateTilesDiv(): HTMLDivElement {
        let tileDiv: HTMLDivElement = document.createElement("div");
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

    public static drawTiles(): void {
        let farmlandContainer = document.getElementById("farmlandContainer");
        farmlandContainer?.appendChild(Game.generateTilesDiv());
    }

    public static setTile(id: number, tile: Tile): void {
        let index = Game.tiles.findIndex(t => t.id == id);
        Game.tiles[index].onRemove();
        Game.tiles[index].domObject.replaceWith(tile.domObject);
        Game.tiles[index] = tile;
    }
}

class Season {
    id: string;

    static readonly SEASONS: Array<Season> = new Array<Season>();

    static readonly SUMMER: Season = Season.registerSeason("Summer");
    static readonly AUTUMN: Season = Season.registerSeason("Autumn");
    static readonly WINTER: Season = Season.registerSeason("Winter");
    static readonly SPRING: Season = Season.registerSeason("Spring");
    
    static readonly SEASON_DURATON = 6000;

    static current: Season;
    static timer: number = 0;

    constructor(id: string) {
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
        let index: number = Season.SEASONS.findIndex(s => Season.current.id == s.id);
        if (++index > Season.SEASONS.length - 1)
            index = 0;
        Season.current = Season.SEASONS[index];
        Season.timer = Season.SEASON_DURATON;
    }

    static registerSeason(id: string): Season {
        let s: Season = new Season(id);
        Season.SEASONS.push(s);
        return s;
    }
}

class Info {
    id: string;
    /**
     * Every how many ticks is the info updated. Set to 0 to update manually
     */
    updateFrequency: number;
    /**
     * Function that returns the string to add to the info box
     */
    func: () => string;
    /**
     * cached string to return when the string is not updated
     */
    cached: string;

    constructor(id: string, updateFrequency: number, func: () => string) {
        this.id = id;
        this.updateFrequency = updateFrequency;
        this.func = func;
        this.cached = "";
        this.onTick();
    }

    public onTick(): string {
        if (this.updateFrequency > 0 && Game.globalTick % this.updateFrequency == 0) {
            this.update();
        }
        return this.cached;
    }

    public update() {
        this.cached = this.func();
    }
}

abstract class Tile {
    id: number;
    domObject: HTMLDivElement;

    constructor(id: number, type: string) {
        this.id = id;
        let domObject: HTMLDivElement = document.createElement("div");
        domObject.classList.add("tile");
        domObject.classList.add(type);
        domObject.id = `tile${id}`;
        domObject.addEventListener("click", () => {
            Game.onTileClick(this);
        })
        this.domObject = domObject;
    }

    public tick(): void {
        
    }

    public onClick(item: Item | null): void {
    }

    public onRemove(): void {
    }
}

class FarmlandTile extends Tile {
    tilled: boolean = false;
    fertilizingPower: number = 0;
    planted: Plant | null = null;

    constructor(id: number) {
        super(id, "farmland");
    }

    public override tick(): void {
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

    public override onClick(item: Item | null): void {
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
                this.planted = new Plant(Game.selectedItem as PlantItem);
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
        Game.addToInventory(this.planted!.plantType);
        this.planted = null;
        this.domObject.innerHTML = "";
    }
}

class StoneTile extends Tile {
    constructor(id: number) {
        super(id, "stone");
    }

    public override onClick(item: Item | null): void {
        if (item instanceof HoeItem) {
            Game.setTile(this.id, new FarmlandTile(this.id));
        }
    }
}

class Plant {
    timeToGrown: number;
    plantType: PlantItem;

    constructor(plantType: PlantItem) {
        this.plantType = plantType;
        this.timeToGrown = plantType.timeToGrow;
    }
}

class Item {
    id: string;
    domObject: HTMLDivElement;

    constructor(id: string, type?: string) {
        this.id = id;

        let domObject: HTMLDivElement = document.createElement("div");
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
        })
        domObject.innerHTML = this.id;
        this.domObject = domObject;
    }

    public onTileClick(tile: Tile): void {
        tile.onClick(this);
    }
}

class HoeItem extends Item {
    constructor() {
        super("Hoe");
    }
}

class PlantItem extends Item {
    timeToGrow: number;

    constructor(id: string, timeToGrow: number) {
        super(id, "plant-type");
        this.timeToGrow = timeToGrow;
    }

    public override onTileClick(tile: FarmlandTile): void {
        
    }
}

class PlantTypes {
    static List: Array<PlantItem> = new Array<PlantItem>();

    static POPPY: PlantItem = PlantTypes.registerPlantType("Poppy", 7);
    static DANDELION: PlantItem = PlantTypes.registerPlantType("Dandelion", 10);
    static WHEAT: PlantItem = PlantTypes.registerPlantType("Wheat", 20);

    public static registerPlantType(id: string, timeToGrow: number): PlantItem {
        let plantType: PlantItem = new PlantItem(id, timeToGrow);
        PlantTypes.List.push(plantType);
        return plantType;
    }
}

class Items {
    static List: Array<Item> = new Array<Item>();

    static HOE: Item = Items.registerItem(new HoeItem());
    //static SCYTHE: Item = Items.registerItem("Scythe");
    static PICK: Item = Items.registerItem(new Item("Pick"));
    static WATERING_CAN: Item = Items.registerItem(new Item("Watering Can"));

    public static registerItem(item: Item): Item {
        Items.List.push(item);
        return item;
    }
}