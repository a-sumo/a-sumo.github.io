---
title: "Eyedropper for Spectacles AR Glasses"
description: ""
pubDatetime: 2025-12-15T07:00:00Z
tags: ["augmented reality", "ar", "spectacles", "lens studio", "ui", "eyedropper"]
ogImage: /assets/color_palette_editor_test.gif
draft: false
---

<img src="/assets/color_palette_editor_test.gif" width=300  alt="Eyedropper Test" >


## 1. Eyedropper

An eyedropper [is](https://en.wikipedia.org/wiki/Color_picker) "a tool that allows a user to read a color at a specific point in an image, or position on a display".

For the past two weeks, I've working on an augmented reality traditional painting assistant, a project that fuses my passion for oil painting
One problem I tackled was getting the exact color pigment from a painters
I needed a  have been wondering how this kind of tool and overall interaction mode might translate from desktop interfaces to augmented reality. 

So I made an eye dropper in Lens Studio and tested it with the 2024 Spectacles Augmented Reality glasses. 
First we need something to read colors from. Because we're not operating at the level of the Operating System, but rather within a Lens, we will read from the user's camera feed. 
Because this feed is quite large, and we're planning to sample a single pixel from it,  we need to crop it down. Fortunately, the Spectacles Samples provide a project that implements a cropping functionality that we'll reuse here. 

After the first cropping interaction, an individual pixel might still be too small to be made out by the user. To tackle this issue, I took inspiration from inspiration from [Figma's eyedropper UI](https://help.figma.com/hc/en-us/articles/27643269375767-Sample-colors-with-the-eyedropper-tool), I implemented a menu containing:
- a magnified view of a sampled area covered with a grid which represents the pixel samples.
- an indicator of sampled pixel's color.
Both update in real-time, as the the suer hovers on the crop area's surface.

## 2. UI and Materials

The recently released Spectacles UI Kit took care of many of the key UI elements. With frames and backgrounds taken care of, I could focus my attention on bespoke materials for rectangle corners and grids.
My prior 3D development experience involves lots of Three.js, so when using Lens Studio I find myself leaning towards writing shader code rather than wrangling material graph nodes. 
For this reason, I've priotitized the use of The Material Graph Editor's Custom Code Nodes.

Below is a screenshot of Procedural Grid's Material Graph and a snippet of shader code.
<img src="/assets/texture_grid_material_editor.png" width=1000  alt="Texture Grid Material Editor">

<details>
<summary>Procedural Grid Custom Code Node</summary>

```glsl
input_float gridCountX;
input_float gridCountY;
input_float strokeWidth;
input_float softness;
input_float feather;
input_vec4 gridColor;
input_vec2 surfaceUVCoords;
input_vec3 surfaceWorldScale;
input_vec2 uvOffset;

output_vec4 Output;

void main()
{
    float aspect = surfaceWorldScale.x / surfaceWorldScale.y;
    
    vec2 p = surfaceUVCoords - uvOffset;
    vec2 pNorm = vec2(p.x, p.y / aspect);
    vec2 pShifted = pNorm + 0.5;
    
    float halfStroke = strokeWidth * 0.5;
    float gridMask = 0.0;
    
    for (float i = 1.0; i <= gridCountX - 1.0; i += 1.0) {
        float lineX = i / gridCountX;
        float distToLine = abs(pShifted.x - lineX);
        float lineMask = 1.0 - smoothstep(halfStroke - softness, halfStroke + softness + feather, distToLine);
        gridMask = max(gridMask, lineMask);
    }
    
    for (float j = 1.0; j <= gridCountY  - 1.0; j += 1.0) {
        float lineY = j / gridCountY;
        float distToLine = abs(pShifted.y - lineY);
        float lineMask = 1.0 - smoothstep(halfStroke - softness, halfStroke + softness + feather, distToLine);
        gridMask = max(gridMask, lineMask);
    }
    
    Output = gridColor * gridMask;
}
```
</details>

The logic for reading colors and displaying is mainly handled by CropAreaSelector class, whose core features are listed below. 
It showcases the use of ProceduralTextureProviders, getPixels() 
getPixels() to read from and write values into a texture. 


<details>
<summary> CropAreaSelector Methods </summary>

```ts
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
```
</details>

## Up next: Computing and Visualizing Color Spaces in Augmented Reality
