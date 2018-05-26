(() => {
    let logScreen = null;
    let loader = null;
    let tailCtrl = null;
    let startBtn = $('.js_start');
    let stopBtn = $('.js_stop');
    let autoScroll = $('#js_auto_scroll');
    let tokenSelector = $('.js_token');
    let clearBtn = $('.js_clear');

    $(document).ready(() => {
        logScreen = $('#js_log_screen');
        loader = $('.js_loader');
        loader.hide();
        stopBtn.hide();
    });

    clearBtn.click(() => {
        if (logScreen.val()) {
            logScreen.val("");
        }
    });

    startBtn.click(() => {
        loader.show(500);
        if (!tailCtrl) {
            tailCtrl = setInterval(fetchLog, 1000);
        }
        startBtn.hide();
        stopBtn.show();
    });

    stopBtn.click(() => {
        clearTail();
        loader.hide(500);
        startBtn.show();
        stopBtn.hide();
    });


    async function fetchLog() {
        fetch(`http://localhost:3000/tail/?token=${tokenSelector.val()}`).then(async (data) => {
            let logs = (await data.json()).logs;
            logScreen.val(logScreen.val() + logs);
            if (autoScroll.prop('checked')) {
                logScreen.scrollTop(logScreen[0].scrollHeight);
            }
        }).catch(() => {
            console.log("Error fetching logs.");
        });
    }

    $(document).on('unload', clearTail);

    function clearTail() {
        if (tailCtrl) {
            clearInterval(tailCtrl);
            tailCtrl = null;
        }
    }
})();
