(() => {
    let logScreen = null;
    let loader = null;
    let startBtn = $('.js_start');
    let stopBtn = $('.js_stop');
    let autoScroll = $('#js_auto_scroll');
    let fileSelector = $('.js_file_name');
    let clearBtn = $('.js_clear');
    let fileLabel = $('.js_file_label');
    let source = null;

    function startLogStream() {
        if (window.EventSource) {
            if (!source) {
                source = new EventSource(`http://localhost:3000/livetail/?token=${fileSelector.find(':selected').data('token')}&fileName=${fileSelector.val()}`);
                source.addEventListener("log", function (event) {
                    addLogToScreen((JSON.parse(event.data) || {}).logs);
                });
            }

        } else {
            alert("Please upgrade your browser to latest version!");
        }
    }

    fileSelector.on('change', () => {
        stopBtn.click();
        fileLabel.text(" " + fileSelector.val())
    });

    function closeLogStream() {
        if (source) {
            source.close();
            source = null;
        }
    }

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
        startLogStream();
        startBtn.hide();
        stopBtn.show();
    });

    stopBtn.click(() => {
        closeLogStream();
        loader.hide(500);
        startBtn.show();
        stopBtn.hide();
    });

    function addLogToScreen(logs) {
        logScreen.val(logScreen.val() + logs);
        if (autoScroll.prop('checked')) {
            logScreen.scrollTop(logScreen[0].scrollHeight);
        }
    }

    $(document).on('unload', closeLogStream);

})();
