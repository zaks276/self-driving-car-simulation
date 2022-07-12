document.getElementById('carCount').value = localStorage.getItem('carCount') || 1;
document.getElementById('mutationAmount').value = localStorage.getItem('mutationAmount') || 0.2;

const vehicleCanvas = document.getElementById('vehicleCanvas');
vehicleCanvas.width = 200;

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 500;

const vehicleCtx = vehicleCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(vehicleCanvas.width / 2, vehicleCanvas.width * 0.9);

const N = Number(document.getElementById('carCount').value);

const cars = generateCars(N);
let bestCar = cars[0];

if (!localStorage.getItem('beenHereBefore')) {
    localStorage.setItem('beenHereBefore', 'true');
    localStorage.setItem('{"levels":[{"inputs":[0,0,0,0,0.3294930612435235],"outputs":[1,0,0,1,1,1],"biases":[-0.07222119637284118,0.15467469138401446,0.12877434194214563,0.007990799283424083,-0.04905470830284235,-0.10550014735234318],"weights":[[-0.05974431632581055,-0.27033667912517423,-0.16751775203113078,0.09753848644713706,-0.08827857995632374,-0.09147314272858204],[-0.19207978662640496,0.02849504400710058,0.24982665278657848,-0.12558849412997966,0.06932282603933787,0.3165443454577247],[-0.14667803192757065,0.16697250199124944,0.2727389652220817,0.03862265631309767,-0.03393531677660364,0.1037412009184904],[0.20247754390019604,-0.16272913430334665,-0.32141383672839324,-0.02149957602721969,-0.25610159035168567,-0.018181569073472112],[0.06739705589231534,0.07002702609257076,-0.057069779646098086,0.31441372351359725,0.1159377114568849,0.14482591140009532]]},{"inputs":[1,0,0,1,1,1],"outputs":[1,0,0,0],"biases":[0.04819825307218287,0.037935079314945684,-0.10328799028095771,-0.33336447011484716],"weights":[[0.2522995289088279,0.0903422784586511,-0.08968375043414109,0.07300937413128364],[0.029755332728980288,0.031132425224831194,0.005040439076631775,0.03211486293360685],[-0.10693267040867496,-0.013435358584209162,-0.015652765235913843,0.09401503849033487],[-0.11066696905892995,-0.2242459465018424,-0.004736772998877464,-0.44392142561946885],[0.019221328266091818,-0.16194209671302226,0.032254386197238756,0.005827898671795111],[0.2297598832740882,0.1755137738017809,-0.08488854647526901,-0.20980208478018383]]}]}')
}

if (localStorage.getItem('bestBrain')) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem('bestBrain')
        );

        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, Number(document.getElementById('mutationAmount').value));
        }
    }
}

const traffic = [
    new Vehicle(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Vehicle(road.getLaneCenter(0), -300, 50, 150, 'DUMMY', 2, getRandomColor(), 'truck'),
    new Vehicle(road.getLaneCenter(2), -300, 50, 145, 'DUMMY', 2, getRandomColor(), 'bus'),
    new Vehicle(road.getLaneCenter(0), -500, 50, 150, 'DUMMY', 2, getRandomColor(), 'truck'),
    new Vehicle(road.getLaneCenter(1), -500, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Vehicle(road.getLaneCenter(1), -750, 30, 50, 'DUMMY', 2, getRandomColor()),
    new Vehicle(road.getLaneCenter(2), -700, 30, 50, 'DUMMY', 2, getRandomColor()),
];

animate();

function save() {
    if (confirm('This will update the trained neural network. Are you sure you want to do this?') == true) {
        localStorage.setItem('bestBrain',
            JSON.stringify(bestCar.brain));
    }
}

function discard() {
    if (confirm('This will delete the trained neural network and you will need to train the system again. Are you sure you want to do this?') == true)
        localStorage.removeItem('bestBrain');
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Vehicle(road.getLaneCenter(1), 100, 30, 50, 'AI'));
    }
    return cars;
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        )
    );

    vehicleCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    vehicleCtx.save();
    vehicleCtx.translate(0, -bestCar.y + vehicleCanvas.height * 0.7);

    road.draw(vehicleCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(vehicleCtx);
    }

    vehicleCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(vehicleCtx);
    }
    vehicleCtx.globalAlpha = 1;

    bestCar.draw(vehicleCtx, true);

    vehicleCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}
