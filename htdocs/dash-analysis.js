const ANALYTICS = {};

function setupAnalytics(video, player, analytics) {
    analytics['metrics'] = {};
    player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function () {
        clearInterval(eventPoller);
    });

    analytics['quality'] = [];
    player.on('fragmentLoadingCompleted', function (value) {
        if (value.mediaType === 'audio') {
            return;
        }
        analytics['quality'].push({
            timestamp: Date.now(),
            index: value.request.index,
            quality: value.request.quality,
        });
    });

    const eventPoller = setInterval(function () {
        const streamInfo = player.getActiveStream().getStreamInfo();
        const dashMetrics = player.getDashMetrics();
        const dashAdapter = player.getDashAdapter();

        if (dashMetrics && streamInfo) {
            const periodIdx = streamInfo.index;

            const bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);

            const repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
            const bitrate = repSwitch ? dashAdapter.getBandwidthForRepresentation(repSwitch.to, periodIdx) : NaN;

            const unixTimestamp = Date.now();
            analytics['metrics'][unixTimestamp] = {
                bufferLevel,
                bitrate,
            };
        }
    }, 1000);
}

function setupControls(player, video) {
    video.controls = false;
    const controlBar = new ControlBar(player);
    controlBar.initialize();

    document.getElementById('playPauseBtn').addEventListener('click', function() {
        document.getElementById('playPauseBtnText').innerHTML =
            player.isPaused()
                ? 'Play'
                : 'Pause';
    });
}

function loadVideo() {
    const VIDEO_URL = '/videos/alazar/manifest.mpd';
    const video = document.querySelector('video');
    const player = dashjs.MediaPlayer().create();
    player.initialize(video, VIDEO_URL, false);
    player.updateSettings({
        debug: {
            logLevel: dashjs.Debug.LOG_LEVEL_NONE,
        },
    });

    setupControls(player, video);
    setupAnalytics(video, player, ANALYTICS);
}

// https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
function downloadAnalytics() {
    const tmp = document.createElement('a');
    const file = new Blob([JSON.stringify(ANALYTICS)], { type: 'text/plain' });
    tmp.href = URL.createObjectURL(file);
    const timestamp = Date.now()
    tmp.download = `multimedia_analytics_${timestamp}.json`;
    tmp.click();
}
