from manimlib import *
import numpy as np

class MagneticField(ThreeDScene):
    """Visualizes magnetic field from two dipole magnets"""

    def construct(self):
        # Colors
        field_color = "#4A90A4"
        path_color = "#F4A261"
        tangent_color = "#E63946"
        normal_color = "#2A9D8F"
        binormal_color = "#E9C46A"
        north_color = "#E63946"  # Red for North
        south_color = "#4A90A4"  # Blue for South
        text_color = "#CCCCCC"

        # Camera - wider view
        frame = self.camera.frame
        frame.set_euler_angles(phi=65 * DEGREES, theta=-40 * DEGREES)
        frame.set_height(14)

        # Magnet positions and orientations - wider apart
        magnet1_pos = np.array([-3.0, 0.0, 0.0])
        magnet1_moment = np.array([1.0, 0.0, 0.0])  # Points from S to N (N at +x side)

        magnet2_pos = np.array([3.0, 0.0, 0.0])
        magnet2_moment = np.array([-1.0, 0.0, 0.0])  # Points from S to N (N at -x side, facing magnet1)

        field_strength = 1.0

        def dipole_field(point, dipole_pos, moment):
            """Compute magnetic field from a single dipole"""
            r = point - dipole_pos
            dist = np.linalg.norm(r)

            if dist < 0.1:
                return moment * field_strength * 2.0

            r_hat = r / dist
            dist3 = dist ** 3
            m_dot_r = np.dot(moment, r_hat)
            B = (3.0 * m_dot_r * r_hat - moment) / dist3
            return B * field_strength

        def get_magnetic_field(p):
            """Combined field from both magnets"""
            B1 = dipole_field(p, magnet1_pos, magnet1_moment)
            B2 = dipole_field(p, magnet2_pos, magnet2_moment)
            total = B1 + B2

            mag = np.linalg.norm(total)
            if mag > 0.001:
                clamped_mag = mag / (1.0 + mag * 0.5)
                total = (total / mag) * clamped_mag * 0.5

            return total

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

        def make_magnet(pos, moment, label):
            """Create a bar magnet visualization using spheres for poles"""
            # North pole (red sphere)
            north_sphere = Sphere(radius=0.25, color=north_color)
            north_sphere.set_opacity(0.9)
            north_pos = pos + moment * 0.3
            north_sphere.move_to(north_pos)

            # South pole (blue sphere)
            south_sphere = Sphere(radius=0.25, color=south_color)
            south_sphere.set_opacity(0.9)
            south_pos = pos - moment * 0.3
            south_sphere.move_to(south_pos)

            # Connecting cylinder
            bar_length = 0.6
            bar = Cylinder(radius=0.15, height=bar_length, color="#666666")
            bar.set_opacity(0.8)
            # Rotate to align with moment
            default = np.array([0, 0, 1])
            if np.abs(np.dot(default, moment)) < 0.999:
                axis = np.cross(default, moment)
                axis = axis / np.linalg.norm(axis)
                angle = np.arccos(np.clip(np.dot(default, moment), -1, 1))
                bar.rotate(angle, axis=axis)
            bar.move_to(pos)

            return Group(bar, north_sphere, south_sphere)

        # ========================================
        # STAGE 1: Show magnets
        # ========================================
        title1 = Text("1. Define Magnetic Dipoles", font_size=42, color=text_color)
        title1.fix_in_frame()
        title1.to_edge(UP)
        self.add(title1)

        magnet1 = make_magnet(magnet1_pos, magnet1_moment, "Magnet 1")
        magnet2 = make_magnet(magnet2_pos, magnet2_moment, "Magnet 2")

        self.play(FadeIn(magnet1), FadeIn(magnet2), run_time=0.8)
        self.wait(0.5)

        # ========================================
        # STAGE 2: Show dipole formula
        # ========================================
        self.play(FadeOut(title1))
        title2 = Text("2. Compute Dipole Field", font_size=42, color=text_color)
        title2.fix_in_frame()
        title2.to_edge(UP)
        self.add(title2)

        formula = Text("B = (3(m·r)r - m) / r³", font_size=28, color=text_color)
        formula.fix_in_frame()
        formula.to_corner(DL).shift(UP * 0.5 + RIGHT * 0.5)
        self.play(FadeIn(formula), run_time=0.5)

        # Show field arrows - wider grid
        field_arrows = Group()
        for x in np.linspace(-5.0, 5.0, 10):
            for y in np.linspace(-3, 3, 6):
                for z in np.linspace(-3, 3, 6):
                    p = np.array([float(x), float(y), float(z)])
                    # Skip points too close to magnets
                    if np.linalg.norm(p - magnet1_pos) < 0.8 or np.linalg.norm(p - magnet2_pos) < 0.8:
                        continue
                    v = get_magnetic_field(p)
                    if np.linalg.norm(v) > 0.02:
                        arrow = make_arrow(p, p + v * 1.8, field_color, radius=0.015)
                        field_arrows.add(arrow)

        self.play(FadeIn(field_arrows), run_time=1.5)
        self.wait(0.5)

        # ========================================
        # STAGE 3: Integration
        # ========================================
        self.play(FadeOut(title2), FadeOut(formula))
        title3 = Text("3. Integrate Field Lines", font_size=42, color=text_color)
        title3.fix_in_frame()
        title3.to_edge(UP)
        self.add(title3)

        # Legend
        legend = VGroup(
            VGroup(Line(ORIGIN, RIGHT * 0.4, color=tangent_color, stroke_width=6),
                   Text("T (tangent)", font_size=22, color=tangent_color)).arrange(RIGHT, buff=0.15),
            VGroup(Line(ORIGIN, RIGHT * 0.4, color=normal_color, stroke_width=6),
                   Text("N (normal)", font_size=22, color=normal_color)).arrange(RIGHT, buff=0.15),
            VGroup(Line(ORIGIN, RIGHT * 0.4, color=binormal_color, stroke_width=6),
                   Text("B (binormal)", font_size=22, color=binormal_color)).arrange(RIGHT, buff=0.15),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        legend.fix_in_frame()
        legend.to_corner(UL).shift(DOWN * 0.9)
        self.play(FadeIn(legend), run_time=0.3)

        # Start integration from near N pole of magnet1 to trace toroidal path
        # N pole of magnet1 is at x=-2.7, start above it to curve around
        start_pos = np.array([-2.6, 0.6, 0.0])  # Near N pole, offset upward for toroidal path
        start_dot = Sphere(radius=0.12, color=path_color)
        start_dot.move_to(start_pos)
        self.play(FadeIn(start_dot, scale=2), run_time=0.5)

        step_size = 0.6
        num_steps = 12

        positions = [start_pos.copy()]
        pos = start_pos.copy()
        for i in range(num_steps):
            v = get_magnetic_field(pos)
            pos = pos + v * step_size
            positions.append(pos.copy())

        path_segments = Group()
        prev_frame = None

        for i in range(num_steps):
            p0 = positions[i]
            p1 = positions[i + 1]

            v = get_magnetic_field(p0)
            v_norm = np.linalg.norm(v)

            field_arrow = make_arrow(p0, p0 + v * 2.0, tangent_color, radius=0.035)

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

            frame_scale = 0.8
            t_arrow = make_arrow(p0, p0 + tangent * frame_scale, tangent_color, radius=0.03)
            n_arrow = make_arrow(p0, p0 + normal * frame_scale, normal_color, radius=0.03)
            b_arrow = make_arrow(p0, p0 + binormal * frame_scale, binormal_color, radius=0.03)

            current_frame = Group(t_arrow, n_arrow, b_arrow)

            seg_len = np.linalg.norm(p1 - p0)
            if seg_len > 0.01:
                path_line = Cylinder(radius=0.035, height=seg_len, color=path_color)
                dir_path = (p1 - p0) / seg_len
                if np.abs(np.dot(np.array([0,0,1]), dir_path)) < 0.999:
                    axis = np.cross(np.array([0,0,1]), dir_path)
                    angle = np.arccos(np.dot(np.array([0,0,1]), dir_path))
                    path_line.rotate(angle, axis=axis/np.linalg.norm(axis))
                path_line.move_to((p0 + p1) / 2)
                path_segments.add(path_line)

            step_dot = Sphere(radius=0.07, color=path_color).move_to(p1)

            self.play(FadeIn(field_arrow), run_time=0.15)

            anims = [FadeIn(current_frame), FadeOut(field_arrow)]
            if prev_frame:
                anims.append(FadeOut(prev_frame))
            self.play(*anims, run_time=0.2)

            self.play(FadeIn(path_line), FadeIn(step_dot), run_time=0.12)

            path_segments.add(step_dot)
            prev_frame = current_frame

        self.wait(0.3)

        # ========================================
        # STAGE 4: Multiple field lines
        # ========================================
        self.play(FadeOut(title3), FadeOut(legend))
        if prev_frame:
            self.play(FadeOut(prev_frame), run_time=0.2)

        title4 = Text("4. Trace Multiple Field Lines", font_size=42, color=text_color)
        title4.fix_in_frame()
        title4.to_edge(UP)
        self.add(title4)

        self.play(
            FadeOut(field_arrows),
            FadeOut(path_segments),
            FadeOut(start_dot),
            run_time=0.5
        )

        # Start points around the magnets - wider spread
        start_points = [
            # Around magnet 1 N pole (at x=-2.7)
            [-2.5, 0.8, 0.0], [-2.5, -0.8, 0.0],
            [-2.5, 0.0, 0.8], [-2.5, 0.0, -0.8],
            [-2.5, 0.6, 0.6], [-2.5, -0.6, 0.6],
            [-2.5, 0.6, -0.6], [-2.5, -0.6, -0.6],
            # Around magnet 2 N pole (at x=2.7)
            [2.5, 0.8, 0.0], [2.5, -0.8, 0.0],
            [2.5, 0.0, 0.8], [2.5, 0.0, -0.8],
            [2.5, 0.6, 0.6], [2.5, -0.6, 0.6],
            [2.5, 0.6, -0.6], [2.5, -0.6, -0.6],
        ]

        colors = ["#E63946", "#F4A261", "#2A9D8F", "#4A90A4",
                  "#9B59B6", "#E74C3C", "#1ABC9C", "#3498DB",
                  "#FF6B9D", "#00CED1", "#FFD700", "#FF69B4",
                  "#32CD32", "#8A2BE2", "#FF4500", "#00FF7F"]

        all_paths = VGroup()
        for idx, sp in enumerate(start_points):
            pos = np.array(sp)
            pts = [pos.copy()]
            for _ in range(35):  # More steps for wider paths
                v = get_magnetic_field(pos)
                pos = pos + v * 0.5  # Larger step size
                pts.append(pos.copy())

            path = VMobject()
            path.set_points_smoothly(pts)
            path.set_stroke(color=colors[idx % len(colors)], width=4)
            all_paths.add(path)

        self.play(*[ShowCreation(p) for p in all_paths], run_time=1.5)
        self.wait(0.5)

        # ========================================
        # STAGE 5: Final view - Flow Lines
        # ========================================
        self.play(FadeOut(title4))
        title5 = Text("Magnetic Field Lines", font_size=48, color=text_color)
        title5.fix_in_frame()
        title5.to_edge(UP)
        self.add(title5)

        self.play(
            frame.animate.set_euler_angles(phi=70 * DEGREES, theta=50 * DEGREES),
            run_time=4
        )
        self.wait(0.3)


# Run: manimgl magnetic_field.py MagneticField -o --hd
