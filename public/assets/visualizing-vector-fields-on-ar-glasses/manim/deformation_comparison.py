from manimlib import *
import numpy as np

class NaiveOffset(Scene):
    def construct(self):
        outline_color = BLACK
        wrong_color = "#E63946"
        fill_color = "#4A90A4"

        tube_width = 0.7
        tube_length = 2.4
        bend_angle = 50 * DEGREES
        arc_radius = tube_length / bend_angle

        # Straight tube: 3 rings along Y axis
        straight_centers = [
            np.array([0, -tube_length/2, 0]),
            np.array([0, 0, 0]),
            np.array([0, tube_length/2, 0]),
        ]

        # Bent tube along arc curving to the right
        # theta=0 is at center, negative at bottom, positive at top
        arc_angles_param = [-bend_angle/2, 0, bend_angle/2]
        bent_centers = []
        for theta in arc_angles_param:
            x = arc_radius * (1 - np.cos(theta))
            y = arc_radius * np.sin(theta)
            bent_centers.append(np.array([x, y, 0]))

        def create_tube_polygon_straight(centers, width):
            """Straight tube - rings are horizontal"""
            half = width / 2
            points = []
            # Right edge (bottom to top)
            for c in centers:
                points.append(c + np.array([half, 0, 0]))
            # Left edge (top to bottom)
            for c in reversed(centers):
                points.append(c + np.array([-half, 0, 0]))
            return Polygon(*points, stroke_color=outline_color, stroke_width=3,
                          fill_color=fill_color, fill_opacity=0.4)

        def create_tube_polygon_naive(centers, width):
            """Naive bend - rings STAY horizontal (wrong!)"""
            half = width / 2
            points = []
            for c in centers:
                points.append(c + np.array([half, 0, 0]))
            for c in reversed(centers):
                points.append(c + np.array([-half, 0, 0]))
            return Polygon(*points, stroke_color=outline_color, stroke_width=3,
                          fill_color=fill_color, fill_opacity=0.4)

        def create_ring_line_horizontal(center, width, color):
            half = width / 2
            return Line(
                center + np.array([-half, 0, 0]),
                center + np.array([half, 0, 0]),
                color=color, stroke_width=6
            )

        straight_tube = create_tube_polygon_straight(straight_centers, tube_width)
        wrong_tube = create_tube_polygon_naive(bent_centers, tube_width)

        wrong_endcap_top = create_ring_line_horizontal(bent_centers[2], tube_width, wrong_color)
        wrong_endcap_bottom = create_ring_line_horizontal(bent_centers[0], tube_width, wrong_color)

        label = Text("Naive offset", font_size=36, fill_color=wrong_color).to_edge(UP, buff=0.5)

        x_mark = VGroup(
            Line(UP*0.3 + LEFT*0.3, DOWN*0.3 + RIGHT*0.3, stroke_width=7),
            Line(UP*0.3 + RIGHT*0.3, DOWN*0.3 + LEFT*0.3, stroke_width=7)
        , fill_color=wrong_color).shift(RIGHT * 2.5)

        self.play(FadeIn(label), ShowCreation(straight_tube), run_time=0.6)
        self.wait(0.3)
        self.play(Transform(straight_tube, wrong_tube), run_time=1.0)
        self.wait(0.2)
        self.play(ShowCreation(wrong_endcap_top), ShowCreation(wrong_endcap_bottom), run_time=0.4)
        self.play(ShowCreation(x_mark), run_time=0.4)
        self.wait(1.0)


