from manim import *
import numpy as np

class TubeConstruction(ThreeDScene):
    def construct(self):
        # Configuration
        path_length = 4
        circle_segments = 8
        tube_radius = 1.1
        tube_length = 4.5

        # Colors (text dark for white bg after keying)
        vertex_color = "#3A6B8C"
        body_face_color = "#4A90A4"
        cap_face_color = "#C27C7C"
        cap_vertex_color = "#8B5A5A"
        edge_color = "#555555"
        highlight_color = "#B8860B"
        text_color = "#333333"

        # Camera
        self.set_camera_orientation(phi=65 * DEGREES, theta=-35 * DEGREES)

        # Generate vertices (tube along X axis)
        vertices = []
        for i in range(path_length):
            t = i / (path_length - 1)
            x = t * tube_length - tube_length / 2
            ring = []
            for j in range(circle_segments):
                theta = (j / circle_segments) * TAU
                y = tube_radius * np.cos(theta)
                z = tube_radius * np.sin(theta)
                ring.append(np.array([x, y, z]))
            vertices.append(ring)

        # ========================================
        # STAGE 1: Generate Vertices
        # ========================================
        title1 = Text("1. Generate Vertices", font="SF Pro Display", font_size=42, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title1)

        vertex_dots = VGroup()

        for i in range(path_length):
            for j in range(circle_segments):
                pos = vertices[i][j]
                dot = Dot3D(point=pos, radius=0.08, color=vertex_color)
                vertex_dots.add(dot)
                self.play(FadeIn(dot, scale=0.5), run_time=0.04)

        self.wait(0.3)

        # ========================================
        # STAGE 2: Set Triangle Indices
        # ========================================
        self.remove(title1)
        title2 = Text("2. Set Triangle Indices", font="SF Pro Display", font_size=42, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title2)

        all_faces = VGroup()
        highlight_edges = None

        for segment in range(path_length - 1):
            for i in range(circle_segments):
                current = vertices[segment][i]
                next_in_ring = vertices[segment][(i + 1) % circle_segments]
                current_next = vertices[segment + 1][i]
                next_next = vertices[segment + 1][(i + 1) % circle_segments]

                tri1 = Polygon(
                    current, next_in_ring, current_next,
                    fill_color=body_face_color, fill_opacity=0.75,
                    stroke_color=edge_color, stroke_width=1.5,
                    shade_in_3d=True
                )
                tri2 = Polygon(
                    next_in_ring, next_next, current_next,
                    fill_color=body_face_color, fill_opacity=0.75,
                    stroke_color=edge_color, stroke_width=1.5,
                    shade_in_3d=True
                )

                quad_edges = VGroup(
                    Line(current, next_in_ring, color=highlight_color, stroke_width=4),
                    Line(next_in_ring, next_next, color=highlight_color, stroke_width=4),
                    Line(next_next, current_next, color=highlight_color, stroke_width=4),
                    Line(current_next, current, color=highlight_color, stroke_width=4),
                )

                anims = [FadeIn(tri1), FadeIn(tri2), FadeIn(quad_edges)]
                if highlight_edges is not None:
                    anims.append(FadeOut(highlight_edges))

                self.play(*anims, run_time=0.06)
                highlight_edges = quad_edges
                all_faces.add(tri1, tri2)

        self.play(FadeOut(highlight_edges), run_time=0.1)
        self.wait(0.2)

        # ========================================
        # STAGE 3: Create End Caps
        # ========================================
        self.remove(title2)
        title3 = Text("3. Create End Caps", font="SF Pro Display", font_size=42, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title3)

        # START CAP
        start_center = np.array([-tube_length / 2, 0, 0])
        start_dot = Dot3D(point=start_center, radius=0.1, color=cap_vertex_color)
        self.play(FadeIn(start_dot, scale=0.5), run_time=0.1)
        vertex_dots.add(start_dot)

        for i in range(circle_segments):
            tri = Polygon(
                start_center, vertices[0][(i + 1) % circle_segments], vertices[0][i],
                fill_color=cap_face_color, fill_opacity=0.75,
                stroke_color=edge_color, stroke_width=1.5,
                shade_in_3d=True
            )
            self.play(FadeIn(tri), run_time=0.06)
            all_faces.add(tri)

        # END CAP
        end_center = np.array([tube_length / 2, 0, 0])
        end_dot = Dot3D(point=end_center, radius=0.1, color=cap_vertex_color)
        self.play(FadeIn(end_dot, scale=0.5), run_time=0.1)
        vertex_dots.add(end_dot)

        for i in range(circle_segments):
            tri = Polygon(
                end_center, vertices[path_length - 1][i], vertices[path_length - 1][(i + 1) % circle_segments],
                fill_color=cap_face_color, fill_opacity=0.75,
                stroke_color=edge_color, stroke_width=1.5,
                shade_in_3d=True
            )
            self.play(FadeIn(tri), run_time=0.06)
            all_faces.add(tri)

        self.wait(0.2)

        # ========================================
        # STAGE 4: Complete Tube Mesh
        # ========================================
        self.remove(title3)
        title4 = Text("Complete Tube Mesh", font="SF Pro Display", font_size=48, color=text_color).to_edge(UP)
        self.add_fixed_in_frame_mobjects(title4)

        # Depth sorting updater for rotation
        def sort_by_depth(group):
            camera = self.camera
            phi = camera.get_phi()
            theta = camera.get_theta()
            r = camera.get_distance()
            cam_pos = np.array([
                r * np.sin(phi) * np.cos(theta),
                r * np.sin(phi) * np.sin(theta),
                r * np.cos(phi)
            ])
            for mob in group:
                center = mob.get_center()
                dist = np.linalg.norm(center - cam_pos)
                mob.set_z_index(-dist)

        all_faces.add_updater(sort_by_depth)
        vertex_dots.add_updater(lambda g: [d.set_z_index(1000) for d in g])

        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(4)
        self.stop_ambient_camera_rotation()

        all_faces.remove_updater(sort_by_depth)
        vertex_dots.remove_updater(lambda g: [d.set_z_index(1000) for d in g])
        self.wait(0.5)


# Run: manim -qh tube_construction.py TubeConstruction
