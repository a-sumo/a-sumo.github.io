from manim import *
import numpy as np

# ============ Color Space Conversion Functions ============

def srgb_to_linear(rgb):
    """Gamma correction: sRGB to linear RGB."""
    return np.where(rgb > 0.04045, ((rgb + 0.055) / 1.055) ** 2.4, rgb / 12.92)

def linear_to_xyz(rgb):
    """Linear RGB to XYZ (D65)."""
    r, g, b = rgb
    x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
    return np.array([x, y, z])

def xyz_to_lab(xyz):
    """XYZ to CIELAB."""
    x, y, z = xyz
    # Normalize for D65
    x, y, z = x / 0.95047, y / 1.0, z / 1.08883

    delta = 6.0 / 29.0
    delta3 = delta ** 3

    def f(t):
        return np.where(t > delta3, t ** (1/3), t / (3 * delta ** 2) + 4/29)

    fx, fy, fz = f(x), f(y), f(z)
    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b = 200 * (fy - fz)
    return np.array([L, a, b])

def rgb_to_hsv(rgb):
    """RGB to HSV."""
    r, g, b = rgb
    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    delta = cmax - cmin

    # Hue
    h = np.zeros_like(r)
    mask_r = (cmax == r) & (delta != 0)
    mask_g = (cmax == g) & (delta != 0)
    mask_b = (cmax == b) & (delta != 0)

    h = np.where(mask_r, 60 * (((g - b) / np.where(delta == 0, 1, delta)) % 6), h)
    h = np.where(mask_g, 60 * ((b - r) / np.where(delta == 0, 1, delta) + 2), h)
    h = np.where(mask_b, 60 * ((r - g) / np.where(delta == 0, 1, delta) + 4), h)

    # Saturation
    s = np.where(cmax == 0, 0, delta / cmax)

    # Value
    v = cmax

    return np.array([h, s, v])

def rgb_to_hsl(rgb):
    """RGB to HSL."""
    r, g, b = rgb
    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    delta = cmax - cmin
    L = (cmax + cmin) / 2

    # Hue (same as HSV)
    h = np.zeros_like(r)
    mask_r = (cmax == r) & (delta != 0)
    mask_g = (cmax == g) & (delta != 0)
    mask_b = (cmax == b) & (delta != 0)

    h = np.where(mask_r, 60 * (((g - b) / np.where(delta == 0, 1, delta)) % 6), h)
    h = np.where(mask_g, 60 * ((b - r) / np.where(delta == 0, 1, delta) + 2), h)
    h = np.where(mask_b, 60 * ((r - g) / np.where(delta == 0, 1, delta) + 4), h)

    # Saturation
    s = np.where(delta == 0, 0, delta / (1 - np.abs(2 * L - 1)))

    return np.array([h, s, L])

# ============ Transformation Pipeline ============

def transform_rgb_to_space(rgb, space):
    """Transform RGB coordinates to target color space."""
    r, g, b = rgb

    if space == "sRGB":
        return np.array([r - 0.5, g - 0.5, b - 0.5]) * 5  # Centered

    elif space == "Linear RGB":
        lin = srgb_to_linear(rgb)
        return (lin - 0.5) * 5

    elif space == "XYZ":
        lin = srgb_to_linear(rgb)
        xyz = linear_to_xyz(lin)
        # Normalize XYZ to display range
        return np.array([
            (xyz[0] - 0.5) * 5,
            (xyz[1] - 0.5) * 5,
            (xyz[2] - 0.5) * 5
        ])

    elif space == "CIELAB":
        lin = srgb_to_linear(rgb)
        xyz = linear_to_xyz(lin)
        lab = xyz_to_lab(xyz)
        # Normalize: L:0-100, a:-128-128, b:-128-128
        return np.array([
            lab[1] / 40,      # a* → X
            (lab[0] - 50) / 20,  # L* → Y
            lab[2] / 40       # b* → Z
        ])

    elif space == "HSV":
        hsv = rgb_to_hsv(rgb)
        # Convert cylindrical to cartesian
        h_rad = hsv[0] * np.pi / 180
        radius = hsv[1] * 2  # Saturation as radius
        return np.array([
            radius * np.cos(h_rad),
            (hsv[2] - 0.5) * 4,  # Value → Y
            radius * np.sin(h_rad)
        ])

    elif space == "HSL":
        hsl = rgb_to_hsl(rgb)
        h_rad = hsl[0] * np.pi / 180
        radius = hsl[1] * 2
        return np.array([
            radius * np.cos(h_rad),
            (hsl[2] - 0.5) * 4,  # Lightness → Y
            radius * np.sin(h_rad)
        ])

    return rgb


