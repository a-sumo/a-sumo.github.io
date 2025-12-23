private updateCropArea(localPosition: vec2): void {
    if (!this.screenCropProvider || !this.cropAreaMaterial) {
        return;
    }

    const gridSize = this._validatedGridScale;
    const halfGrid = Math.floor(gridSize / 2);

    const centerPixel = this.localToPixelCoords(localPosition);
    const startPixel = this.clampCropRegion(centerPixel, gridSize, halfGrid);

    const croppedPixels = this.sampleCroppedPixels(startPixel, gridSize);
    this.updateCropAreaTexture(croppedPixels, gridSize);
    this.updateSelectedColor(croppedPixels, gridSize, halfGrid);
    this.resetSelectionToCenter();

    this._onCropAreaChangedEvent.invoke();
}

private localToPixelCoords(localPosition: vec2): vec2 {
    return new vec2(
        Math.round((localPosition.x + 0.5) * (this.screenCropWidth - 1)),
        Math.round((localPosition.y + 0.5) * (this.screenCropHeight - 1))
    );
}

private clampCropRegion(centerPixel: vec2, gridSize: number, halfGrid: number): vec2 {
    return new vec2(
        Math.max(0, Math.min(this.screenCropWidth - gridSize, centerPixel.x - halfGrid)),
        Math.max(0, Math.min(this.screenCropHeight - gridSize, centerPixel.y - halfGrid))
    );
}

private sampleCroppedPixels(startPixel: vec2, gridSize: number): Uint8Array {
    const pixelBuffer = new Uint8Array(gridSize * gridSize * 4);
    this.screenCropProvider.getPixels(
        startPixel.x,
        startPixel.y,
        gridSize,
        gridSize,
        pixelBuffer
    );
    return pixelBuffer;
}

private updateCropAreaTexture(croppedPixels: Uint8Array, gridSize: number): void {
    const cropAreaTexture = ProceduralTextureProvider.createWithFormat(
        gridSize,
        gridSize,
        TextureFormat.RGBA8Unorm
    );
    const texProvider = cropAreaTexture.control as ProceduralTextureProvider;
    texProvider.setPixels(0, 0, gridSize, gridSize, croppedPixels);

    this.cropAreaMaterial.mainTexture = cropAreaTexture;
}

private updateSelectedColor(croppedPixels: Uint8Array, gridSize: number, halfGrid: number): void {
    const centerPixelIndex = halfGrid * gridSize + halfGrid;
    const i = centerPixelIndex * 4;

    const color = new vec4(
        croppedPixels[i] * ONE_OVER_255,
        croppedPixels[i + 1] * ONE_OVER_255,
        croppedPixels[i + 2] * ONE_OVER_255,
        1.0
    );

    this.selectedColorMaterial.baseColor = color;
}
