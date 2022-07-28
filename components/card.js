const MCCard = new MCFactory({
    html: `
        <div class="card" data-on-click="onSelect|time">
            <div class="card__image">
                <img data-bind-attr="src|main_img" alt="exercise">
            </div><div class="card__body">
                <div class="card__title" data-bind="title"></div>
                <div class="card__subtitle"><span data-bind="time"></span> minutes</div>
                <div class="card__space"></div>
                <div class="card__preview">
                    <img data-for="exercies" data-bind-attr="src|img" alt="exercise">
                </div>
            </div>
        </div>
    `
});

const DEFAULT_TEXT = 'Carefully perform the exercise shown in the picture';

const TRAININGS = [
    {
        title: 'A Simple worlout',
        time: 2,
        main_img: './img/exercise/1.png',
        exercies: [
            {
                img: './img/exercise/3.png',
                text: 'Stand on one leg, keep your balance. He holds both hands above his head',
                time: 30
            },
            {
                img: './img/exercise/10.png',
                text: DEFAULT_TEXT,
                time: 30
            },
            {
                img: './img/exercise/12.png',
                text: DEFAULT_TEXT,
                time: 30
            },
            {
                img: './img/exercise/2.png',
                text: DEFAULT_TEXT,
                time: 30
            }
        ],
    },
    {
        title: 'A medium workout ',
        time: 7,
        main_img: './img/exercise/5.png',
        exercies: [
            {
                img: './img/exercise/3.png',
                text: 'Stand on one leg, keep your balance. He holds both hands above his head',
                time: 30
            },
            {
                img: './img/exercise/10.png',
                text: DEFAULT_TEXT,
                time: 30
            },
            {
                img: './img/exercise/12.png',
                text: DEFAULT_TEXT,
                time: 30
            },
            {
                img: './img/exercise/2.png',
                text: DEFAULT_TEXT,
                time: 30
            }
        ],
    },
    {
        title: 'A hard workout',
        time: 10,
        main_img: './img/exercise/13.png',
        exercies: [
            {
                img: './img/exercise/3.png',
                text: 'Stand on one leg, keep your balance. He holds both hands above his head',
                time: 30
            },
            {
                img: './img/exercise/10.png',
                text: DEFAULT_TEXT,
                time: 30
            },
            {
                img: './img/exercise/12.png',
                text: DEFAULT_TEXT,
                time: 30
            },
            {
                img: './img/exercise/2.png',
                text: DEFAULT_TEXT,
                time: 30
            }
        ],
    }
];

let destroyFn = () => { };


const MCTraining = new MCFactory({
    html: `
        <div>
            <div class="training__header">
                <span class="trining-name" data-bind="title">Simple workout</span>
                <span data-bind="time"></span> minutes
            </div>
            
            <div class="card-wrapper">
                <div data-for="exercies">
                    <div class="card">
                        <div class="card__image">
                            <img data-bind-attr="src|img" alt="exercise">
                        </div><div class="card__body card__body_centered">
                            <div class="card__text" data-bind="text"></div>
                        </div>
                        <div class="card_ftime">
                            <span data-bind="time"></span> sec
                        </div>
                    </div>
                </div>
            </div>
            <div class="training__pause" data-paused="true">START</div>
        </div>
        `,
    afterCreate: (data, mcEl, htmlEl) => {
        let firstPlay = true;
        let paused = true;
        let currentTime = 0;
        let currentEx = 0;

        htmlEl.querySelector('.training__pause').addEventListener('click', () => {
            if (firstPlay) {
                firstPlay = false;
                paused = false;
                currentTime = data.exercies[currentEx].time;
                htmlEl.querySelectorAll('.card')[currentEx].classList.add('card__active');
                htmlEl.querySelector('.training__pause').innerHTML = 'PAUSE';
                htmlEl.querySelector('.training__pause').setAttribute('data-paused', `${paused}`);
                return;
            } else {
                paused = !paused;
                htmlEl.querySelector('.training__pause').innerHTML = paused ? 'PLAY' : 'PAUSE';
                htmlEl.querySelector('.training__pause').setAttribute('data-paused', `${paused}`);
            }
        });

        mcEl.intervalId = setInterval(() => {
            if (paused) { return; }
            if (currentTime > 0) {
                currentTime--;
                htmlEl.querySelectorAll('.card_ftime')[currentEx].innerHTML = `${currentTime} sec`
            } else {
                htmlEl.querySelectorAll('.card_ftime')[currentEx].innerHTML = `0 sec`;
                htmlEl.querySelectorAll('.card')[currentEx].classList.add('card__ended');
                htmlEl.querySelectorAll('.card')[currentEx].classList.remove('card__active');
                currentEx++;
                if (data.exercies[currentEx]) {
                    currentTime = data.exercies[currentEx].time;
                    htmlEl.querySelectorAll('.card')[currentEx].classList.add('card__active');
                } else {
                    paused = true;
                    clearInterval(mcEl.intervalId);
                    destroyFn = () => { };
                    mcEl.intervalId = null;
                    window.viewController.next('exersices')
                    console.log('DONE');
                }
            }
        }, 1000);

        destroyFn = () => {
            clearInterval(mcEl.intervalId);
        }
    }
})

TRAININGS.forEach(t => {
    document.querySelector('.view_exersices .card-wrapper').appendChild(MCCard.create(t, {
        onSelect: (e, data) => {

            window.viewController.next('training');
            document.querySelector('.view_training .view__content__no__rel').innerHTML = '';
            document.querySelector('.view_training .view__content__no__rel').appendChild(MCTraining.create(t));
        }
    }));
});
