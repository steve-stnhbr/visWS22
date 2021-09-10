class HistogramSlider{
    constructor(width, height, margin, domain, domElement, numBins){
        this.width = width;
        this.height = height;
        this.data = null;
        this.domain = domain;

        this.xRange = [margin.left, width - margin.right];
        this.yRange = [height - margin.bottom, margin.top];
        this.x = d3.scaleLinear()
            .domain(this.domain)
            .range(this.xRange);
        this.y = null;

        console.log(domElement);

        this.svg = domElement
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.numBins = numBins;
        let dummy = [];
        for(let i = 0; i < numBins; i++){
            dummy.push(i);
        }
        let bins = d3.bin().thresholds(numBins)(dummy);
        this.histogram = this.svg.append("g")
            .selectAll("rect")
            .data(bins)
            .enter().append("rect");

        this.pointerX = 0;
        this.sliderX = 0;

        let sliderMargin = ({top: 0, right: 4, bottom: 0, left: 4});
        this.sliderWidth = (this.width / this.numBins + sliderMargin.left + sliderMargin.right);

        let drag = d3.drag()
            .on("start", event => this.#dragStarted(event))
            .on("drag", event => this.#dragging(event))
            .on("end", event => this.#dragStopped(event));

        this.sliderGroup = this.svg.append("g")
            .call(drag);

        this.slider = this.sliderGroup.append("rect")
            .attr("height", this.height + sliderMargin.top + sliderMargin.bottom)
            .attr("width", this.sliderWidth)
            .attr('stroke-width', '5')
            .attr('stroke', 'black')
            .attr("fill", "white")
            .attr("fill-opacity", 0.5);

        let textBoxWidth = this.sliderWidth + sliderMargin.right + sliderMargin.left;
        this.sliderTextBackground = this.sliderGroup.append("rect")
            .attr("height", 20)
            .attr("width", textBoxWidth)
            .attr("x", this.sliderWidth / 2 - textBoxWidth / 2)
            .attr("y", 0)
            .attr("fill", "black");

        this.sliderText = this.sliderGroup.append("text")
            .attr("x", this.sliderWidth / 2 - 13)
            .attr("y", 17)
            .style("fill", "white")
            .text("");

        this.duration = 0;
    }

    setData(data, exp){
        let that = this;

        let bins = d3.bin()
            .domain(this.domain)
            .thresholds(this.numBins)(data);

        let max = d3.max(bins, d => d.length);
        let valueRange = [0, max];

        this.y = d3.scalePow()
            .exponent(exp)
            .domain(valueRange).nice()
            .range(this.yRange);

        let color = d3.scalePow()
            .exponent(exp)
            .domain(valueRange)
            .range(["#fee8c8", "#e34a33"])
            .interpolate(d3.interpolateHcl);

        let len = function(d){ return that.y(0) - that.y(d.length); }

        this.histogram.data(bins)
            .join("rect")
            .transition().duration(500)
            .attr("x", d => that.x(d.x0) + 1)
            .attr("width", d => Math.max(0, that.x(d.x1) - that.x(d.x0) - 1))
            .attr("y", d => (that.y(0) - that.y(max)) / 2 - len(d)/2)
            .attr("height", d => len(d))
            .attr("fill", d => color(d.length));

        this.histogram.on("click", function(event, d){
            console.log(event.x);
            that.sliderX = event.x - that.sliderWidth / 2;
            that.slider.attr("stroke", "black");
            that.duration = 500; 
            that.#setSlider();
        })
    }

    #dragStarted(event){
        this.slider.attr("fill", "red");
        this.pointerX = event.x;
    }
    #dragStopped(){
        this.slider.attr("fill", "white");
    }

    #dragging(event){
        let xin = Math.min(Math.max(event.x, 0), this.width - this.sliderWidth);
        let dx = xin - this.pointerX;
        this.pointerX = xin;
        this.sliderX += dx;
        this.duration = 0;
        this.#setSlider();
    }

    #setSlider(){
        let that = this;
        this.sliderGroup.transition().duration(this.duration).attr("transform", function() {
            return "translate("+ (that.sliderX) + "," + 0 + ")";
        });
        this.sliderText.text(this.getSliderValue().toFixed(2));
        requestAnimationFrame(paint);
    }

    getSliderValue(){
        return this.x.invert(this.sliderX);
    }

    setSliderValue(value){
        this.duration = 500;
        this.sliderX = this.x(value);
        this.#setSlider();
    }

}