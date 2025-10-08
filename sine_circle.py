from manim import *
import numpy as np

class SineCircleVisualization(MovingCameraScene):
    def construct(self):
        self.camera.background_color = WHITE
        angle_tracker = ValueTracker(0)

        circle = Circle(radius=1.0, color=BLACK)
        circle.shift(LEFT * 3.5)

        reference_dots = VGroup()
        reference_angles = [0, PI/2, PI, 3*PI/2]
        for angle in reference_angles:
            dot = Dot(
                circle.get_center() + 1.0 * np.array([np.cos(angle), np.sin(angle), 0]),
                color=BLACK,
                radius=0.06
            )
            reference_dots.add(dot)

        angle_labels = VGroup(
            MathTex("0", color=BLACK).scale(0.6).next_to(
                circle.get_center() + 1.0 * np.array([np.cos(0), np.sin(0), 0]), RIGHT
            ),
            MathTex(r"\frac{\pi}{2}", color=BLACK).scale(0.6).next_to(
                circle.get_center() + 1.0 * np.array([np.cos(PI/2), np.sin(PI/2), 0]), UP
            ),
            MathTex(r"\pi", color=BLACK).scale(0.6).next_to(
                circle.get_center() + 1.0 * np.array([np.cos(PI), np.sin(PI), 0]), LEFT
            ),
            MathTex(r"\frac{3\pi}{2}", color=BLACK).scale(0.6).next_to(
                circle.get_center() + 1.0 * np.array([np.cos(3*PI/2), np.sin(3*PI/2), 0]), DOWN
            )
        )

        axes = Axes(
            x_range=[0, 2*PI, PI/2],
            y_range=[-1.5, 1.5, 0.5],
            x_length=6,
            y_length=3,
            axis_config={"color": BLACK},
            tips=False
        ).shift(RIGHT * 2.5)

        x_labels = VGroup(
            MathTex("0", color=BLACK).scale(0.7).next_to(axes.c2p(0, 0), DOWN),
            MathTex(r"\frac{\pi}{2}", color=BLACK).scale(0.7).next_to(axes.c2p(PI/2, 0), DOWN),
            MathTex(r"\pi", color=BLACK).scale(0.7).next_to(axes.c2p(PI, 0), DOWN),
            MathTex(r"\frac{3\pi}{2}", color=BLACK).scale(0.7).next_to(axes.c2p(3*PI/2, 0), DOWN),
            MathTex(r"2\pi", color=BLACK).scale(0.7).next_to(axes.c2p(2*PI, 0), DOWN)
        )

        y_labels = VGroup(
            MathTex("1", color=BLACK).scale(0.7).next_to(axes.c2p(0, 1), LEFT),
            MathTex("-1", color=BLACK).scale(0.7).next_to(axes.c2p(0, -1), LEFT)
        )

        radius_line = always_redraw(lambda: Line(
            circle.get_center(),
            circle.get_center() + 1.0 * np.array([
                np.cos(angle_tracker.get_value()),
                np.sin(angle_tracker.get_value()),
                0
            ]),
            color=BLACK
        ))

        moving_dot = always_redraw(lambda: Dot(
            circle.get_center() + 1.0 * np.array([
                np.cos(angle_tracker.get_value()),
                np.sin(angle_tracker.get_value()),
                0
            ]),
            color=BLACK,
            radius=0.08
        ))

        connection_line = always_redraw(lambda: DashedLine(
            moving_dot.get_center(),
            axes.c2p(angle_tracker.get_value(), np.sin(angle_tracker.get_value())),
            color=BLACK,
            dash_length=0.1
        ))

        sine_curve = TracedPath(
            lambda: axes.c2p(angle_tracker.get_value(), np.sin(angle_tracker.get_value())),
            stroke_color=BLACK,
            stroke_width=3
        )

        self.add(circle, reference_dots, angle_labels, axes, x_labels, y_labels)
        self.add(radius_line, moving_dot, connection_line, sine_curve)

        self.play(
            angle_tracker.animate.set_value(2 * PI),
            run_time=8,
            rate_func=linear
        )

        self.wait(1)
