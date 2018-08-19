// inspired from https://codepen.io/tyler-murphy/pen/tHsAu

var slider = {

    get_position: function() {
        var marker_pos = $('#marker').position();
        var left_pos = marker_pos.left + slider.marker_size / 2;
        var top_pos = marker_pos.top + slider.marker_size / 2;

        let scaleX = slider.scale
        let scaleY = slider.scale

        slider.position = {
            left: left_pos,
            top: top_pos,
            x: Math.round(
                    slider.scale * // scaleX *
                    slider.round_factor.x *
                    (left_pos * slider.xmax / slider.width)) /
                slider.round_factor.x,
            y: Math.round(
                    slider.scale * // scaleY *
                    (slider.round_factor.y *
                        (slider.height - top_pos) * slider.ymax / slider.height)) /
                slider.round_factor.y,
        };

        return [slider.position.x, slider.position.y]

    },

    display_position: function() {
        document.getElementById("coord").innerHTML = 'r: ' + slider.position.x.toString() + '<br> t: ' + slider.position.y.toString();
    },

    draw: function(x_size, y_size, xmax, ymax, marker_size, round_to) {

        if ((x_size === undefined) && (y_size === undefined) && (xmax === undefined) && (ymax === undefined) && (marker_size === undefined) && (round_to === undefined)) {
            x_size = 150;
            y_size = 150;
            xmax = 1;
            ymax = 1;
            marker_size = 20;
            round_to = 2;
        };

        slider.marker_size = marker_size;
        slider.height = y_size;
        slider.width = x_size;
        slider.xmax = xmax;
        slider.ymax = ymax;
        round_to = Math.pow(10, round_to);
        slider.round_factor = {
            x: round_to,
            y: round_to,
        };

        $("#markerbounds").css({
            "width": (x_size + marker_size).toString() + 'px',
            "height": (y_size + marker_size).toString() + 'px',
        });
        $("#box").css({
            "width": x_size.toString() + 'px',
            "height": y_size.toString() + 'px',
            "top": marker_size / 2,
            "left": marker_size / 2,
        });
        $("#marker").css({
            "width": marker_size.toString() + 'px',
            "height": marker_size.toString() + 'px',
        });

        $("#coord").css({
            "top": x_size + marker_size / 2
        });

        $("#widget").css({
            "width": (x_size + marker_size).toString() + 'px',
        });

        slider.get_position();
        slider.display_position();

    },

};

var updatePosition = function() {}

$("#marker").draggable({
    containment: "#markerbounds",
    drag: function() {
        slider.get_position();
        slider.display_position();
        updatePosition()
    },
});

slider.scale = Math.PI
slider.scaleX = false
slider.scaleY = false

//syntax for rendering is:
//  slider.render(width, height, width-range, height-range, marker size, output decimal places)

slider.draw(150, 150, 1, 1, 20, 2);

// check to make sure the defaults work:
//slider.draw();