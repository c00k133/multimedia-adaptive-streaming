function setupControls(player) {
    video.controls = false;
    const controlBar = new ControlBar(player);
    controlBar.initialize();
}

function setupAnalytics(video, player) {
    player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function () {
        clearInterval(eventPoller);
        clearInterval(bitrateCalculator);
    });

    var eventPoller = setInterval(function () {
        var streamInfo = player.getActiveStream().getStreamInfo();
        var dashMetrics = player.getDashMetrics();
        var dashAdapter = player.getDashAdapter();

        if (dashMetrics && streamInfo) {
            const periodIdx = streamInfo.index;
            var repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
            var bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);
            var bitrate = repSwitch ? Math.round(dashAdapter.getBandwidthForRepresentation(repSwitch.to, periodIdx) / 1000) : NaN;
            var adaptation = dashAdapter.getAdaptationForType(periodIdx, 'video', streamInfo)
            var frameRate = adaptation.Representation_asArray.find(function (rep) {
                return rep.id === repSwitch.to
            }).frameRate;
            document.getElementById('bufferLevel').innerText = bufferLevel + " secs";
            document.getElementById('framerate').innerText = frameRate + " fps";
            document.getElementById('reportedBitrate').innerText = bitrate + " Kbps";
        }
    }, 1000);

    if (video.webkitVideoDecodedByteCount !== undefined) {
        var lastDecodedByteCount = 0;
        const bitrateInterval = 5;
        var bitrateCalculator = setInterval(function () {
            var calculatedBitrate = (((video.webkitVideoDecodedByteCount - lastDecodedByteCount) / 1000) * 8) / bitrateInterval;
            document.getElementById('calculatedBitrate').innerText = Math.round(calculatedBitrate) + " Kbps";
            lastDecodedByteCount = video.webkitVideoDecodedByteCount;
        }, bitrateInterval * 1000);
    } else {
        //document.getElementById('chrome-only').style.display = "none";
    }
}

const VIDEO_URL = '/videos/alazar/manifest.mpd';
const video = document.querySelector('video');
const player = dashjs.MediaPlayer().create();
player.initialize(video, VIDEO_URL, true);
player.updateSettings({
    debug: {
        logLevel: dashjs.Debug.LOG_LEVEL_NONE,
    },
});

setupControls(player);
setupAnalytics(video, player);
