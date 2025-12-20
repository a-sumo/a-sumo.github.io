from manim import *
import numpy as np

def rgb_to_lab(rgb):
    """Convert RGB (0-1) to LAB coordinates."""
    r, g, b = rgb

    # sRGB to linear RGB (gamma correction)
    def linearize(c):
        return np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)

    lr, lg, lb = linearize(r), linearize(g), linearize(b)

    # Linear RGB to XYZ (D65)
    x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375
    y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750
    z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041

    # Normalize for D65 white point
    x, y, z = x / 0.95047, y / 1.0, z / 1.08883

    # XYZ to LAB
    delta = 6.0 / 29.0
    delta3 = delta ** 3

    def f(t):
        return np.where(t > delta3, t ** (1/3), t / (3 * delta ** 2) + 4/29)

    fx, fy, fz = f(x), f(y), f(z)

    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b_val = 200 * (fy - fz)

    return L, a, b_val


class RGBtoLABTransform(Scene):
    def construct(self):
        # Title
        title = Text("RGB → CIELAB Color Space Transform", font_size=36)
        title.to_edge(UP, buff=0.3)

        # Create axes labels
        rgb_label = Text("RGB Space", font_size=24, color=WHITE)
        lab_label = Text("CIELAB Space", font_size=24, color=WHITE)

        # Grid resolution
        res = 16

        # Generate RGB grid points (2D slice at B=0.5)
        points_rgb = []
        colors = []

        for i in range(res + 1):
            for j in range(res + 1):
                r = i / res
                g = j / res
                b = 0.5  # Fixed blue channel

                points_rgb.append([r, g, b])
                colors.append(rgb_to_hex([r, g, b]))

        points_rgb = np.array(points_rgb)

        # Compute LAB positions
        L, a, b_val = rgb_to_lab(points_rgb.T)
        points_lab = np.column_stack([a, L, b_val])  # a* → X, L* → Y

        # Normalize coordinates for display
        # RGB: 0-1 → -3 to 3
        rgb_display = (points_rgb[:, :2] - 0.5) * 6

        # LAB: normalize to similar scale
        # L: 0-100, a: -128 to 128, b: -128 to 128
        lab_display = np.column_stack([
            a / 40,  # a* scaled
            (L - 50) / 16,  # L* centered and scaled
        ])

        # Create dots
        dots = VGroup()
        for i, (rgb_pos, color) in enumerate(zip(rgb_display, colors)):
            dot = Dot(
                point=[rgb_pos[0], rgb_pos[1], 0],
                radius=0.08,
                color=color
            )
            dots.add(dot)

        # Create grid lines for RGB (horizontal and vertical)
        rgb_lines = VGroup()
        for i in range(res + 1):
            # Horizontal lines
            h_points = [[((j / res) - 0.5) * 6, ((i / res) - 0.5) * 6, 0] for j in range(res + 1)]
            h_line = VMobject()
            h_line.set_points_smoothly([np.array(p) for p in h_points])
            h_line.set_stroke(WHITE, width=0.5, opacity=0.3)
            rgb_lines.add(h_line)

            # Vertical lines
            v_points = [[((i / res) - 0.5) * 6, ((j / res) - 0.5) * 6, 0] for j in range(res + 1)]
            v_line = VMobject()
            v_line.set_points_smoothly([np.array(p) for p in v_points])
            v_line.set_stroke(WHITE, width=0.5, opacity=0.3)
            rgb_lines.add(v_line)

        # Compute LAB grid lines
        def get_lab_line_points(fixed_idx, fixed_val, vary_idx, res):
            """Get points for a line in LAB space."""
            pts = []
            for j in range(res + 1):
                rgb = [0.5, 0.5, 0.5]  # B=0.5
                rgb[vary_idx] = j / res
                rgb[fixed_idx] = fixed_val

                L, a, b = rgb_to_lab(np.array([[rgb[0]], [rgb[1]], [rgb[2]]]))
                pts.append([a[0] / 40, (L[0] - 50) / 16, 0])
            return pts

        lab_lines = VGroup()
        for i in range(res + 1):
            # Lines of constant R (varying G)
            pts = get_lab_line_points(0, i / res, 1, res)
            line = VMobject()
            line.set_points_smoothly([np.array(p) for p in pts])
            line.set_stroke(WHITE, width=0.5, opacity=0.3)
            lab_lines.add(line)

            # Lines of constant G (varying R)
            pts = get_lab_line_points(1, i / res, 0, res)
            line = VMobject()
            line.set_points_smoothly([np.array(p) for p in pts])
            line.set_stroke(WHITE, width=0.5, opacity=0.3)
            lab_lines.add(line)

        # RGB axis labels
        r_label = Text("R", font_size=20, color="#ff6666")
        g_label = Text("G", font_size=20, color="#66ff66")
        r_label.next_to(rgb_lines, RIGHT, buff=0.2)
        g_label.next_to(rgb_lines, UP, buff=0.2)

        # LAB axis labels
        a_label = Text("a*", font_size=20, color="#ff89e6")
        L_label = Text("L*", font_size=20, color="#ffffff")

        rgb_label.next_to(rgb_lines, DOWN, buff=0.5)

        # Animation sequence
        self.play(Write(title), run_time=1)
        self.play(
            FadeIn(rgb_lines),
            FadeIn(dots),
            Write(rgb_label),
            Write(r_label),
            Write(g_label),
            run_time=1.5
        )
        self.wait(1)

        # Store target positions for dots
        dot_targets = []
        for i, lab_pos in enumerate(lab_display):
            dot_targets.append([lab_pos[0], lab_pos[1], 0])

        # Animate the transformation
        self.play(
            rgb_label.animate.become(
                Text("CIELAB Space", font_size=24, color=WHITE).next_to(rgb_lines, DOWN, buff=0.5)
            ),
            r_label.animate.become(
                Text("a*", font_size=20, color="#ff89e6").next_to(rgb_lines, RIGHT, buff=0.2)
            ),
            g_label.animate.become(
                Text("L*", font_size=20, color="#ffffff").next_to(rgb_lines, UP, buff=0.2)
            ),
            *[dot.animate.move_to(target) for dot, target in zip(dots, dot_targets)],
            Transform(rgb_lines, lab_lines),
            run_time=3,
            rate_func=smooth
        )

        self.wait(2)

        # Fade out
        self.play(
            FadeOut(title),
            FadeOut(dots),
            FadeOut(rgb_lines),
            FadeOut(rgb_label),
            FadeOut(r_label),
            FadeOut(g_label),
            run_time=1
        )


