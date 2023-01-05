var FishBowlFps = (() => {

    /**
     * https://testdrive-archive.azurewebsites.net/performance/fishbowl/
     * 소스를 활용해서 간단하게 만들어 보았습니다.
     */

    var SINGLE_CYCLE = 16.7;
    var fishBowl;
    var imgFish;
    var FISH_COUNT = 3000;

    return {
        test: testFPS
    }

    function testFPS(count) {
        const divWrap = document.createElement('div');
        const div = document.createElement('div');
        const canvas = document.createElement('canvas');
        divWrap.id = 'FishBowlArea';

        canvas.id = 'FishBowlCanvas';
        canvas.style.opacity = '0';

        div.id = 'FPS';
        div.style.background = 'yellow';
        div.style.width = 'fit-content';
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.left = '0';
        div.style.zIndex = '999999';

        divWrap.append(canvas);
        divWrap.append(div);
        document.querySelector('body').append(divWrap);

        FISH_COUNT = count || FISH_COUNT;
        const fpsMeter = Initialize();
        setInterval(x => {
            document.querySelector("#FPS").innerHTML = (getMax60(fpsMeter.fpsMeterCurrentValue) + ' FPS');
        }, 1000);
    }

    function getMax60(value) {
        if (value > 58) return 60;
        return Math.floor(value);
    }

    function Initialize() {
        imgFish = new Image();
        imgFish.src = "https://testdrive-archive.azurewebsites.net/performance/fishbowl/Images/FishStrip.png";

        fishBowl = new FishBowl();
        fishBowl.SetFishCount(FISH_COUNT);

        const fpsMeter = new FPSMeter();

        const performance = new Performance(fpsMeter);
        performance.BeginTrending();

        setInterval(() => {
            performance.BeginDrawLoop();
            fishBowl.Draw();
            fpsMeter.calculate();
            performance.FinishDrawLoop();
        }, SINGLE_CYCLE);

        return fpsMeter;
    }

    function FishBowl() {
        this.fish = [];
        this.canvas = document.getElementById("FishBowlCanvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px";
        this.canvas.setAttribute("width", "10px");
        this.canvas.setAttribute("height", "10px");

        this.Draw = function () {
            this.context.clearRect(0, 0, 10, 10);
            this.fish.forEach(oneFish => oneFish.Draw());
        }

        this.SetFishCount = function (count) {
            this.fish = [];
            for (let i = 0; i < count - 1; i++) {
                this.AddFish(false);
            }
        }

        this.AddFish = function AddFish(type) {
            var f = new Fish();
            f.InitializeRandom();
            this.fish.push(f);
        }
    }

    function Fish() {

        this.MAX_SIZE = 52;
        this.MIN_SIZE = 16;

        this.Draw = function () {
            fishBowl.context.save();
            fishBowl.context.drawImage(imgFish, 400 * this.flutterIndex, 0, 400, 400, -this.width, -this.height, this.width * 2, this.height * 2);
            fishBowl.context.restore();
        };

        this.InitializeRandom = function () {
            this.width = (Math.random() * this.MAX_SIZE) + this.MIN_SIZE;
            this.height = this.width - (Math.random() * 3);
            this.flutterIndex = Math.round(Math.random() * 8);
        };
    }


    function FPSMeter() {
        this.fpsMeterCurrentValue = 0;
        this.fpsMeterTargetValue = 0;

        this.calculate = function () {
            if (this.fpsMeterCurrentValue > 20) {
                this.fpsMeterCurrentValue += (this.fpsMeterTargetValue - this.fpsMeterCurrentValue) * 0.03;
            } else {
                this.fpsMeterCurrentValue += (this.fpsMeterTargetValue - this.fpsMeterCurrentValue) * 0.5;
            }
        }
    }

    function Performance(fpsMeter) {

        this.stopDrawTime = 0;
        this.previousStopDrawTime = 0;
        this.currentDrawTime = 0;
        this.delta = 0;
        this.rollingAverageDrawTime = "";
        this.rollingAverageCounter = 0;
        this.rollingAverageSum = 0;
        this.rollingAverageFPS = 0;

        this.BeginTrending = function () {
            this.previousStopDrawTime = new Date();
        }

        this.BeginDrawLoop = function () {
            this.startDrawingTime = new Date();
        }

        this.FinishDrawLoop = function () {
            var now = new Date();
            this.stopDrawTime = now.valueOf();
            this.currentDrawTime = this.stopDrawTime - this.startDrawingTime.valueOf();
            this.delta = Math.floor(this.stopDrawTime - this.previousStopDrawTime - 17);
            if (this.delta > 0) this.currentDrawTime += this.delta;
            this.previousStopDrawTime = this.stopDrawTime;
            this.rollingAverageCounter++;
            this.rollingAverageSum += this.currentDrawTime;
            if (this.rollingAverageCounter === 32) {
                this.rollingAverageDrawTime = this.rollingAverageSum / this.rollingAverageCounter;
                this.rollingAverageCounter = 0;
                this.rollingAverageSum = 0;
                this.rollingAverageFPS = Math.min(1000 / this.rollingAverageDrawTime, 60);
                this.rollingAverageFPS = (this.rollingAverageFPS < (60 * 0.95)) ? this.rollingAverageFPS : 60;
                fpsMeter.fpsMeterTargetValue = this.rollingAverageFPS;
            }
        }
    }
})();

FishBowlFps.test();
