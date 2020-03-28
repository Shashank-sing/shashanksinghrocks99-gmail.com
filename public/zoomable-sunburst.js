const zswidth = window.innerWidth,
    zsheight = window.innerHeight,
    maxRadius = (Math.min(zswidth, zsheight) / 2) - 5;

const formatNumber = d3.format(',d');

const zsx = d3.scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

const zsy = d3.scaleSqrt()
    .range([maxRadius * .1, maxRadius]);

const zscolor = d3.scaleOrdinal([
    "#912EC0",
    "#E51C9D",
    "#FF4D75",
    "#FF8A56",
    "#FFC44E",
    "#F9F871",
]);


const partition = d3.partition();

const arc = d3.arc()
    .startAngle(d => zsx(d.x0))
    .endAngle(d => zsx(d.x1))
    .innerRadius(d => Math.max(0, zsy(d.y0)))
    .outerRadius(d => Math.max(0, zsy(d.y1)));

const middleArcLine = d => {
    const halfPi = Math.PI / 2;
    const angles = [zsx(d.x0) - halfPi, zsx(d.x1) - halfPi];
    const r = Math.max(0, (zsy(d.y0) + zsy(d.y1)) / 2);

    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) { angles.reverse(); }

    const path = d3.path();
    path.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return path.toString();
};

const textFits = d => {
    const CHAR_SPACE = 6;

    const deltaAngle = zsx(d.x1) - zsx(d.x0);
    const r = Math.max(0, (zsy(d.y0) + zsy(d.y1)) / 2);
    const perimeter = r * deltaAngle;

    return d.data.name.length * CHAR_SPACE < perimeter;
};

const zssvg = d3.select('#zoomable-sunburst')
    .style('width', '80vw')
    .style('height', '80vh')
    .attr('viewBox', `${-zswidth / 2} ${-zsheight / 2} ${zswidth} ${zsheight}`)
    .on('click', () => focusOn()); // Reset zoom on canvas click

d3.json('https://raw.githubusercontent.com/Shashank-sing/shashanksinghrocks99-gmail.com/master/export.json', (error, root) => {
    if (error) throw error;

    root = d3.hierarchy(root);
    root.sum(d => d.size);

    const slice = zssvg.selectAll('g.slice')
        .data(partition(root).descendants());

    slice.exit().remove();

    const newSlice = slice.enter()
        .append('g').attr('class', 'slice')
        .on('click', d => {
            d3.event.stopPropagation();
            focusOn(d);
        });

    newSlice.append('title')
        .text(d => d.data.name + '\n' + formatNumber(d.value));

    newSlice.append('path')
        .attr('class', 'main-arc')
        .style('fill', d => zscolor((d.children ? d : d.parent).data.name))
        .attr('d', arc);

    newSlice.append('path')
        .attr('class', 'hidden-arc')
        .attr('id', (_, i) => `hiddenArc${i}`)
        .attr('d', middleArcLine);

    const text = newSlice.append('text')
        .attr('display', d => textFits(d) ? null : 'none');

    // Add white contour
    text.append('textPath')
        .attr('startOffset', '50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
        .text(d => d.data.name)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width', 0)
        .style('stroke-linejoin', 'round');

    text.append('textPath')
        .attr('startOffset', '50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
        .text(d => d.data.name);
});

function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
    // Reset to top-level if no data point specified

    const transition = zssvg.transition()
        .duration(750)
        .tween('scale', () => {
            const xd = d3.interpolate(zsx.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(zsy.domain(), [d.y0, 1]);
            return t => { zsx.domain(xd(t)); zsy.domain(yd(t)); };
        });

    transition.selectAll('path.main-arc')
        .attrTween('d', d => () => arc(d));

    transition.selectAll('path.hidden-arc')
        .attrTween('d', d => () => middleArcLine(d));

    transition.selectAll('text')
        .attrTween('display', d => () => textFits(d) ? null : 'none');

    moveStackToFront(d);

    //

    function moveStackToFront(elD) {
        zssvg.selectAll('.slice').filter(d => d === elD)
            .each(function (d) {
                this.parentNode.appendChild(this);
                if (d.parent) { moveStackToFront(d.parent); }
            })
    }
}