class ColorSpaceTransforms(ThreeDScene):
    def construct(self):
        # Camera setup
        self.set_camera_orientation(phi=70 * DEGREES, theta=-45 * DEGREES)

        # Title
        title = Text("Color Space Transformations", font_size=36)
        title.to_corner(UL)
        self.add_fixed_in_frame_mobjects(title)

        # Space label
        space_label = Text("sRGB", font_size=28, color=YELLOW)
        space_label.to_corner(UR)
        self.add_fixed_in_frame_mobjects(space_label)

        # Grid resolution
        res = 8

        # Generate RGB points
        points_rgb = []
        colors = []

        for i in range(res + 1):
            for j in range(res + 1):
                for k in range(res + 1):
                    r, g, b = i / res, j / res, k / res
                    points_rgb.append([r, g, b])
                    colors.append(rgb_to_hex([r, g, b]))

        points_rgb = np.array(points_rgb)

        # Create dots
        dots = VGroup()
        for rgb, color in zip(points_rgb, colors):
            pos = transform_rgb_to_space(rgb, "sRGB")
            dot = Dot3D(
                point=[pos[0], pos[1], pos[2]],
                radius=0.06,
                color=color
            )
            dots.add(dot)

        # Create axis grid lines (like spacetime diagrams)
        def create_grid_lines(space, res=8):
            lines = VGroup()

            # Lines along R axis (varying R, fixed G, B)
            for g_idx in range(res + 1):
                for b_idx in range(res + 1):
                    pts = []
                    for r_idx in range(res + 1):
                        r, g, b = r_idx / res, g_idx / res, b_idx / res
                        pos = transform_rgb_to_space(np.array([r, g, b]), space)
                        pts.append([pos[0], pos[1], pos[2]])

                    if len(pts) > 1:
                        line = VMobject()
                        line.set_points_smoothly([np.array(p) for p in pts])
                        line.set_stroke(RED, width=1, opacity=0.3)
                        lines.add(line)

            # Lines along G axis
            for r_idx in range(res + 1):
                for b_idx in range(res + 1):
                    pts = []
                    for g_idx in range(res + 1):
                        r, g, b = r_idx / res, g_idx / res, b_idx / res
                        pos = transform_rgb_to_space(np.array([r, g, b]), space)
                        pts.append([pos[0], pos[1], pos[2]])

                    if len(pts) > 1:
                        line = VMobject()
                        line.set_points_smoothly([np.array(p) for p in pts])
                        line.set_stroke(GREEN, width=1, opacity=0.3)
                        lines.add(line)

            # Lines along B axis
            for r_idx in range(res + 1):
                for g_idx in range(res + 1):
                    pts = []
                    for b_idx in range(res + 1):
                        r, g, b = r_idx / res, g_idx / res, b_idx / res
                        pos = transform_rgb_to_space(np.array([r, g, b]), space)
                        pts.append([pos[0], pos[1], pos[2]])

                    if len(pts) > 1:
                        line = VMobject()
                        line.set_points_smoothly([np.array(p) for p in pts])
                        line.set_stroke(BLUE, width=1, opacity=0.3)
                        lines.add(line)

            return lines

        # Create axis arrows
        def create_axes(space):
            axes = VGroup()

            # Origin and axis endpoints in the space
            origin_rgb = np.array([0.0, 0.0, 0.0])
            r_end = np.array([1.0, 0.0, 0.0])
            g_end = np.array([0.0, 1.0, 0.0])
            b_end = np.array([0.0, 0.0, 1.0])

            origin = transform_rgb_to_space(origin_rgb, space)
            r_pos = transform_rgb_to_space(r_end, space)
            g_pos = transform_rgb_to_space(g_end, space)
            b_pos = transform_rgb_to_space(b_end, space)

            # Create arrows
            r_arrow = Arrow3D(
                start=origin, end=r_pos,
                color=RED, thickness=0.02
            )
            g_arrow = Arrow3D(
                start=origin, end=g_pos,
                color=GREEN, thickness=0.02
            )
            b_arrow = Arrow3D(
                start=origin, end=b_pos,
                color=BLUE, thickness=0.02
            )

            axes.add(r_arrow, g_arrow, b_arrow)
            return axes

        # Initial grid
        grid = create_grid_lines("sRGB", res)
        axes = create_axes("sRGB")

        # Show initial state
        self.add(title)
        self.play(
            FadeIn(dots),
            Create(grid),
            Create(axes),
            FadeIn(space_label),
            run_time=2
        )
        self.wait(1)

        # Rotate camera slowly
        self.begin_ambient_camera_rotation(rate=0.1)

        # Define transformation sequence
        spaces = [
            ("sRGB", "Linear RGB", "Gamma correction (γ = 2.4)"),
            ("Linear RGB", "XYZ", "Matrix transformation"),
            ("XYZ", "CIELAB", "Cube root (perceptual)"),
            ("CIELAB", "HSV", "Cylindrical mapping"),
            ("HSV", "sRGB", "Back to sRGB"),
        ]

        for from_space, to_space, description in spaces:
            # Update label
            new_label = Text(to_space, font_size=28, color=YELLOW)
            new_label.to_corner(UR)
            self.add_fixed_in_frame_mobjects(new_label)

            desc_text = Text(description, font_size=20, color=WHITE)
            desc_text.next_to(space_label, DOWN)
            self.add_fixed_in_frame_mobjects(desc_text)

            # Compute new positions
            new_grid = create_grid_lines(to_space, res)
            new_axes = create_axes(to_space)

            new_positions = []
            for rgb in points_rgb:
                pos = transform_rgb_to_space(rgb, to_space)
                new_positions.append([pos[0], pos[1], pos[2]])

            # Animate transformation
            self.play(
                FadeIn(desc_text),
                run_time=0.5
            )

            self.play(
                *[dot.animate.move_to(pos) for dot, pos in zip(dots, new_positions)],
                Transform(grid, new_grid),
                Transform(axes, new_axes),
                Transform(space_label, new_label),
                run_time=3,
                rate_func=smooth
            )

            self.wait(1.5)
            self.play(FadeOut(desc_text), run_time=0.5)

        self.stop_ambient_camera_rotation()
        self.wait(1)

        # Fade out
        self.play(
            FadeOut(dots),
            FadeOut(grid),
            FadeOut(axes),
            FadeOut(title),
            FadeOut(space_label),
            run_time=1
        )


