class ControlPoint{
    constructor(id, x_density, y_intensity, xPixel, yPixel) {
        this.id = id;
        this.xDensity = x_density;          //value in the range [0,1], depicted on the x axis
        this.yIntensity = y_intensity;      //value in the range [0,1], depicted on the y axis
        this.xPixel = xPixel;                    //x value on the screen, needed for drawing
        this.yPixel = yPixel;                    //y value on the screen, needed for drawing
    }

    //calculates the xPixel and yPixel values
    //calculateCoordinates(){        }

}

class TransferFunction{
    constructor(width, height, domElement, numControlPoints) {
        this.width = width;
        this.height = height;
        this.numControlpoints = numControlPoints;

        this.svg = domElement
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        var margin = {top: 30, right: 50, bottom: 20, left: 50};

        var density_scale = d3.scaleLinear()
            .domain([0,1])
            .range([margin.left, width - margin.left - margin.right]);

        var intensity_scale = d3.scaleLinear()
            .domain([0,1])
            .range([height - margin.bottom - margin.top, margin.top]);

        var density_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
            .call(d3.axisBottom().scale(density_scale));

        var xAxisLabel = density_axis.append("text")
            .style("text-anchor", "middle")
            .attr("x", width/2 - margin.right)
            .attr("y", margin.top)
            .attr("fill", "white")
            .text("density");

        var intensity_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ")")
            .call(d3.axisLeft().scale(intensity_scale));

        var yAxisLabel = intensity_axis.append("text")
            .style("text-anchor", "middle")
            .attr("y", -30)
            .attr("x", -height/2 - margin.top)
            .attr("transform", "rotate(-90)")
            .attr("fill", "white")
            .text("intensity");


        //initial values for control points (R,G,B and opacity)
        var opacity_data = [];
        let o1 = new ControlPoint(0, 0.2, 0.1, density_scale(0.2), intensity_scale(0.1));
        let o2 = new ControlPoint(1, 0.4, 0.3, density_scale(0.4), intensity_scale(0.3));
        let o3 = new ControlPoint(2, 0.7, 0.6, density_scale(0.7), intensity_scale(0.6));
        opacity_data.push(o1);
        opacity_data.push(o2);
        opacity_data.push(o3);

        var red_data = [];
        let r1 = new ControlPoint(0, 0.2, 0.9, density_scale(0.2), intensity_scale(0.9));
        let r2 = new ControlPoint(1, 0.5, 0.8, density_scale(0.5), intensity_scale(0.8));
        let r3 = new ControlPoint(2, 0.8, 0.6, density_scale(0.8), intensity_scale(0.6));
        red_data.push(r1);
        red_data.push(r2);
        red_data.push(r3);

        var blue_data = [];
        let b1 = new ControlPoint(0, 0.1, 0.5, density_scale(0.1), intensity_scale(0.5));
        let b2 = new ControlPoint(1, 0.4, 0.1, density_scale(0.4), intensity_scale(0.1));
        let b3 = new ControlPoint(2, 0.7, 0.1, density_scale(0.7), intensity_scale(0.1));
        blue_data.push(b1);
        blue_data.push(b2);
        blue_data.push(b3);

        var green_data = [];
        let g1 = new ControlPoint(0, 0.3, 0.7, density_scale(0.3), intensity_scale(0.7));
        let g2 = new ControlPoint(1, 0.5, 0.4, density_scale(0.5), intensity_scale(0.4));
        let g3 = new ControlPoint(2, 0.9, 0.3, density_scale(0.9), intensity_scale(0.3));
        green_data.push(g1);
        green_data.push(g2);
        green_data.push(g3);

        var path = d3.line()
            .x(function(d) {
                return d.xPixel;
            })
            .y(function(d) {
                return d.yPixel;
            });

        //draw circles and lines for RGB and opacity data
        this.appendPath(path, opacity_data, "grey", "opacityLine");
        this.appendPath(path, red_data, "red", "redLine");
        this.appendPath(path, blue_data, "blue", "blueLine");
        this.appendPath(path, green_data, "green", "greenLine");

        this.appendControlPoints(path, opacity_data, "grey", ".opacityLine");
        this.appendControlPoints(path, red_data, "red", ".redLine");
        this.appendControlPoints(path, blue_data, "blue", ".blueLine");
        this.appendControlPoints(path, green_data, "green", ".greenLine");


    }

    //to draw a path between the control points of a channel (RGB, opacity)
    appendPath(path, data, color, def){
        this.svg
            .append("path")
            .attr("class", def)
            .attr("d", path(data))
            .attr("stroke", color)
            .attr("fill", "none");
    }

    //to draw the control points as circles
    //every control point can be dragged to a new location
    //the path is updated accordingly
    appendControlPoints(path, data, color, def){
        this.svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", function(d) {return d.xPixel;})
            .attr("cy", function(d) {return d.yPixel;})
            .attr("fill", color)
            .call(d3.drag()
                .subject(d3.select(this))
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );

        function dragstarted(event) {
            d3.select(this).raise().attr("stroke", "black");
        }

        function dragged(event, d) {
            d3.select(this).attr("cx", d.xPixel = event.x).attr("cy", d.yPixel = event.y);
            d3.select("svg").select(def).attr("d", path(data));
        }

        function dragended(d) {
            d3.select(this).attr("stroke", null);
        }
    }





}

