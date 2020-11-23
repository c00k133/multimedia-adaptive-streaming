const ANALYTICS = {};
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

            //const quality = dashMetrics.getCurrentSchedulingInfo('video').quality;
            //const playerQuality = player.getQualityFor('video');
            //const averageThroughput = player.getAverageThroughput('video');

            const unixTimestamp = Date.now();
            analytics['metrics'][unixTimestamp] = {
                bufferLevel,
                bitrate,
                //quality,
                //playerQuality,
                //averageThroughput,
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
        console.log(value.request.index, value.request.quality);
        /*
        analytics['FRAGMENT_LOADING_COMPLETED'].push({
            timestamp: Date.now(),
            index: value.request.index,
            quality: value.request.quality,
        });
        */
    });

    /*
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
    */
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

function getChosenVideo() {
    const videoInput = document.getElementById('streamVideo').value;
    return videoInput;
}

function loadVideo() {
    PLAYER = dashjs.MediaPlayer().create();
    applySettings(PLAYER);

    const videoUrl = getChosenVideo();

    const video = document.querySelector('video');
    PLAYER.initialize(video, videoUrl, false);

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

    // http://cdn.dashjs.org/latest/jsdoc/module-Settings.html
    const settings = {
         debug: {
            logLevel: dashjs.Debug.LOG_LEVEL_NONE,
         },
         streaming: {
             metricsMaxListDepth: 1000,
             abandonLoadTimeout: 10000,
             liveDelayFragmentCount: NaN,
             liveDelay: null,
             scheduleWhilePaused: true,
             fastSwitchEnabled: true,
             flushBufferAtTrackSwitch: false,
             bufferPruningInterval: 10,
             bufferToKeep: 20,
             jumpGaps: true,
             jumpLargeGaps: true,
             smallGapLimit: 1.5,
             stableBufferTime: 6,
             bufferTimeAtTopQuality: 10,
             bufferTimeAtTopQualityLongForm: 10,
             longFormContentDurationThreshold: 600,
             wallclockTimeUpdateInterval: 50,
             lowLatencyEnabled: false,
             keepProtectionMediaKeys: false,
             useManifestDateHeaderTimeSource: true,
             useSuggestedPresentationDelay: true,
             useAppendWindow: true,
             manifestUpdateRetryInterval: 100,
             liveCatchUpMinDrift: 0.02,
             liveCatchUpMaxDrift: 0,
             liveCatchUpPlaybackRate: 0.5,
             lastBitrateCachingInfo: {
                 enabled: true,
                 ttl: 360000
             },
             lastMediaSettingsCachingInfo: {
                 enabled: true,
                 ttl: 360000
             },
             cacheLoadThresholds: {
                 video: 0,
                 audio: 0
             },
             retryIntervals: {
                 MPD: 500,
                 XLinkExpansion: 500,
                 InitializationSegment: 1000,
                 IndexSegment: 1000,
                 MediaSegment: 1000,
                 BitstreamSwitchingSegment: 1000,
                 other: 1000,
                 lowLatencyReductionFactor: 10
             },
             retryAttempts: {
                 MPD: 3,
                 XLinkExpansion: 1,
                 InitializationSegment: 3,
                 IndexSegment: 3,
                 MediaSegment: 3,
                 BitstreamSwitchingSegment: 3,
                 other: 3,
                 lowLatencyMultiplyFactor: 5
             },
             abr: {
                 movingAverageMethod: 'slidingWindow',
                 ABRStrategy: 'abrThroughput',
                 bandwidthSafetyFactor: 0.9,
                 useDefaultABRRules: true,
                 useBufferOccupancyABR: false,
                 useDeadTimeLatency: true,
                 limitBitrateByPortal: false,
                 usePixelRatioInLimitBitrateByPortal: false,
                 maxBitrate: {
                     audio: -1,
                     video: -1
                 },
                 minBitrate: {
                     audio: -1,
                     video: -1
                 },
                 maxRepresentationRatio: {
                     audio: 1,
                     video: 1
                 },
                 initialBitrate: {
                     audio: -1,
                     video: -1
                 },
                 initialRepresentationRatio: {
                     audio: -1,
                     video: -1
                 },
                 autoSwitchBitrate: {
                     audio: true,
                     video: true
                 }
             },
             cmcd: {
                 enabled: false,
                 sid: null,
                 cid: null,
                 did: null
             }
         }
    }
    player.updateSettings(settings);
    ANALYTICS['settings'] = settings;
}
