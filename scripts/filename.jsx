if (documents.length > 0) {
    var originalDialogMode = app.displayDialogs;
    app.displayDialogs = DialogModes.ERROR;
    var originalRulerUnits = preferences.rulerUnits;
    preferences.rulerUnits = Units.PIXELS;
    try {
        var docRef = activeDocument;
        var myLayerRef = docRef.artLayers.add();
        myLayerRef.kind = LayerKind.TEXT;
        var myTextRef = myLayerRef.textItem;
        var fileNameNoExtension = docRef.name;
        fileNameNoExtension = fileNameNoExtension.split(".");
        if (fileNameNoExtension.length >= 1) {
            fileNameNoExtension = fileNameNoExtension[0];
        }
        myTextRef.contents = fileNameNoExtension;
        myTextRef.size = new UnitValue(45, "pt");
        myTextRef.position = new Array(5, 15);
    }
    catch (e) {
        preferences.rulerUnits = originalRulerUnits;
        app.displayDialogs = originalDialogMode;
        throw e;
    }
    preferences.rulerUnits = originalRulerUnits;
    app.displayDialogs = originalDialogMode;
}
else {
    alert("You must have a document open to add the filename!");
}