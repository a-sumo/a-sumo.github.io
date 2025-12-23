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
