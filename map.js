d3.json('https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/2482274db871e60195b7196c602700226bdd3a44/practica.json')
    .then((featureCollection) => {
        drawMap(featureCollection);
        drawBars(featureCollection.features[0])
    });

function linspace(start, end, n) {
    var out = [];
    var delta = (end - start) / (n - 1);
    var i = 0;
    while (i < (n - 1)) {
        out.push(start + (i * delta));
        i++;
    }
    out.push(end);
    return out;
}

function drawMap(featureCollection) {
    const svg = d3.select('#mapa')
        .append('svg');

    const width = 600;
    const height = 600;
    svg.attr('width', width)
        .attr('height', height);

    const center = d3.geoCentroid(featureCollection);
    const projection = d3.geoMercator()
        // .scale(100000)
        .fitSize([width * 0.90, height * 0.90], featureCollection)
        .center(center)
        .translate([width / 2, height / 2])

    const pathProjection = d3.geoPath().projection(projection);

    const features = featureCollection.features;

    const groupMap = svg.append('g').attr('class', 'map');
    const subunitsPath = groupMap.selectAll('.subunits')
        .data(features)
        .enter()
        .append('path');

    subunitsPath.attr('d', (d) => {
        d.opacity = 1;
        return pathProjection(d);
    });

    subunitsPath.on('click', function clickSubunit(d) {
        d.opacity = d.opacity ? 0 : 1;
        d3.select(this).attr('opacity', d.opacity);
        console.log(d.properties.name);
        drawBars(d);
    })

    //const color = d3.scaleOrdinal(d3.schemeCategory10);

    const scale = scales['spectralI']
    const color = d3.scaleLinear()
        .domain(linspace(-1, 280, scale.length))
        .range(scale);

    subunitsPath.attr('fill', (d) => color((d.properties.avgprice == null ? -1 : d.properties.avgprice)))

    const legend = svg.append('g').attr('class', 'legend');

    // d3.legendcolor
    const numberOfLegends = scale.length;

    const scaleLegend = d3.scaleLinear()
        .domain([0, numberOfLegends])
        .range([0, width * .50]);

    for (let index = 0; index < numberOfLegends; index += 1) {
        const posy = height * .20 + scaleLegend(index);

        const legendGroup = legend
            .append('g')
            .attr('transform', `translate(${0}, ${posy})`);
        // d3.interpolateViridis
        const rectColor = legendGroup
            .append('rect');

        const lineColor = legendGroup
            .append('line')
            .attr('x', width - 50)
            .attr('y', height * .20)
        ;

        const labelColor = legend
            .append('g')
            .attr('transform', `translate(${0 + 22}, ${posy + 25})`)
            .append('text')
            .text('\u20AC ' + Math.round(linspace(0, 280, scale.length)[numberOfLegends - index - 1]));

        const widthHeight = (height / numberOfLegends) - 2;
        rectColor
            .attr('width', 20)
            .attr('height', widthHeight)
            .attr('fill', scale[numberOfLegends - index - 1])

    }
}

function drawBars(feature) {
    d3.select('#barra').select('svg').remove();
    const svg = d3.select('#barra').append('svg');
    const width = 600;
    const height = 600;
    svg.attr('width', width)
        .attr('height', height);

    const barrioName = feature.properties.name;
    const titulo = svg.append('text')
        .text(barrioName)
        .attr('class', 'Barrio')
        .attr('transform', `translate(${width / 2 - barrioName.length / 2}, ${30})`);

    const dataset = feature.properties.properties; //avgbedrooms;

    const grafico = svg.append('g')
        .attr('transform', `translate(${30}, ${30})`);

    let precios = []
    let cuartos = []
    for (let index = 0; index < dataset.length; index += 1) {
        cuartos.push(dataset[index].bedrooms);
        precios.push(dataset[index].price);
    }
    const widthBarrita = (width-100)/(dataset.length*2);
    const HeighBarrita = height-100;
    const maxBarrita = d3.max(precios);

    for (let index = 0; index < dataset.length; index += 1) {
        const barrita = grafico.append('rect')
            .attr('class', 'bar')
            .attr('x',  widthBarrita*2 + widthBarrita*index*2)
            .attr('y', HeighBarrita - HeighBarrita*(dataset[index].price/maxBarrita))
            .attr('width',widthBarrita)
            .attr('height', HeighBarrita*(dataset[index].price/maxBarrita));
    }

    const scaleX = d3.scaleLinear()
        .domain(0, cuartos.length)
        .range([widthBarrita*2, width-50]);
    const xAxis = d3.axisBottom(scaleX);
    const groupAxisX = svg.append('g');
    groupAxisX
        .attr('transform', `translate(${widthBarrita*2}, ${HeighBarrita+30})`)
        .call(xAxis);

    const scaleY = d3.scaleLinear()
        .domain(0, d3.max(precios))
        .range([0, HeighBarrita]);

    const yAxis = d3.axisRight(scaleY);
    const groupAxisY = svg.append('g');
    groupAxisY
        .attr('transform', `translate(${widthBarrita*4}, ${30})`)
        .call(yAxis);

}

