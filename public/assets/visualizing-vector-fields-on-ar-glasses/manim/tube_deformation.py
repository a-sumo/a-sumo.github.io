from manim import *
import numpy as np

class TubeDeformation(ThreeDScene):
    def construct(self):
        # Configuration - SIMPLE
        tube_length = 6.0
        tube_radius = 0.5
        wave_freq = 0.8
        wave_amp = 0.8
        circle_segments = 8
        path_segments = 16

        # Colors (black background - will key out)
        tangent_color = "#E63946"      # Bright red
        normal_color = "#2A9D8F"       # Teal
        binormal_color = "#E9C46A"     # Gold
        wireframe_color = "#4A90A4"    # Blue
        path_color = "#F4A261"         # Orange
        text_color = "#AAAAAA"         # Light gray

        # Camera - view horizontal tube
        self.set_camera_orientation(phi=70 * DEGREES, theta=-30 * DEGREES)

        # ========================================
        # Path functions (tube along X axis, deforms in Y)
        # ========================================
        def path_point(x):
            y = np.sin(x * wave_freq) * wave_amp
            return np.array([x - tube_length/2, y, 0])

        def tangent_at(x):
            dy = np.cos(x * wave_freq) * wave_amp * wave_freq
            t = np.array([1.0, dy, 0])
            return t / np.linalg.norm(t)

        def normal_at(x):
            t = tangent_at(x)
            # Perpendicular in XY plane
            n = np.array([-t[1], t[0], 0])
            return n / np.linalg.norm(n)

        def binormal_at(x):
            # Always Z for horizontal tube
            return np.array([0, 0, 1])

        # ========================================
        # STAGE 1: Show the path
        # ========================================
        title1 = Text("1. Sine Wave Path", font_size=36, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title1)

        path_points = [path_point(x) for x in np.linspace(0, tube_length, 50)]
        center_path = VMobject()
        center_path.set_points_smoothly(path_points)
        center_path.set_stroke(color=path_color, width=4)

        self.play(Create(center_path), run_time=1)
        self.wait(0.3)

        # ========================================
        # STAGE 2: Show coordinate frames
        # ========================================
        self.remove(title1)
        title2 = Text("2. Moving Coordinate Frame", font_size=36, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title2)

        # Legend
        legend = VGroup(
            VGroup(Line(ORIGIN, RIGHT*0.3, color=tangent_color, stroke_width=4),
                   Text("T", font_size=20, color=tangent_color)).arrange(RIGHT, buff=0.1),
            VGroup(Line(ORIGIN, RIGHT*0.3, color=normal_color, stroke_width=4),
                   Text("N", font_size=20, color=normal_color)).arrange(RIGHT, buff=0.1),
            VGroup(Line(ORIGIN, RIGHT*0.3, color=binormal_color, stroke_width=4),
                   Text("B", font_size=20, color=binormal_color)).arrange(RIGHT, buff=0.1),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1).to_corner(UL).shift(DOWN*0.6)
        self.add_fixed_in_frame_mobjects(legend)
        self.play(FadeIn(legend), run_time=0.3)

        # Show frames at key positions
        frame_positions = [0.5, 2.0, 3.5, 5.0]
        frames = VGroup()

        for x in frame_positions:
            c = path_point(x)
            t = tangent_at(x) * 0.7
            n = normal_at(x) * 0.7
            b = binormal_at(x) * 0.7

            t_arrow = Arrow3D(c, c + t, color=tangent_color, thickness=0.02)
            n_arrow = Arrow3D(c, c + n, color=normal_color, thickness=0.02)
            b_arrow = Arrow3D(c, c + b, color=binormal_color, thickness=0.02)
            dot = Dot3D(c, radius=0.06, color=path_color)

            frames.add(VGroup(dot, t_arrow, n_arrow, b_arrow))

        self.play(*[FadeIn(f) for f in frames], run_time=1)
        self.wait(0.5)

        # ========================================
        # STAGE 3: Show ring construction
        # ========================================
        self.remove(title2)
        title3 = Text("3. Position Vertices in Frame", font_size=36, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title3)

        formula = MathTex(r"\vec{p} = \vec{c} + (\cos\theta \cdot \vec{N} + \sin\theta \cdot \vec{B}) \cdot r",
                          font_size=28, color=text_color).to_edge(DOWN)
        self.add_fixed_in_frame_mobjects(formula)
        self.play(FadeIn(formula), run_time=0.3)

        # Show ring at one position
        demo_x = 3.0
        c = path_point(demo_x)
        n = normal_at(demo_x)
        b = binormal_at(demo_x)

        ring_points = []
        for j in range(circle_segments):
            theta = (j / circle_segments) * TAU
            offset = (np.cos(theta) * n + np.sin(theta) * b) * tube_radius
            ring_points.append(c + offset)

        # Lines from center to vertices
        ring_lines = VGroup(*[Line3D(c, p, color=wireframe_color, thickness=0.01) for p in ring_points])
        ring_dots = VGroup(*[Dot3D(p, radius=0.05, color=wireframe_color) for p in ring_points])
        ring_polygon = Polygon(*ring_points, stroke_color=wireframe_color, stroke_width=2, fill_opacity=0)

        self.play(Create(ring_lines), run_time=0.5)
        self.play(FadeIn(ring_dots), Create(ring_polygon), run_time=0.5)
        self.wait(0.3)

        # ========================================
        # STAGE 4: Build wireframe tube
        # ========================================
        self.remove(title3)
        self.remove(formula)
        title4 = Text("4. Construct Tube Wireframe", font_size=36, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title4)

        self.play(FadeOut(ring_lines), FadeOut(ring_dots), FadeOut(ring_polygon), run_time=0.3)

        # Generate all rings
        x_positions = np.linspace(0, tube_length, path_segments)
        all_rings = []
        for x in x_positions:
            c = path_point(x)
            n = normal_at(x)
            b = binormal_at(x)
            ring = [c + (np.cos(j/circle_segments * TAU) * n + np.sin(j/circle_segments * TAU) * b) * tube_radius
                    for j in range(circle_segments)]
            all_rings.append(ring)

        # Draw wireframe - rings and longitudinal lines
        wireframe = VGroup()

        # Rings
        for ring in all_rings:
            ring_line = Polygon(*ring, stroke_color=wireframe_color, stroke_width=1.5, fill_opacity=0)
            wireframe.add(ring_line)

        # Longitudinal lines
        for j in range(circle_segments):
            long_points = [all_rings[i][j] for i in range(len(all_rings))]
            long_line = VMobject()
            long_line.set_points_smoothly(long_points)
            long_line.set_stroke(color=wireframe_color, width=1.5)
            wireframe.add(long_line)

        self.play(Create(wireframe), run_time=1.5)
        self.wait(0.3)

        # ========================================
        # STAGE 5: Final view
        # ========================================
        self.remove(title4)
        title5 = Text("Deformed Tube", font_size=40, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title5)

        self.play(FadeOut(center_path), FadeOut(frames), FadeOut(legend), run_time=0.5)

        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(4)
        self.stop_ambient_camera_rotation()
        self.wait(0.3)


# Run: manim -qh tube_deformation.py TubeDeformation -r 1920,1080 --fps 30
