class ControlPoint{
    constructor(id, x_density, y_intensity, xPixel, yPixel) {
        this.id = id;
        this.xDensity = x_density;          //value in the range [0,1], depicted on the x axis
        this.yIntensity = y_intensity;      //value in the range [0,1], depicted on the y axis
        this.xPixel = xPixel;                    //x value on the screen, needed for drawing
        this.yPixel = yPixel;                    //y value on the screen, needed for drawing
    }

}

class TransferFunction{
    constructor(width, height, domElement, numControlPoints, numBins) {
        let that = this;
        this.numControlpoints = numControlPoints;
        this.numBins = numBins;
        this.lines = {};

        this.svg = domElement
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = this.svg.node().getBoundingClientRect().height;

        this.margin = {top: 30, right: 50, bottom: this.height / 4, left: 50};

        this.density_scale = d3.scaleLinear()
            .domain([0,1])
            .range([this.margin.left, this.width - this.margin.left - this.margin.right]);

        this.intensity_scale = d3.scaleLinear()
            .domain([0,1])
            .range([this.height - this.margin.bottom - this.margin.top, this.margin.top]);

        // density histogram
        let dummy = [];
        for(let i = 0; i < numBins; i++){
            dummy.push(i);
        }
        let bins = d3.bin().thresholds(numBins)(dummy);
        this.histogram = this.svg.append("g")
            .attr("transform", function() {
                return "translate("+ 0 + "," + (that.height - that.margin.bottom - that.margin.top) + ")";
            })
            .selectAll("rect")
            .data(bins)
            .enter().append("rect");

        let density_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (this.height - this.margin.bottom - this.margin.top) + ")")
            .call(d3.axisBottom().scale(this.density_scale));

        // x axis label
        density_axis.append("text")
            .style("text-anchor", "middle")
            .attr("x", this.width/2 - this.margin.right)
            .attr("y", this.margin.top)
            .attr("fill", "white")
            .text("density");

