from manimlib import *
import numpy as np

# ========================================
# FIELD DEFINITIONS (matching VectorField.js)
# ========================================

def field_expansion(p, target, scale=1.0):
    """Radial waves expanding from target with 3D oscillation"""
    rel = p - target
    dist = np.linalg.norm(rel)
    s = scale

    radial = rel / dist if dist > 0.001 else np.array([0.0, 1.0, 0.0])
    wave = np.sin(dist * s * 2.0) * 0.5 + 0.5

    perp = np.array([
        np.sin(rel[1] * s) * np.cos(rel[2] * s),
        np.sin(rel[2] * s) * np.cos(rel[0] * s),
        np.sin(rel[0] * s) * np.cos(rel[1] * s)
    ])

    return (radial * wave + perp * 0.3) * 0.4

def field_contraction(p, target, scale=1.0):
    """Spiraling inward toward target"""
    rel = p - target
    dist = np.linalg.norm(rel)
    s = scale

    inward = -rel / dist if dist > 0.001 else np.array([0.0, 0.0, 0.0])
    wave = np.sin(dist * s * 2.0) * 0.3 + 0.7

    twist = np.array([
        np.sin(rel[2] * s + rel[1] * s * 0.5),
        np.cos(rel[0] * s + rel[2] * s * 0.5),
        np.sin(rel[1] * s + rel[0] * s * 0.5)
    ])

    return (inward * wave + twist * 0.25) * 0.4

def field_circulation(p, target, scale=1.0):
    """3D swirling vortex around target"""
    rel = p - target
    s = scale

    distXZ = np.sqrt(rel[0]**2 + rel[2]**2)
    tangentXZ = np.array([-rel[2], 0.0, rel[0]]) / distXZ if distXZ > 0.001 else np.array([1.0, 0.0, 0.0])

    distXY = np.sqrt(rel[0]**2 + rel[1]**2)
    tangentXY = np.array([-rel[1], rel[0], 0.0]) / distXY if distXY > 0.001 else np.array([0.0, 1.0, 0.0])

    wave = np.sin(np.linalg.norm(rel) * s) * 0.5 + 0.5
    mix_factor = np.sin(rel[1] * s) * 0.5 + 0.5
    combined = tangentXZ * (1 - mix_factor) + tangentXY * mix_factor

    combined[1] += np.sin(rel[0] * s) * np.cos(rel[2] * s) * 0.4

    return combined * wave * 0.45

def field_waves(p, target, scale=1.0):
    """Sinusoidal interference centered on target"""
    rel = p - target
    s = scale
    return np.array([
        np.sin(rel[1] * s) * np.cos(rel[2] * s * 0.5),
        np.sin(rel[2] * s) * np.cos(rel[0] * s * 0.5),
        np.sin(rel[0] * s) * np.cos(rel[1] * s * 0.5)
    ]) * 0.35

def field_vortex(p, target, scale=1.0):
    """Rotating cells centered on target"""
    rel = p - target
    s = scale * 0.7

    vx = np.sin(rel[2] * s) * np.cos(rel[1] * s * 0.5)
    vy = np.sin(rel[0] * s) * np.cos(rel[2] * s * 0.5)
    vz = np.sin(rel[1] * s) * np.cos(rel[0] * s * 0.5)

    angle = np.arctan2(rel[2], rel[0])
    spin = np.array([-np.sin(angle), 0.0, np.cos(angle)]) * 0.3

    return (np.array([vx, vy, vz]) + spin) * 0.35


# ========================================
# VISUALIZATION CLASS
# ========================================

