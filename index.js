class ViewController {
    constructor() {
        this.history = [];
    }

    next(viewName) {
        if (viewName === this.currentViewName) { return; }
        this.currentViewName = viewName;
        const el = document.querySelector(`.view_${viewName}`);

        el.classList.add('view_active');
        el.classList.add('view_active-next');

        const currentView = this.currentView;

        setTimeout(() => {
            el.classList.remove('view_active-next');
        }, 290);

        if (this.currentView) {
            currentView.classList.remove('view_active-next');
            currentView.classList.add('view_inactive-next');

            setTimeout(() => {
                currentView.classList.remove('view_active');
                currentView.classList.remove('view_inactive-next');
            }, 290);
        }

        this.currentView = el;

    }

    prev() {

    }
}

window.viewController = new ViewController();
window.viewController.next('exersices');
// window.viewController.next('calendar');

// 
document.querySelector('.button_end').addEventListener('click', () => window.viewController.next('exersices'));

document.querySelector('.button_back').addEventListener('click', () => { destroyFn(); window.viewController.next('exersices') });
document.querySelector('.to-home').addEventListener('click', () => { destroyFn(); window.viewController.next('exersices') });


const S = Storage.create({
    calendar: {}
});


const calnedar = new window.MCalendar(
    7,
    (dateCode) => {
        if (S.calendar[dateCode]) {
            if (S.calendar[dateCode] === 'done') {
                return ['mcalendar-date_done']
            } else {
                return ['mcalendar-date_plans']
            }
        }
        return [];
    },
    (dataCode, year, month, date) => {

        const cDate = new Date(year, month, date);
        if (cDate.getTime() < Date.now()) {
            document.querySelector('.date-activities').innerHTML = '';
            document.querySelector('.add-activities').style.display = 'none';
            return;
        }

        if (S.calendar[dataCode] && S.calendar[dataCode] !== 'done') {
            let names = {
                '3': 'A hard workout',
                '2': 'A medium workout',
                '1': 'A simple workout'
            }

            document.querySelector('.date-activities').innerHTML = `
                <div class="act">
                    <div class="act__title"><span>${`${month}`.padStart(2, '0')}.${`${date}`.padStart(2, '0')}</span>${names[`${S.calendar[dataCode]}`]}</div>
                    <svg class="act_remove" width="14" height="18" viewBox="0 0 14 18" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M14 1H10.5L9.5 0H4.5L3.5 1H0V3H14M1 16C1 16.5304 1.21071 17.0391 1.58579 17.4142C1.96086 17.7893 2.46957 18 3 18H11C11.5304 18 12.0391 17.7893 12.4142 17.4142C12.7893 17.0391 13 16.5304 13 16V4H1V16Z"
                            fill="#C4C4C4" />
                        </svg>
                    </div>
                `;

            document.querySelector('.add-activities').style.display = 'none';

            document.querySelector('.act_remove').onclick = () => {
                document.querySelector('.date-activities').innerHTML = '';
                delete S.calendar[dataCode];
                S.calendar = S.calendar;
                document.querySelector(`[data-date-code="${dataCode}"]`).classList.remove('mcalendar-date_plans');
                document.querySelector('.add-activities').style.display = 'block';
            }
        } else {
            document.querySelector('.date-activities').innerHTML = '';
            document.querySelector('.add-activities').style.display = 'block';
        }
    }
);

document.querySelector('.add-simple').onclick = () => {
    S.calendar[calnedar.activeDateCode] = '1';
    S.calendar = S.calendar;
    document.querySelector(`[data-date-code="${calnedar.activeDateCode}"]`).classList.add('mcalendar-date_plans');
    document.querySelector(`[data-date-code="${calnedar.activeDateCode}"]`).dispatchEvent(new Event('click'));
}

document.querySelector('.add-medium').onclick = () => {
    S.calendar[calnedar.activeDateCode] = '2';
    S.calendar = S.calendar;
    document.querySelector(`[data-date-code="${calnedar.activeDateCode}"]`).classList.add('mcalendar-date_plans');
    document.querySelector(`[data-date-code="${calnedar.activeDateCode}"]`).dispatchEvent(new Event('click'));
}

document.querySelector('.add-hard').onclick = () => {
    S.calendar[calnedar.activeDateCode] = '3';
    S.calendar = S.calendar;
    document.querySelector(`[data-date-code="${calnedar.activeDateCode}"]`).classList.add('mcalendar-date_plans');
    document.querySelector(`[data-date-code="${calnedar.activeDateCode}"]`).dispatchEvent(new Event('click'));
}

doneCallback = () => {
    S.calendar[calnedar.getCodeByDate(new Date())] = 'done';
    S.calendar = S.calendar;
};

document.querySelector('.to-calendar').addEventListener('click', () => {
    destroyFn(); window.viewController.next('calendar');
    document.querySelector('.mcalendar').innerHTML = '';
    document.querySelector('.mcalendar').appendChild(calnedar.createCalendarHTMLEl())
});