class RGBtoLABCurvature(Scene):
    """Alternative visualization showing the curvature more clearly."""

    def construct(self):
        title = Text("RGB Grid Curvature in CIELAB", font_size=36)
        title.to_edge(UP, buff=0.3)
        self.play(Write(title))

        # Higher resolution for smoother curves
        res = 20

        # Create the RGB grid
        rgb_grid = VGroup()
        all_dots = VGroup()

        for i in range(res + 1):
            row_dots = []
            for j in range(res + 1):
                r, g = i / res, j / res
                x = (r - 0.5) * 5
                y = (g - 0.5) * 5

                dot = Dot(
                    point=[x, y, 0],
                    radius=0.06,
                    color=rgb_to_hex([r, g, 0.5])
                )
                all_dots.add(dot)
                row_dots.append(dot)

        # Create connecting lines
        lines = VGroup()
        for i in range(res + 1):
            for j in range(res):
                # Horizontal connections
                idx1 = i * (res + 1) + j
                idx2 = i * (res + 1) + j + 1
                line = Line(
                    all_dots[idx1].get_center(),
                    all_dots[idx2].get_center(),
                    stroke_width=1,
                    stroke_opacity=0.4
                )
                lines.add(line)

            if i < res:
                for j in range(res + 1):
                    # Vertical connections
                    idx1 = i * (res + 1) + j
                    idx2 = (i + 1) * (res + 1) + j
                    line = Line(
                        all_dots[idx1].get_center(),
                        all_dots[idx2].get_center(),
                        stroke_width=1,
                        stroke_opacity=0.4
                    )
                    lines.add(line)

        # Show initial grid
        self.play(FadeIn(all_dots), FadeIn(lines), run_time=1.5)
        self.wait(0.5)

        # Compute LAB positions
        def get_lab_pos(r, g, b=0.5):
            L, a, b_val = rgb_to_lab(np.array([[r], [g], [b]]))
            return [a[0] / 35, (L[0] - 50) / 15, 0]

        # Animate transformation
        animations = []
        for i in range(res + 1):
            for j in range(res + 1):
                r, g = i / res, j / res
                idx = i * (res + 1) + j
                target = get_lab_pos(r, g)
                animations.append(all_dots[idx].animate.move_to(target))

        # Update lines to follow dots
        def update_lines(lines):
            line_idx = 0
            for i in range(res + 1):
                for j in range(res):
                    idx1 = i * (res + 1) + j
                    idx2 = i * (res + 1) + j + 1
                    lines[line_idx].put_start_and_end_on(
                        all_dots[idx1].get_center(),
                        all_dots[idx2].get_center()
                    )
                    line_idx += 1

                if i < res:
                    for j in range(res + 1):
                        idx1 = i * (res + 1) + j
                        idx2 = (i + 1) * (res + 1) + j
                        lines[line_idx].put_start_and_end_on(
                            all_dots[idx1].get_center(),
                            all_dots[idx2].get_center()
                        )
                        line_idx += 1

        lines.add_updater(update_lines)

        self.play(*animations, run_time=4, rate_func=smooth)
        lines.remove_updater(update_lines)

        # Add labels
        label = Text("Non-linear curvature from gamma & XYZ transform", font_size=20)
        label.to_edge(DOWN, buff=0.5)
        self.play(Write(label))

        self.wait(2)
        self.play(FadeOut(VGroup(title, all_dots, lines, label)))


if __name__ == "__main__":
    # Run with: manim -pql rgb_to_lab.py RGBtoLABCurvature
    pass