class VectorFieldPreset(ThreeDScene):
    # Override these in subclasses
    FIELD_NAME = "Field"
    FIELD_FUNC = staticmethod(field_contraction)
    FIELD_SCALE = 1.0

    def construct(self):
        # Colors
        field_color = "#4A90A4"
        path_color = "#F4A261"
        tangent_color = "#E63946"
        normal_color = "#2A9D8F"
        binormal_color = "#E9C46A"
        target_color = "#FF6B9D"
        text_color = BLACK

        # Camera
        frame = self.camera.frame
        frame.set_euler_angles(phi=65 * DEGREES, theta=-40 * DEGREES)
        frame.set_height(9)

        target = np.array([0.0, 0.0, 0.0])

        def get_field(p):
            return self.FIELD_FUNC(p, target, self.FIELD_SCALE)

        # Visible 3D arrow: cylinder + cone
        def make_arrow(start, end, color, radius=0.03):
            start, end = np.array(start), np.array(end)
            direction = end - start
            length = np.linalg.norm(direction)
            if length < 0.05:
                return Group()
            direction = direction / length

            shaft_length = length * 0.7
            shaft = Cylinder(radius=radius, height=shaft_length, color=color)
            shaft.set_opacity(1)

            tip_length = length * 0.3
            tip = Cone(radius=radius * 2.5, height=tip_length, color=color)
            tip.set_opacity(1)

            default = np.array([0, 0, 1])
            if np.abs(np.dot(default, direction)) < 0.999:
                axis = np.cross(default, direction)
                axis = axis / np.linalg.norm(axis)
                angle = np.arccos(np.clip(np.dot(default, direction), -1, 1))
                shaft.rotate(angle, axis=axis)
                tip.rotate(angle, axis=axis)
            elif np.dot(default, direction) < 0:
                shaft.rotate(PI, axis=RIGHT)
                tip.rotate(PI, axis=RIGHT)

            shaft.move_to(start + direction * shaft_length / 2)
            tip.move_to(start + direction * (shaft_length + tip_length / 2))

            return Group(shaft, tip)

        # ========================================
        # STAGE 1: Vector field
        # ========================================
        title1 = Text(f"1. Define {self.FIELD_NAME} Field", font_size=42, fill_color=text_color)
        title1.fix_in_frame()
        title1.to_edge(UP)
        self.add(title1)

        target_dot = Sphere(radius=0.25, color=target_color)
        target_dot.move_to(target)
        target_dot.set_opacity(1)
        self.play(FadeIn(target_dot), run_time=0.5)

        # Field arrows - denser grid with smaller arrows
        field_arrows = Group()
        for x in np.linspace(-2.5, 2.5, 6):
            for y in np.linspace(-2, 2, 5):
                for z in np.linspace(-2.5, 2.5, 6):
                    p = np.array([float(x), float(y), float(z)])
                    if np.linalg.norm(p - target) < 0.6:
                        continue
                    v = get_field(p)
                    if np.linalg.norm(v) > 0.03:
                        arrow = make_arrow(p, p + v * 1.5, field_color, radius=0.018)
                        field_arrows.add(arrow)

        self.play(FadeIn(field_arrows), run_time=1.5)
        self.wait(0.5)

        # ========================================
        # STAGE 2: Starting point
        # ========================================
        self.play(FadeOut(title1))
        title2 = Text("2. Select Starting Point", font_size=42, fill_color=text_color)
        title2.fix_in_frame()
        title2.to_edge(UP)
        self.add(title2)

        start_pos = np.array([2.5, 1.2, 1.8])
        start_dot = Sphere(radius=0.15, color=path_color)
        start_dot.move_to(start_pos)
        self.play(FadeIn(start_dot, scale=2), run_time=0.5)
        self.wait(0.3)

        # ========================================
        # STAGE 3: Integration with T/N/B frame
        # ========================================
        self.play(FadeOut(title2))
        title3 = Text("3. Integrate Along Field", font_size=42, fill_color=text_color)
        title3.fix_in_frame()
        title3.to_edge(UP)
        self.add(title3)

        # Legend
        legend = VGroup(
            VGroup(Line(ORIGIN, RIGHT * 0.4, color=tangent_color, stroke_width=6),
                   Text("T (tangent)", font_size=22, fill_color=tangent_color)).arrange(RIGHT, buff=0.15),
            VGroup(Line(ORIGIN, RIGHT * 0.4, color=normal_color, stroke_width=6),
                   Text("N (normal)", font_size=22, fill_color=normal_color)).arrange(RIGHT, buff=0.15),
            VGroup(Line(ORIGIN, RIGHT * 0.4, color=binormal_color, stroke_width=6),
                   Text("B (binormal)", font_size=22, fill_color=binormal_color)).arrange(RIGHT, buff=0.15),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        legend.fix_in_frame()
        legend.to_corner(UL).shift(DOWN * 0.9)
        self.play(FadeIn(legend), run_time=0.3)

        step_size = 0.8
        num_steps = 6

        positions = [start_pos.copy()]
        pos = start_pos.copy()
        for i in range(num_steps):
            v = get_field(pos)
            pos = pos + v * step_size
            positions.append(pos.copy())

        path_segments = Group()
        prev_frame = None

        for i in range(num_steps):
            p0 = positions[i]
            p1 = positions[i + 1]

            v = get_field(p0)
            v_norm = np.linalg.norm(v)

            field_arrow = make_arrow(p0, p0 + v * 2.5, tangent_color, radius=0.04)

            if v_norm > 0.001:
                tangent = v / v_norm
            else:
                tangent = np.array([1, 0, 0])

            up = np.array([0, 1, 0])
            normal = np.cross(up, tangent)
            n_len = np.linalg.norm(normal)
            if n_len > 0.001:
                normal = normal / n_len
            else:
                normal = np.array([1, 0, 0])
            binormal = np.cross(tangent, normal)
            binormal = binormal / np.linalg.norm(binormal)

            frame_scale = 1.0
            t_arrow = make_arrow(p0, p0 + tangent * frame_scale, tangent_color, radius=0.035)
            n_arrow = make_arrow(p0, p0 + normal * frame_scale, normal_color, radius=0.035)
            b_arrow = make_arrow(p0, p0 + binormal * frame_scale, binormal_color, radius=0.035)

            current_frame = Group(t_arrow, n_arrow, b_arrow)

            path_line = Cylinder(radius=0.04, height=np.linalg.norm(p1 - p0), color=path_color)
            dir_path = (p1 - p0) / np.linalg.norm(p1 - p0)
            if np.abs(np.dot(np.array([0,0,1]), dir_path)) < 0.999:
                axis = np.cross(np.array([0,0,1]), dir_path)
                angle = np.arccos(np.dot(np.array([0,0,1]), dir_path))
                path_line.rotate(angle, axis=axis/np.linalg.norm(axis))
            path_line.move_to((p0 + p1) / 2)

            step_dot = Sphere(radius=0.08, color=path_color).move_to(p1)

            self.play(FadeIn(field_arrow), run_time=0.2)

            anims = [FadeIn(current_frame), FadeOut(field_arrow)]
            if prev_frame:
                anims.append(FadeOut(prev_frame))
            self.play(*anims, run_time=0.25)

            self.play(FadeIn(path_line), FadeIn(step_dot), run_time=0.15)

            path_segments.add(path_line, step_dot)
            prev_frame = current_frame

        self.wait(0.3)

        # ========================================
        # STAGE 4: Multiple paths
        # ========================================
        self.play(FadeOut(title3), FadeOut(legend))
        if prev_frame:
            self.play(FadeOut(prev_frame), run_time=0.2)

        title4 = Text("4. Integrate Multiple Paths", font_size=42, fill_color=text_color)
        title4.fix_in_frame()
        title4.to_edge(UP)
        self.add(title4)

        self.play(
            FadeOut(field_arrows),
            FadeOut(path_segments),
            FadeOut(start_dot),
            run_time=0.5
        )

        # More starting points for denser flow lines
        start_points = [
            # Corners
            [2.5, 1.5, 2.5], [-2.5, 1.5, 2.5],
            [2.5, 1.5, -2.5], [-2.5, 1.5, -2.5],
            [2.5, -1.5, 2.5], [-2.5, -1.5, 2.5],
            [2.5, -1.5, -2.5], [-2.5, -1.5, -2.5],
            # Edges
            [0.0, 2.0, 2.5], [0.0, 2.0, -2.5],
            [0.0, -2.0, 2.5], [0.0, -2.0, -2.5],
            [2.5, 0.0, 0.0], [-2.5, 0.0, 0.0],
            [0.0, 0.0, 2.5], [0.0, 0.0, -2.5],
        ]
        colors = ["#E63946", "#F4A261", "#2A9D8F", "#4A90A4",
                  "#9B59B6", "#E74C3C", "#1ABC9C", "#3498DB",
                  "#FF6B9D", "#00CED1", "#FFD700", "#FF69B4",
                  "#32CD32", "#8A2BE2", "#FF4500", "#00FF7F"]

        all_paths = VGroup()
        for idx, sp in enumerate(start_points):
            pos = np.array(sp)
            pts = [pos.copy()]
            for _ in range(20):
                v = get_field(pos)
                pos = pos + v * step_size
                pts.append(pos.copy())

            path = VMobject()
            path.set_points_smoothly(pts)
            path.set_stroke(color=colors[idx % len(colors)], width=5)
            all_paths.add(path)

        self.play(*[ShowCreation(p) for p in all_paths], run_time=1.5)
        self.wait(0.5)

        # ========================================
        # STAGE 5: Flow Lines
        # ========================================
        self.play(FadeOut(title4))
        title5 = Text("Flow Lines", font_size=48, fill_color=text_color)
        title5.fix_in_frame()
        title5.to_edge(UP)
        self.add(title5)

        self.play(
            frame.animate.set_euler_angles(phi=70 * DEGREES, theta=50 * DEGREES),
            run_time=4
        )
        self.wait(0.3)


# ========================================
# INDIVIDUAL FIELD CLASSES
# ========================================

class FieldExpansion(VectorFieldPreset):
    FIELD_NAME = "Expansion"
    FIELD_FUNC = staticmethod(field_expansion)
    FIELD_SCALE = 1.0

class FieldContraction(VectorFieldPreset):
    FIELD_NAME = "Contraction"
    FIELD_FUNC = staticmethod(field_contraction)
    FIELD_SCALE = 1.0

class FieldCirculation(VectorFieldPreset):
    FIELD_NAME = "Circulation"
    FIELD_FUNC = staticmethod(field_circulation)
    FIELD_SCALE = 1.0

class FieldWaves(VectorFieldPreset):
    FIELD_NAME = "Waves"
    FIELD_FUNC = staticmethod(field_waves)
    FIELD_SCALE = 1.0

class FieldVortex(VectorFieldPreset):
    FIELD_NAME = "Vortex"
    FIELD_FUNC = staticmethod(field_vortex)
    FIELD_SCALE = 1.0


# Run examples:
# manimgl vector_field_presets.py FieldExpansion -o --hd
# manimgl vector_field_presets.py FieldContraction -o --hd
# manimgl vector_field_presets.py FieldCirculation -o --hd
# manimgl vector_field_presets.py FieldWaves -o --hd
# manimgl vector_field_presets.py FieldVortex -o --hd