        let intensity_axis = this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + this.margin.left + ")")
            .call(d3.axisLeft().scale(this.intensity_scale));

        // y axis label
        intensity_axis.append("text")
            .style("text-anchor", "middle")
            .attr("y", -30)
            .attr("x", -(this.height - this.margin.bottom)/2 - this.margin.top)
            .attr("transform", "rotate(-90)")
            .attr("fill", "white")
            .text("intensity");

        this.anchorPoint1 = {x: this.density_scale(0), y: this.intensity_scale(0)};
        this.anchorPoint2 = {x: this.density_scale(1), y: this.intensity_scale(1)};

        this.path = d3.line()
            .x(function(d) {
                return d.xPixel;
            })
            .y(function(d) {
                return d.yPixel;
            });

        let x1 = 0.0, x2 = 0.33, x3 = 0.66, x4 = 1.0;
        let y1 = 1.0, y2 = 0.9, y3 = 0.8, y4 = 0.7;
        this.initControlPoints([[x1, y1], [x2, y1], [x3, y1], [x4, y1]], "#ddd", "opacityLine");
        this.initControlPoints([[x1, y2], [x2, y2], [x3, y2], [x4, y2]], "#8B0000", "redLine");
        this.initControlPoints([[x1, y3], [x2, y3], [x3, y3], [x4, y3]], "#35baf6", "blueLine");
        this.initControlPoints([[x1, y4], [x2, y4], [x3, y4], [x4, y4]], "#006400", "greenLine");

    }

    setHistogramData(data, exp){
        let that = this;

        let bins = d3.bin()
            .domain([0.0, 1.0])
            .thresholds(this.numBins)(data);

        let max = d3.max(bins, d => d.length);
        let valueRange = [0, max];

        //let yRange = [this.height - this.margin.bottom, this.margin.bottom];
        let yRange = [this.margin.bottom, 0];
        let y = d3.scalePow()
            .exponent(exp)
            .domain(valueRange).nice()
            .range(yRange);

        let len = function(d){ return y(0) - y(d.length); }

        this.histogram.data(bins)
            .join("rect")
            .transition().duration(500)
            .attr("x", d => that.density_scale(d.x0) + 1)
            .attr("width", d => Math.max(0, that.density_scale(d.x1) - that.density_scale(d.x0) - 1))
            .attr("y", () => y(max))
            .attr("height", d => len(d))
            .attr("fill", "#444"); //d => color(d.length)
    }

    initControlPoints(points, color, def){
        let that = this;
        let controlPoints = [];
        points.forEach((p,i) => controlPoints.push(new ControlPoint(i, p[0], p[1],
            that.density_scale(p[0]), that.intensity_scale(p[1]))));

        this.lines[def] = controlPoints;
        this.appendPath(controlPoints, color, def);
        this.appendControlPoints(controlPoints, color, def);
    }

    updatePath(data, def){
        d3.select("svg").select("#"+def).attr("d", this.path(data));
    }

    getDensityIntensity(event){
        return {
            x: this.density_scale.invert(event.offsetX),
            y: this.intensity_scale.invert(event.offsetY)
        }
    }

    //to draw a path between the control points of a channel (RGB, opacity)
    appendPath(data, color, def){
        let that = this;

        this.svg
            .append("path")
            .attr("id", def)
            .attr("d", this.path(data))
            .attr("stroke", color)
            .attr("stroke-width", 4)
            .attr("fill", "none")
            .on("click", click);

        function click(event){
            // add control point
            if(event.ctrlKey){
                let p = that.getDensityIntensity(event);
                let index = data.length;
                console.log(data);
                for(let i = 0; i < data.length; i++){
                    if(data[i].xDensity > p.x){
                        index = i;
                        break;
                    }
                }
                let controlPoint = new ControlPoint(index, p.x, p.y,
                    that.density_scale(p.x), that.intensity_scale(p.y));
                data.splice(index, 0, controlPoint);

                that.updatePath(data, def);
                that.appendControlPoints(data, color, def);
                that.lines[def] = data;

                requestAnimationFrame(paint);
            }
        }
    }

    //to draw the control points as circles
    //every control point can be dragged to a new location
    //the path is updated accordingly
    appendControlPoints(data, color, def){
        let that = this;

        // not the most elegant solution, tbh...
        // todo: try join
        d3.select("svg").selectAll("."+def).remove();

        this.svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", def)
            .attr("r", 8)
            .attr("cx", function(d) {return d.xPixel;})
            .attr("cy", function(d) {return d.yPixel;})
            .attr("fill", color)
            .on("click", click)
            .call(d3.drag()
                .subject(d3.select(this))
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );

        function click(event){
            // remove control point
            if(event.altKey){
                console.log("remove me!");
                let p = that.getDensityIntensity(event);
                let eps = 0.01;
                for(let i = 0; i < data.length; i++){
                    let x = data[i].xDensity;
                    let y = data[i].yIntensity;
                    if(Math.abs(p.x - x) < eps && Math.abs(p.y - y) < eps){
                        data.splice(i, 1);
                        break;
                    }
                }
                console.log(data);

                d3.select(this).remove();
                that.updatePath(data, def);
                that.lines[def] = data;

                requestAnimationFrame(paint);
            }
        }

        function dragstarted() {
            d3.select(this).raise().attr("stroke", "black");
        }

        function dragged(event, d) {

            //update the pixel coordinates
            var checked = check(event.x, event.y);

            d3.select(this)
                .attr("cx", d.xPixel = checked.x)
                .attr("cy", d.yPixel = checked.y);

            //update the density/intensity values
            d.xDensity = that.density_scale.invert(d.xPixel);
            d.yIntensity =  that.intensity_scale.invert(d.yPixel);

            that.updatePath(data, def);

        }

        function dragended() {
            d3.select(this).attr("stroke", null);
            requestAnimationFrame(paint);
        }

        //make sure the control points stay in the axis coordinate space
        function check(x, y){

            let xCheck = x;
            let yCheck = y;

            if (x < that.anchorPoint1.x){ xCheck = that.anchorPoint1.x; }
            if (x > that.anchorPoint2.x){ xCheck = that.anchorPoint2.x; }

            if (y > that.anchorPoint1.y){ yCheck = that.anchorPoint1.y; }
            if (y < that.anchorPoint2.y){ yCheck = that.anchorPoint2.y; }

            return {x: xCheck, y: yCheck};


        }
    }

    getControlPoints(type){

        return this.lines[type];

    }






}