class TNBFrame(Scene):
    def construct(self):
        outline_color = BLACK
        correct_color = "#2A9D8F"
        tangent_color = "#E63946"
        normal_color = "#2A9D8F"
        fill_color = "#4A90A4"

        tube_width = 0.7
        tube_length = 2.4
        bend_angle = 50 * DEGREES
        arc_radius = tube_length / bend_angle

        # Straight tube
        straight_centers = [
            np.array([0, -tube_length/2, 0]),
            np.array([0, 0, 0]),
            np.array([0, tube_length/2, 0]),
        ]

        # Bent tube along arc
        arc_angles_param = [-bend_angle/2, 0, bend_angle/2]
        bent_centers = []
        for theta in arc_angles_param:
            x = arc_radius * (1 - np.cos(theta))
            y = arc_radius * np.sin(theta)
            bent_centers.append(np.array([x, y, 0]))

        def create_tube_polygon_straight(centers, width):
            half = width / 2
            points = []
            for c in centers:
                points.append(c + np.array([half, 0, 0]))
            for c in reversed(centers):
                points.append(c + np.array([-half, 0, 0]))
            return Polygon(*points, stroke_color=outline_color, stroke_width=3,
                          fill_color=fill_color, fill_opacity=0.4)

        def create_tube_polygon_tnb(centers, angles, width):
            """Correct bend - rings perpendicular to tangent"""
            half = width / 2
            points = []
            for c, theta in zip(centers, angles):
                # Normal direction perpendicular to tangent
                # Tangent = (sin(theta), cos(theta))
                # Normal = (cos(theta), -sin(theta)) pointing right of tangent
                normal = np.array([np.cos(theta), -np.sin(theta), 0])
                points.append(c + normal * half)
            for c, theta in zip(reversed(centers), reversed(angles)):
                normal = np.array([np.cos(theta), -np.sin(theta), 0])
                points.append(c - normal * half)
            return Polygon(*points, stroke_color=outline_color, stroke_width=3,
                          fill_color=fill_color, fill_opacity=0.4)

        def create_ring_line_tnb(center, theta, width, color):
            half = width / 2
            normal = np.array([np.cos(theta), -np.sin(theta), 0])
            return Line(center - normal * half, center + normal * half, color=color, stroke_width=6)

        def create_tnb_arrows(center, theta, scale=0.45):
            # Tangent: along the arc
            tang = np.array([np.sin(theta), np.cos(theta), 0]) * scale
            # Normal: perpendicular to tangent
            norm = np.array([np.cos(theta), -np.sin(theta), 0]) * scale
            t_arrow = Arrow(center, center + tang, color=tangent_color, stroke_width=4, buff=0)
            n_arrow = Arrow(center, center + norm, color=normal_color, stroke_width=4, buff=0)
            dot = Dot(center, color="#F4A261", radius=0.06)
            return VGroup(dot, t_arrow, n_arrow)

        straight_tube = create_tube_polygon_straight(straight_centers, tube_width)
        correct_tube = create_tube_polygon_tnb(bent_centers, arc_angles_param, tube_width)

        correct_endcap_top = create_ring_line_tnb(bent_centers[2], arc_angles_param[2], tube_width, correct_color)
        correct_endcap_bottom = create_ring_line_tnb(bent_centers[0], arc_angles_param[0], tube_width, correct_color)

        tnb_frames = VGroup(*[
            create_tnb_arrows(bent_centers[i], arc_angles_param[i])
            for i in range(3)
        ])

        label = Text("TNB frame", font_size=36, fill_color=correct_color).to_edge(UP, buff=0.5)

        check_mark = VMobject(stroke_width=7, color=correct_color)
        check_mark.set_points_as_corners([LEFT*0.25, DOWN*0.25 + RIGHT*0.05, UP*0.35 + RIGHT*0.35])
        check_mark.shift(RIGHT * 2.5)

        legend = VGroup(
            VGroup(Line(ORIGIN, RIGHT*0.4, color=tangent_color, stroke_width=4),
                   Text("T", font_size=24, fill_color=tangent_color)).arrange(RIGHT, buff=0.15),
            VGroup(Line(ORIGIN, RIGHT*0.4, color=normal_color, stroke_width=4),
                   Text("N", font_size=24, fill_color=normal_color)).arrange(RIGHT, buff=0.15),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.15).to_corner(UR).shift(DOWN*0.5 + LEFT*0.3)

        self.play(FadeIn(label), ShowCreation(straight_tube), run_time=0.6)
        self.wait(0.3)
        self.play(Transform(straight_tube, correct_tube), run_time=1.0)
        self.wait(0.2)
        self.play(FadeIn(legend), *[FadeIn(f) for f in tnb_frames], run_time=0.5)
        self.play(ShowCreation(correct_endcap_top), ShowCreation(correct_endcap_bottom), run_time=0.4)
        self.play(ShowCreation(check_mark), run_time=0.4)
        self.wait(1.0)


# manimgl deformation_comparison.py NaiveOffset -o --hd
# manimgl deformation_comparison.py TNBFrame -o --hd
