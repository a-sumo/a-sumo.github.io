from manimlib import *
import numpy as np

class TubeDeformation(ThreeDScene):
    def construct(self):
        # Configuration
        tube_length = 6.0
        tube_radius = 0.5
        wave_freq = 0.8
        wave_amp = 0.8
        circle_segments = 8
        path_segments = 16

        # Colors (adjusted for white background)
        tangent_color = "#E63946"
        normal_color = "#2A9D8F"
        binormal_color = "#E9C46A"
        wireframe_color = "#4A90A4"
        path_color = "#F4A261"
        text_color = BLACK

        # Camera
        frame = self.camera.frame
        frame.set_euler_angles(phi=70 * DEGREES, theta=60 * DEGREES)

        # ========================================
        # Path functions
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
            n = np.array([-t[1], t[0], 0])
            return n / np.linalg.norm(n)

        def binormal_at(x):
            return np.array([0, 0, 1])

        # ========================================
        # STAGE 1: Show the path
        # ========================================
        title1 = Text("1. Sine Wave Path", font_size=36, fill_color=text_color)
        title1.fix_in_frame()
        title1.to_edge(UP)
        self.add(title1)

        path_points = [path_point(x) for x in np.linspace(0, tube_length, 50)]
        center_path = VMobject()
        center_path.set_points_smoothly(path_points)
        center_path.set_stroke(color=path_color, width=4)

        self.play(ShowCreation(center_path), run_time=1)
        self.wait(0.3)

        # ========================================
        # STAGE 2: Show coordinate frames
        # ========================================
        self.remove(title1)
        title2 = Text("2. Moving Coordinate Frame", font_size=36, fill_color=text_color)
        title2.fix_in_frame()
        title2.to_edge(UP)
        self.add(title2)

        # Legend
        legend = VGroup(
            VGroup(Line(ORIGIN, RIGHT*0.3, color=tangent_color, stroke_width=4),
                   Text("T", font_size=20, fill_color=tangent_color)).arrange(RIGHT, buff=0.1),
            VGroup(Line(ORIGIN, RIGHT*0.3, color=normal_color, stroke_width=4),
                   Text("N", font_size=20, fill_color=normal_color)).arrange(RIGHT, buff=0.1),
            VGroup(Line(ORIGIN, RIGHT*0.3, color=binormal_color, stroke_width=4),
                   Text("B", font_size=20, fill_color=binormal_color)).arrange(RIGHT, buff=0.1),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        legend.fix_in_frame()
        legend.to_corner(UL).shift(DOWN*0.6)
        self.play(FadeIn(legend), run_time=0.3)

        # Show frames at key positions
        frame_positions = [0.5, 2.0, 3.5, 5.0]
        frames = Group()

        for x in frame_positions:
            c = path_point(x)
            t = tangent_at(x) * 0.7
            n = normal_at(x) * 0.7
            b = binormal_at(x) * 0.7

            t_arrow = Arrow(c, c + t, color=tangent_color, stroke_width=4, buff=0)
            n_arrow = Arrow(c, c + n, color=normal_color, stroke_width=4, buff=0)
            b_arrow = Arrow(c, c + b, color=binormal_color, stroke_width=4, buff=0)
            dot = Sphere(radius=0.06, color=path_color)
            dot.move_to(c)

            frames.add(Group(dot, t_arrow, n_arrow, b_arrow))

        self.play(*[FadeIn(f) for f in frames], run_time=1)
        self.wait(0.5)

        # ========================================
        # STAGE 3: Show ring construction
        # ========================================
        self.remove(title2)
        title3 = Text("3. Position Vertices in Frame", font_size=36, fill_color=text_color)
        title3.fix_in_frame()
        title3.to_edge(UP)
        self.add(title3)

        formula = Tex(r"\vec{p} = \vec{c} + (\cos\theta \cdot \vec{N} + \sin\theta \cdot \vec{B}) \cdot r",
                      font_size=28, fill_color=text_color)
        formula.fix_in_frame()
        formula.to_edge(DOWN)
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

        ring_lines = VGroup(*[Line(c, p, color=wireframe_color, stroke_width=2) for p in ring_points])
        ring_dots = Group(*[Sphere(radius=0.05, color=wireframe_color).move_to(p) for p in ring_points])
        ring_polygon = Polygon(*ring_points, stroke_color=wireframe_color, stroke_width=2, fill_opacity=0)

        self.play(ShowCreation(ring_lines), run_time=0.5)
        self.play(FadeIn(ring_dots), ShowCreation(ring_polygon), run_time=0.5)
        self.wait(0.3)

        # ========================================
        # STAGE 4: Build wireframe tube
        # ========================================
        self.remove(title3)
        self.remove(formula)
        title4 = Text("4. Construct Tube Wireframe", font_size=36, fill_color=text_color)
        title4.fix_in_frame()
        title4.to_edge(UP)
        self.add(title4)

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

        wireframe = VGroup()

        for ring in all_rings:
            ring_line = Polygon(*ring, stroke_color=wireframe_color, stroke_width=1.5, fill_opacity=0)
            wireframe.add(ring_line)

        for j in range(circle_segments):
            long_points = [all_rings[i][j] for i in range(len(all_rings))]
            long_line = VMobject()
            long_line.set_points_smoothly(long_points)
            long_line.set_stroke(color=wireframe_color, width=1.5)
            wireframe.add(long_line)

        self.play(ShowCreation(wireframe), run_time=1.5)
        self.wait(0.3)

        # ========================================
        # STAGE 5: Final view
        # ========================================
        self.remove(title4)
        title5 = Text("Deformed Tube", font_size=40, fill_color=text_color)
        title5.fix_in_frame()
        title5.to_edge(UP)
        self.add(title5)

        self.play(FadeOut(center_path), FadeOut(frames), FadeOut(legend), run_time=0.5)

        # Rotate camera (rate=0.15 for 4 seconds)
        self.play(
            frame.animate.increment_theta(0.15 * 4),
            run_time=4
        )
        self.wait(0.3)


# Run: manimgl tube_deformation.py TubeDeformation -o --hd
