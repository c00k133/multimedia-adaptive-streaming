const ANALYTICS = {};
const VIDEO_URL = '/videos/alazar/manifest.mpd';
var PLAYER = dashjs.MediaPlayer().create();

function setupAnalytics(video, player, analytics) {
    analytics['metrics'] = {};
    player.on(dashjs.MediaPlayer.events['PLAYBACK_ENDED'], function (value) {
        clearInterval(eventPoller);
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

            const quality = dashMetrics.getCurrentSchedulingInfo('video').quality;

            const unixTimestamp = Date.now();
            analytics['metrics'][unixTimestamp] = {
                bufferLevel,
                bitrate,
                quality,
            };
        }
    }, 1000);

    analytics['calculatedBitrate'] = [];
    if (video.webkitVideoDecodedByteCount !== undefined) {
        var lastDecodedByteCount = 0;
        const bitrateInterval = 1;
        var bitrateCalculator = setInterval(function () {
            var calculatedBitrate = ((video.webkitVideoDecodedByteCount - lastDecodedByteCount) * 8) / bitrateInterval;
            analytics['calculatedBitrate'].push({
                timestamp: Date.now(),
                calculatedBitrate,
            });
            lastDecodedByteCount = video.webkitVideoDecodedByteCount;
        }, bitrateInterval * 1000);
    } else {
        document.getElementById('chrome-only').style.display = "none";
    }

    analytics['FRAGMENT_LOADING_COMPLETED'] = [];
    player.on(dashjs.MediaPlayer.events['FRAGMENT_LOADING_COMPLETED'], function (value) {
        if (value.request.mediaType === 'audio') {
            return;
        }
        analytics['FRAGMENT_LOADING_COMPLETED'].push({
            timestamp: Date.now(),
            index: value.request.index,
            quality: value.request.quality,
        });
    });

    analytics['FRAGMENT_LOADING_STARTED'] = [];
    player.on(dashjs.MediaPlayer.events['FRAGMENT_LOADING_STARTED'], function (value) {
        if (value.request.mediaType === 'audio') {
            return;
        }
        analytics['FRAGMENT_LOADING_STARTED'].push({
            timestamp: Date.now(),
            index: value.request.index,
            quality: value.request.quality,
        });
    });
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
    const video = document.querySelector('video');

    PLAYER = dashjs.MediaPlayer().create();
    applySettings(PLAYER);
    PLAYER.initialize(video, VIDEO_URL, false);

    setupControls(PLAYER, video);
    setupAnalytics(video, PLAYER, ANALYTICS);
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

function applySettings(player) {
    if (!player) {
        return;
    }

    const stableBuffer = parseInt(document.getElementById('stableBuffer').value, 10);
    const bufferAtTopQuality = parseInt(document.getElementById('topQualityBuffer').value, 10);
    const maxBitrate = parseInt(document.getElementById('maxBitrate').value, 10);
    const minBitrate = parseInt(document.getElementById('minBitrate').value, 10);

    player.updateSettings({
        debug: {
            logLevel: dashjs.Debug.LOG_LEVEL_NONE,
        },
        'streaming': {
            'stableBufferTime': stableBuffer,
            'bufferTimeAtTopQualityLongForm': bufferAtTopQuality,
            'abr': {
                'minBitrate': {
                    'video': minBitrate
                },
                'maxBitrate': {
                    'video': maxBitrate
                },
            },
            'scheduleWhilePaused': true,
            'fastSwitchEnabled': false,
        },
    })
}