class ColorSpaceTransforms2D(Scene):
    """2D version showing grid warping more clearly."""

    def construct(self):
        title = Text("Color Space Grid Transformations", font_size=32)
        title.to_edge(UP, buff=0.3)

        space_label = Text("sRGB", font_size=24, color=YELLOW)
        space_label.next_to(title, DOWN)

        res = 12

        # Generate 2D slice (B = 0.5)
        points = []
        colors = []
        for i in range(res + 1):
            for j in range(res + 1):
                r, g = i / res, j / res
                points.append([r, g, 0.5])
                colors.append(rgb_to_hex([r, g, 0.5]))

        points = np.array(points)

        # Create dots
        dots = VGroup()
        for rgb, color in zip(points, colors):
            x = (rgb[0] - 0.5) * 6
            y = (rgb[1] - 0.5) * 6
            dot = Dot(point=[x, y, 0], radius=0.08, color=color)
            dots.add(dot)

        # Create grid lines
        def create_2d_grid(space):
            lines = VGroup()

            # Horizontal lines (constant G)
            for g_idx in range(res + 1):
                pts = []
                for r_idx in range(res + 1):
                    r, g = r_idx / res, g_idx / res
                    pos = get_2d_pos(r, g, space)
                    pts.append([pos[0], pos[1], 0])

                line = VMobject()
                line.set_points_smoothly([np.array(p) for p in pts])
                line.set_stroke(GREEN, width=1.5, opacity=0.5)
                lines.add(line)

            # Vertical lines (constant R)
            for r_idx in range(res + 1):
                pts = []
                for g_idx in range(res + 1):
                    r, g = r_idx / res, g_idx / res
                    pos = get_2d_pos(r, g, space)
                    pts.append([pos[0], pos[1], 0])

                line = VMobject()
                line.set_points_smoothly([np.array(p) for p in pts])
                line.set_stroke(RED, width=1.5, opacity=0.5)
                lines.add(line)

            return lines

        def get_2d_pos(r, g, space):
            rgb = np.array([r, g, 0.5])

            if space == "sRGB":
                return [(r - 0.5) * 6, (g - 0.5) * 6]

            elif space == "Linear RGB":
                lin = srgb_to_linear(rgb)
                return [(lin[0] - 0.5) * 6, (lin[1] - 0.5) * 6]

            elif space == "XYZ":
                lin = srgb_to_linear(rgb)
                xyz = linear_to_xyz(lin)
                return [(xyz[0] - 0.4) * 8, (xyz[1] - 0.4) * 8]

            elif space == "CIELAB":
                lin = srgb_to_linear(rgb)
                xyz = linear_to_xyz(lin)
                lab = xyz_to_lab(xyz)
                return [lab[1] / 25, (lab[0] - 50) / 18]

            elif space == "HSV":
                hsv = rgb_to_hsv(rgb)
                h_rad = hsv[0] * np.pi / 180
                radius = hsv[1] * 3
                return [radius * np.cos(h_rad), (hsv[2] - 0.5) * 5]

            return [(r - 0.5) * 6, (g - 0.5) * 6]

        # Initial
        grid = create_2d_grid("sRGB")

        # Axis labels
        r_label = Text("R", font_size=20, color=RED)
        g_label = Text("G", font_size=20, color=GREEN)
        r_label.move_to([3.5, -3.5, 0])
        g_label.move_to([-3.5, 3.5, 0])

        self.play(Write(title), FadeIn(space_label))
        self.play(
            FadeIn(dots),
            Create(grid),
            FadeIn(r_label),
            FadeIn(g_label),
            run_time=1.5
        )
        self.wait(1)

        # Transformations
        transforms = [
            ("sRGB", "Linear RGB", "Gamma → Linear", "R (linear)", "G (linear)"),
            ("Linear RGB", "XYZ", "RGB → XYZ", "X", "Y"),
            ("XYZ", "CIELAB", "XYZ → LAB", "a*", "L*"),
            ("CIELAB", "HSV", "LAB → HSV", "H (cos)", "V"),
            ("HSV", "sRGB", "HSV → sRGB", "R", "G"),
        ]

        for _, to_space, desc, x_axis, y_axis in transforms:
            new_label = Text(to_space, font_size=24, color=YELLOW)
            new_label.next_to(title, DOWN)

            desc_text = Text(desc, font_size=18, color=GRAY)
            desc_text.to_edge(DOWN, buff=0.5)

            new_grid = create_2d_grid(to_space)

            new_r_label = Text(x_axis, font_size=20, color=RED)
            new_g_label = Text(y_axis, font_size=20, color=GREEN)
            new_r_label.move_to([3.5, -3.5, 0])
            new_g_label.move_to([-3.5, 3.5, 0])

            # Compute new dot positions
            new_positions = []
            for rgb in points:
                pos = get_2d_pos(rgb[0], rgb[1], to_space)
                new_positions.append([pos[0], pos[1], 0])

            self.play(FadeIn(desc_text), run_time=0.3)

            self.play(
                *[dot.animate.move_to(pos) for dot, pos in zip(dots, new_positions)],
                Transform(grid, new_grid),
                Transform(space_label, new_label),
                Transform(r_label, new_r_label),
                Transform(g_label, new_g_label),
                run_time=2.5,
                rate_func=smooth
            )

            self.wait(1)
            self.play(FadeOut(desc_text), run_time=0.3)

        self.wait(1)
        self.play(
            FadeOut(VGroup(title, space_label, dots, grid, r_label, g_label)),
            run_time=1
        )


if __name__ == "__main__":
    pass
