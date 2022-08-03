//TODO
//Make stones generate and require you to break them to plant in the tile (Right now they are just empty tiles)
//Add hoe and watering can
//Make plants require water, first manually, then automatable with sprinklers
//Seasons?

window.addEventListener('load', function () {
    Game.init();
});

class Farmland {
    domObject: HTMLDivElement;
    tilled: boolean = false;
    planted: Plant | null = null;

    constructor(id: number) {
        let domObject: HTMLDivElement = document.createElement("div");
        domObject.classList.add("farmland");
        domObject.id = `cell${id}`;
        domObject.addEventListener("click", () => {
            if (Game.selectedItem != null) {
                Game.selectedItem.onTileClick(this);
            }
            else if (this.planted != null) {
                this.harvest();
            }
        })
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
        Game.addToInventory(this.planted!.plantType);
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
    timeToGrown: number;
    plantType: PlantType;

    constructor(plantType: PlantType) {
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

    public onTileClick(tile: Farmland): void {
        
    }
}

class HoeItem extends Item {
    constructor() {
        super("Hoe");
    }

    public override onTileClick(tile: Farmland): void {
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
    timeToGrow: number;

    constructor(id: string, timeToGrow: number) {
        super(id, "plant-type");
        this.timeToGrow = timeToGrow;
    }

    public override onTileClick(tile: Farmland): void {
        //if (tile.getType() == TileType.Farmland) {
        if (tile.tilled) {
            if (tile.planted == null) {
                tile.planted = new Plant(Game.selectedItem as PlantType);
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
    static List: Array<PlantType> = new Array<PlantType>();

    static POPPY: PlantType = PlantTypes.registerPlantType("Poppy", 7);
    static DANDELION: PlantType = PlantTypes.registerPlantType("Dandelion", 10);
    static WHEAT: PlantType = PlantTypes.registerPlantType("Wheat", 20);

    public static registerPlantType(id: string, timeToGrow: number): PlantType {
        let plantType: PlantType = new PlantType(id, timeToGrow);
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

class Game {
    static Farmlands: Array<Farmland> = new Array<Farmland>();
    static selectedItem: Item | null;
    static timer: number;
    static inventory = new Map<PlantType, number>();

    public static init() {
        let itemsContainer = document.getElementById("itemsContainer");
        itemsContainer?.appendChild(Game.generateItemsList());
        let farmlandContainer = document.getElementById("farmlandContainer");
        farmlandContainer?.appendChild(Game.generateFarmlandDiv(3, 3));

        Game.logDomObject = document.getElementById("logContainer");
        Game.inventoryDomObject = document.getElementById("inventoryContainer");

        window.setInterval(Game.tick, 100);
    }

    public static tick() {
        Game.Farmlands.forEach(farmland => {
            farmland.tick();
        });
    }

    public static addToInventory(plantType: PlantType) {
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

    public static log(s: string) {
        if (Game.logDomObject != null)
            Game.logDomObject.innerHTML += s + "<br />";
    }

    private static generateFarmlandDiv(width: number, height: number): HTMLDivElement {
        let farmlandDiv: HTMLDivElement = document.createElement("div");
        farmlandDiv.style.display = "table";
        farmlandDiv.style.margin = "0 auto";
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.3) {
                    let fl: Farmland = new Farmland(y * width + x);
                    farmlandDiv.appendChild(fl.domObject);
                }
                else {
                    let domObject: HTMLDivElement = document.createElement("div");
                    domObject.classList.add("empty-tile");
                    //domObject.id = `cell${id}`;
                    farmlandDiv.appendChild(domObject);
                }
            }
            farmlandDiv.appendChild(document.createElement("br"));
        }
        return farmlandDiv;
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
}