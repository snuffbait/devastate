document.getElementById("version-short").innerHTML = "[BW ver 0.5.6.2p]";

function playCheckSound() {
    var audio = document.getElementById('sound');
    audio.play();
}

// Add click and touch start listeners to the entire screen
document.body.addEventListener('click', playCheckSound);
document.body.addEventListener('touchend', function (event) {
    // event.preventDefault(); // Prevent default behavior of touch events
    playCheckSound();
});


// Text here can be freely modified
const readyText = "[Loading]";
const descriptionText = "Use keyboard input or swipe on the screen to move" // Now hidden
const clickToStartText = "Touch to Start";
const initializeMidiText = "MIDI Environment Setup Initialization";
const initialDownloadingText = "Checking Game Files";
const buttonNormalColor = "whitesmoke"
const buttonPressedColor = "darkgrey"
var noGameHeaderFooter = false;

// The following is system-related; basically do not modify
document.title = WoditorGameSettings.projectName;
document.getElementById("title").innerHTML = readyText;
document.getElementById("readme").innerHTML = descriptionText;

// When using settings like<base href="/GameFilesUpdate/202553/2/"> (PLiCy format)
function getPLiCyFormatGameId(){
    const match = document.baseURI.match(/GameFilesUpdate\/(\d+)\/(\d+)/);
    if(match && match[1] && match[2]){
        const Game_ID = match[1];   //Game_ID on PLiCy
        const Update_No = match[2]; //Number of version upgrades on PLiCy
        return Game_ID;         //Set PLiCy's Game_ID as the project ID
    }
    return null;
}

//If an id named Game_ID is specified in the iframe URL, extract it http://example.com/iframe/Game_ID=xxx
function getGameIdFromLocationPathname() {
    const queryString = window.location.pathname;
    const match = queryString.match(/Game_ID=(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
}

//Check if Game_ID is specified in any way and get it
function getGameIdFromUrl() {
    const gameIdFromPLiCyFormat = getPLiCyFormatGameId();
    if(gameIdFromPLiCyFormat){
        console.log("Acquired Game_ID in PLiCy format");
        return gameIdFromPLiCyFormat;
    }
    const gameIdFromLocationPathname = getGameIdFromLocationPathname();
    if(gameIdFromLocationPathname){
        console.log("Acquired Game_ID from Pathname");
        return gameIdFromLocationPathname;
    }
    console.log("Using the website URL as the base Game_ID");
    return null;
}

function getGameProjectPath() {
    //If the iframe URL contains an id named Game_ID, use it
    const gameIdValue = getGameIdFromUrl();
    if (gameIdValue) {
      return gameIdValue + "_" + WoditorGameSettings.projectId;
    }

    // Check the path after the domain of the setting website (even if embedded in an iframe, use the URL of the displayed page as the base)
    // http://example.com/GamePlay/12345 => GamePlay_12345_project_id
    let dir = null;

    try{
        dir = top.location.pathname; // Fallback through exception handling due to potential cross-origin resource sharing issues in iframes
    }catch(e){
        dir = window.location.pathname;
    }
    
    const sep = dir.endsWith("/") ? "" : "/";
    let path = dir + sep + WoditorGameSettings.projectId;

    path = path.replace("index.html/", "");
    path = path.replaceAll(".", "_");
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    path = path.replaceAll("/", "_");

    console.log("Game project path:", path);

    return path;
}

var Module = {
    projectId: getGameProjectPath(),
    showDebugLog: 1,
    woditor: {},
    noInitialRun: true,
    preRun: [],
    postRun: [],
    print: (function () {
        return function (text) {
            text = Array.prototype.slice.call(arguments).join(' ');
            console.log(text);
        };
    })(),
    printErr: function (text) {
        text = Array.prototype.slice.call(arguments).join(' ');
        document.getElementById("error-log").innerHTML += text;
        console.error(text);
    },
    canvas: (function () {
        var canvas = document.getElementById('canvas');
        canvas.addEventListener("webglcontextlost", function (e) { alert('FIXME: WebGL context lost, please reload the page'); e.preventDefault(); }, false);
        return canvas;
    })(),
    webgl_enable_webgl2: true,
    webgl_enable_extension: ["OES_texture_float", "WEBGL_color_buffer_float"],
    title: document.getElementById("title"),
    setStatus: function (text) {
        if (text == '') {
            Module.ready = true;
            document.getElementById('title').innerHTML = clickToStartText;
            document.getElementById('touchtostart').innerHTML = clickToStartText;
        }
    },
    monitorRunDependencies: function (left) { },
    //Function to display the contents of 'BrowserWoditor:' debug statements executed in Woditor
    catchGameMessage: function (message) {
        console.log(message);
    },
    playVibration: function (inputType, power, time, effectIndex) {
        playGamePadVibration(inputType, power, time, effectIndex); // As described below
    }
};

window.progressDownloading = function (loaded, total, filename) {
    const percentage = total > 0 ? Math.round(100 * loaded / total) + "%" : Math.round(loaded / 100000) / 10 + "MB";
    const progressText = filename + " [" + percentage + "]";
    document.getElementById('title').innerHTML = progressText;
    document.getElementById('touchtostart').innerHTML = progressText;
}

function registerKeyDownUp(buttonEl, keyCode) {
    buttonEl.addEventListener('mousedown', (e) => {
        buttonEl.style.backgroundColor = buttonPressedColor;
        e.preventDefault();
        dispatchKeyCode('keydown', keyCode);
    });
    buttonEl.addEventListener('mouseup', (e) => {
        buttonEl.style.backgroundColor = buttonNormalColor;
        e.preventDefault();
        dispatchKeyCode('keyup', keyCode);
    });
    buttonEl.addEventListener('touchstart', (e) => {
        buttonEl.style.backgroundColor = buttonPressedColor;
        e.preventDefault();
        dispatchKeyCode('keydown', keyCode);
    });
    buttonEl.addEventListener('touchend', (e) => {
        buttonEl.style.backgroundColor = buttonNormalColor;
        e.preventDefault();
        dispatchKeyCode('keyup', keyCode);
    });
    buttonEl.addEventListener('touchcancel', (e) => {
        buttonEl.style.backgroundColor = buttonNormalColor;
        e.preventDefault();
        dispatchKeyCode('keyup', keyCode);
    });
}
const rightClickButton = document.getElementById("right-hold");
rightClickButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    rightClickButton.style.backgroundColor = buttonPressedColor;
});
rightClickButton.addEventListener('mouseup', (e) => {
    e.preventDefault();
    rightClickButton.style.backgroundColor = buttonNormalColor;
});
rightClickButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    rightClickButton.style.backgroundColor = buttonPressedColor;
    enableMouseRightButton();
});
rightClickButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    rightClickButton.style.backgroundColor = buttonNormalColor;
    disableMouseRightButton();
});
registerKeyDownUp(document.getElementById("shift"), shift);
registerKeyDownUp(document.getElementById("esc"), cancel);
registerKeyDownUp(document.getElementById("enter"), enter);
registerKeyDownUp(document.getElementById("move-axis"), undefined);

var screenObserver = undefined;
function setCustomGameSize(width, height) { //Called internally during system initialization to auto-adjust screen size
    if (!screenObserver) {
        screenObserver = new ResizeObserver(function (mutations) {
            adjustGameUI();
        });
        screenObserver.observe(document.body);
    }
    // Calibrate input position
    Module.gameWidth = width;
    Module.gameHeight = height;

    // Adjust aspect ratio
    Module.canvas.width = width;
    Module.canvas.height = height;
    adjustGameUI();
}
window.onload = () => {
    const resizableEl = document.getElementById("canvas");
    setCustomGameSize(resizableEl.width, resizableEl.height); // Call once with standard size
}

window.onerror = (err) => {
     document.getElementById("error-log").innerHTML += err;
}
function showGameMemoryUsage() {
    if (Module && Module.HEAP8) {
        const memory = (Math.round(10 * Module.HEAP8.length / 1000000) / 10 + "MB");
        document.getElementById("memory-usage").innerHTML = "Memory Used:" + memory;
    }
}
setInterval(showGameMemoryUsage, 1000);

function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "show";
    setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
}

function handleFullScreen() {
    var elem = document.getElementById("main-content");
    const isIPhone = /iPhone/i.test(navigator.userAgent);
    const isIPad = /iPad/i.test(navigator.userAgent) || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

    if (true || isIPhone || isIPad) { // Enable pseudo-fullscreen on all devices (provisional)
        if (!WoditorGameSettings.isPseudoFullscreen) {
            startPseudoFullscreen();
        } else {
            endPseudoFullscreen();
        }
        adjustGameUI();

    } else if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}
function lockScreenOrientation(orientation) {
    if (orientation && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock(orientation).catch(function (error) {
            // alert("Cannot lock screen orientation:", error);
        });
    }
}
function tryFullScreen() {
    handleFullScreen();
    if (WoditorGameSettings.lockOrientation) {
        lockScreenOrientation(WoditorGameSettings.lockOrientation);
    }
    document.onfullscreenchange = (event) => {
        event.preventDefault();
        if (document.fullscreenElement) {
            WoditorGameSettings.isFullscreen = true;
        } else {
            WoditorGameSettings.isFullscreen = false;
        }
        adjustGameUI();
    };
}

document.getElementById('fullscreen').addEventListener('click', tryFullScreen);
document.getElementById('fullscreen').addEventListener('touchend', function (event) {
    event.preventDefault(); // Prevent default behavior of touch events
    tryFullScreen();
});

const mainContent = document.getElementById("outer");
function beforeGameStart() {
    document.getElementById('touchtostart').hidden = true;
}
function initializeGame() { // Game startup processing on touch
    if (Module.ready && Module.woditor && !Module.woditor.initialized) {
        mainContent.ontouchend = undefined; // Removed to avoid issues caused by multiple startup triggers
        mainContent.onclick = undefined;

        Module.woditor.initialized = true;
        Module.woditor.textInputField = document.getElementById("textinput");

        document.getElementById('title').innerHTML = initializeMidiText;
        document.getElementById('title').innerHTML = initialDownloadingText;
        document.getElementById('touchtostart').innerHTML = initialDownloadingText;

        setTimeout(() => {
            window.Benten.initialize();
        }, 10);

        Module.callMain(); // entry point

        if (WoditorGameSettings.requestFullScreen) {
            handleFullScreen();
            lockScreenOrientation(WoditorGameSettings.lockOrientation);
        }
    }
}
mainContent.ontouchend = (e) => { //Touch on start
    if (e.target.localName == "a" || e.target.localName == "input" || e.target.localName == "button") {
        return;
    }
    e.preventDefault();
    initializeGame();
}
mainContent.onclick = (e) => { //Respond to click
    if (e.target.localName == "a" || e.target.localName == "input" || e.target.localName == "button") {
        return;
    }
    e.preventDefault();
    initializeGame();
}

window.addEventListener('touchend', function (event) { // Handling touch events outside iOS area
    if (event.target.localName == "a" || event.target.localName == "input" || event.target.localName == "button") {
        return;
    }
    event.preventDefault();
});

window.addEventListener('beforeunload', function (event) {
    FS.syncfs(false, function (err) {
        console.log(err);
    });
});

async function customTestFileChanged(urlStr, pathStr) { // Called internally when requesting a file to check if it's updated and decide whether to download
    try {
        const response = await fetch(urlStr, { method: "HEAD", redirect: 'follow' });
        if (response.status == 200) {
            var modifiedInfo = response.headers.get('ETag');
            const filePathStr = "/data0/" + Module.projectId + "-GameCache" + pathStr + "_etag";

            if (modifiedInfo === null) {
                modifiedInfo = response.headers.get('Last-Modified');
            }

            if (modifiedInfo === null) {
                modifiedInfo = "null";
            }

            if (FS.analyzePath(filePathStr, false).exists) {
                const prevModifiedInfo = FS.readFile(filePathStr, { encoding: 'utf8' });
                if (modifiedInfo !== prevModifiedInfo) { // Past ETag exists and is different
                    console.log("updated: " + pathStr, prevModifiedInfo, "=>", modifiedInfo);
                    FS.writeFile(filePathStr, modifiedInfo, { flags: 'w+' });
                    return true;
                }
            } else { // Past ETag does not exist (new download)
                console.log("new: " + pathStr, modifiedInfo);

                FS.writeFile(filePathStr, modifiedInfo, { flags: 'w+' });
                return true;
            }
        }
    } catch {
        return false;
    }
    return false;
}

function browserCheckFailed(errorCode) { // Called when browser is not configured. Just warns about internal error here
    if (errorCode == 0) {
        alert("Necessary files are located outside Data.wolf\nPlease reconfirm the operation steps");
    } else {
        alert("Failed to start due to incorrect browser settings\nPlease reconfirm steps\n(Specs might have changed after update)")
    }
}
const noSystemTouchEl = document.getElementById("no-system-touch");
function toggleNoSystemTouch() {
    WoditorGameSettings.noSystemTouch = !WoditorGameSettings.noSystemTouch;
    if (WoditorGameSettings.noSystemTouch) {
        noSystemTouchEl.style.backgroundColor = buttonPressedColor;
    } else {
        noSystemTouchEl.style.backgroundColor = buttonNormalColor;
    }
}
if (WoditorGameSettings.noSystemTouch) { // Initial color setting
    noSystemTouchEl.style.backgroundColor = buttonPressedColor;
} else {
    noSystemTouchEl.style.backgroundColor = buttonNormalColor;
}

const switchUIEl = document.getElementById("switch-ui");
function toggleSwitchUI() {
    WoditorGameSettings.switchUILeftRight = !WoditorGameSettings.switchUILeftRight;
    if (WoditorGameSettings.switchUILeftRight) {
        switchUIEl.style.backgroundColor = buttonPressedColor;
    } else {
        switchUIEl.style.backgroundColor = buttonNormalColor;
    }
    adjustGameUI();
}
if (WoditorGameSettings.switchUILeftRight && switchUIEl !== null) { // Initial color setting
    switchUIEl.style.backgroundColor = buttonPressedColor;
} else {
    switchUIEl.style.backgroundColor = buttonNormalColor;
}

function toggleSettingVisibility() {
    const el = document.getElementById("main-footer-additional");
    el.hidden = !el.hidden;
}
function uploadSaveData() {
    const file = document.getElementById("savedata").files[0];
    var fr = new FileReader();
    fr.onload = eve => {
        console.log(fr.result);
        const arr = new Uint8Array(fr.result);

        const dirPathStr = "/Save";
        const filePathStr = dirPathStr + "/" + file.name;
        if (!FS.analyzePath(dirPathStr).exists) {
            FS.mkdir(dirPathStr);
        }
        FS.writeFile(filePathStr, arr, { flags: 'w+' });

        const backupPath = "/data0/" + Module.projectId + "-Save" + filePathStr;
        FS.writeFile(backupPath, arr, { flags: 'w+' });
        FS.syncfs(false, function (err) {
            if (err) {
                console.error('Save sync failed:', err);
            }
            // After persisting to IDB, repopulate in-memory FS from IDB so the game can detect new files
            if (typeof Module !== 'undefined' && Module.__asyncjs__syncFS) {
                Module.__asyncjs__syncFS(true).then(() => {
                    alert("Save file loaded to Save folder");
                }).catch(e => {
                    console.error('Failed to reload FS from IDB after save upload:', e);
                    alert("Save file loaded to Save folder (sync error)");
                });
            } else {
                alert("Save file loaded to Save folder")
            }
        });
    }
    fr.readAsArrayBuffer(file);
}

document.addEventListener("visibilitychange", async (e) => {
    if (document.visibilityState === "visible") {
        if (Module && Module.AL) {
            // Handling audio context resume
            for (var key in Module.AL.contexts) {
                const ctx = Module.AL.contexts[key].audioCtx;
                if (ctx.state === "suspended") {
                    await ctx.resume().then(() => {
                        console.log("AudioContext resumed.");
                    }).catch(err => {
                        console.log("Failed to resume AudioContext:", err);
                    });
                }
            }

            // Unmute MIDI playback
            if (window.Benten) {
                window.Benten.unmute();
            }
        }
    } else if (document.visibilityState === "hidden") {
        if (window.Benten) {
            window.Benten.mute();
        }
    }
});

// Settings Button
{
    const popup = document.getElementById('popup');

    function startPseudoFullscreen() {
        showToast("Exit fullscreen via Settings Button");

        WoditorGameSettings.isFullscreen = true;
        WoditorGameSettings.isPseudoFullscreen = true;
        adjustGameUI();
    }

    function endPseudoFullscreen() {
        if (WoditorGameSettings.isFullscreen && WoditorGameSettings.isPseudoFullscreen) {
            WoditorGameSettings.isFullscreen = false;
            WoditorGameSettings.isPseudoFullscreen = false;
            adjustGameUI();
        }
    }
    function isOpenSetting() {
        return !popup.hidden;
    }
    function openSetting() {
        popup.hidden = !popup.hidden;
    }
    function closeSetting() {
        popup.hidden = true;
    }

    const button = document.getElementById('settings');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let moveCount = 0;

    button.addEventListener('mousedown', dragStart);
    button.addEventListener('touchstart', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        e.preventDefault();
        moveCount = 0;
        startTime = new Date().getTime();
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === button) {
            isDragging = true;
        }
    }

    function drag(e) {
        e.preventDefault();
        if (isDragging) {
            moveCount += 1;
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            currentX = limitedX(currentX, button);
            currentY = limitedY(currentY, button);

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, button);
        }
    }

    function dragEnd(e) {
        e.preventDefault();
        const moveCountThreshold = 20;

        if (moveCount < moveCountThreshold) {
            const isTargetCanvas = e.target.id == 'canvas';
            const isTargetBody = e.target == document.body;
            if ((isTargetCanvas || isTargetBody) && isOpenSetting()) { //Click canvas to close
                closeSetting();
            }

            const isTargetSetting = e.target.id == 'settings';
            if (isTargetSetting) {
                openSetting();
            }
        }

        initialX = currentX;
        initialY = currentY;

        isDragging = false;
    }

    const outer = document.getElementById("outer");
    const outerSize = outer.getBoundingClientRect();
    const offsetX = outerSize.left;
    const offsetY = outerSize.top;
    const wholeWidth = window.innerWidth - offsetX;
    const wholeHeight = window.innerHeight - offsetY;

    function limitedX(xPos, el) {
        const rect = el.getBoundingClientRect();
        xPos -= offsetX;
        return offsetX + Math.max(wholeWidth * 0.1, Math.min(xPos, wholeWidth - rect.width - wholeWidth * 0.0125));
    }

    function limitedY(yPos, el) {
        const rect = el.getBoundingClientRect();
        yPos -= offsetY;
        return offsetY + Math.max(0, Math.min(yPos, wholeHeight - rect.height - wholeHeight * 0.1));
    }

    function setTranslate(xPos, yPos, el) {
        const rect = el.getBoundingClientRect();
        xPos = limitedX(xPos, el); // In iOS, if it's too far left or down, it overlaps with other gestures causing issues
        yPos = limitedY(yPos, el);
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    window.addEventListener("resize", function (e) {
        setTranslate(currentX, currentY, button);
    });
    window.addEventListener("load", function (e) {
        const rect = button.getBoundingClientRect();
        xOffset = offsetX + wholeWidth - rect.width;
        yOffset = offsetY + Math.max(0, Math.min(yOffset, wholeHeight - rect.height));
        setTranslate(xOffset, yOffset, button);
    });
}

{
    document.body.addEventListener("touchmove", function (e) { // Padding/Margin treatment
        e.preventDefault();
    });
}

{
    const framelimitEl = document.getElementById("framelimit");

    function changeFrameLimit() {
        const limitFPS = WoditorGameSettings.isLimitFPS ? 30 : 60;
        Module.ccall('setFrameLimit', null, ['number'], [limitFPS]);
    }

    function toggleFrameLimit() {
        WoditorGameSettings.isLimitFPS = !WoditorGameSettings.isLimitFPS;

        if (WoditorGameSettings.isLimitFPS) {
            framelimitEl.style.backgroundColor = buttonPressedColor;
        } else {
            framelimitEl.style.backgroundColor = buttonNormalColor;
        }
        changeFrameLimit();
    }

    if (WoditorGameSettings.limitFPS == 30 && !WoditorGameSettings.isLimitFPS) {
        toggleFrameLimit();
    }
}

{
    function openLink(url) {
        showToast("May not respond if pop-up blocker is enabled");

        window.open(url, '_blank').focus();
    }
}

// Save Folder Download/Load related
{
    // Change this to alter the target Save folder for all downloads/loads
    let targetSaveFileDir = "Save";

    function mkdirs(dirpath) {
        const rootDir = FS.analyzePath(dirpath);
        if (!rootDir.exists) {
            if (!rootDir.parentExists && rootDir.parentPath !== dirpath) {
                mkdirs(rootDir.parentPath);
            }
            try {
                FS.mkdir(dirpath);
            } catch (err) {
                console.log(err);
            }
        }
    }

    // {filename: Uint8Array}
    const zipAndDownloadAllDict = (dict) => {
        var zip = new JSZip();

        for (let key in dict) {
            zip.file(key, dict[key]);
        };

        const location = document.getElementById('savedownload');

        zip.generateAsync({ type: "base64" }).then(function (base64) {
            location.href = "data:application/zip;base64," + base64;
            location.click();
        });
    }

    function downloadSaveDir() {
        const savepath = "/data0/" + Module.projectId + "-Save";

        const root = FS.lookupPath(savepath);
        const fileDict = {};

        function lookupAndAdd(node, path) {
            if (FS.isDir(node.mode)) {
                for (const [key, value] of Object.entries(node.contents)) {
                    lookupAndAdd(node.contents[key], path + node.name + "/");
                }
            }
            if (FS.isFile(node.mode)) {
                const filename = (path + node.name).substring(2);
                fileDict[filename] = node.contents.buffer;
            }
        }
        lookupAndAdd(root.node, "");

        zipAndDownloadAllDict(fileDict);
    }

    // Overwrite both cache and main file (create folder if it doesn't exist)
    const saveFiles = (dict) => {
        const savepath = "/data0/" + Module.projectId + "-Save";

        mkdirs(savepath + "/" + targetSaveFileDir);
        mkdirs(targetSaveFileDir);

        for (let key in dict) {
            const path = savepath + "/" + key;
            FS.writeFile(path, dict[key]);
            FS.writeFile(key, dict[key]);
        };
        FS.syncfs(false, function (err) {
            if (err) {
                console.error('Save load sync failed:', err);
            }
            if (typeof Module !== 'undefined' && Module.__asyncjs__syncFS) {
                Module.__asyncjs__syncFS(true).then(() => {
                    showToast("Load complete");
                }).catch(e => {
                    console.error('Failed to reload FS from IDB after bulk save upload:', e);
                    showToast("Load complete (sync error)");
                });
            } else {
                showToast("Load complete");
            }
        });
    }

    function loadAllFiles(selectedFiles, i, stop, dict, onLoadFinished) {
        const file = selectedFiles[i];
        const reader = new FileReader();

        reader.onload = function () {
            var ar = new Uint8Array(reader.result);
            dict[targetSaveFileDir + "/" + file.name] = ar;

            if (i + 1 < stop) {
                loadAllFiles(selectedFiles, i + 1, stop, dict, onLoadFinished);
            } else {
                onLoadFinished(dict);
            }
        }

        reader.readAsArrayBuffer(file);
    }

    function uploadSaveDir() {
        const selectedFiles = document.getElementById("savefiles").files;

        if (selectedFiles.length > 0) {
            loadAllFiles(selectedFiles, 0, selectedFiles.length, {}, saveFiles);
        }
    }
}

{
    let isPlayingGanePadVibration = false;

    //Gamepad vibration implementation
    function playGamePadVibration(inputType, power, time, effectIndex) {
        for (let index = 0; index < navigator.getGamepads().length; ++index) {
            const gamepad = navigator.getGamepads()[index];
            if (gamepad && gamepad.vibrationActuator) {
                if (time <= 0) {
                    isPlayingGanePadVibration = false;
                    gamepad.vibrationActuator.reset();
                } else {
                    // Handled as loading beyond specified milliseconds at once does not work properly
                    isPlayingGanePadVibration = true;
                    const maxtime = 5000;
                    let remaining = time;

                    function playGamePadVibrationRaw() {
                        gamepad.vibrationActuator.playEffect("dual-rumble", {
                            startDelay: 0,
                            duration: remaining > maxtime ? maxtime : remaining,
                            weakMagnitude: power / 1000.0,
                            strongMagnitude: power / 1000.0,
                        });
                        remaining -= maxtime;
                        if(remaining > 0){
                            setTimeout(() => {
                                if (isPlayingGanePadVibration) {
                                    playGamePadVibrationRaw();
                                }
                            }, (maxtime - 1));
                        }else{
                            isPlayingGanePadVibration = false;
                        }
                    }
                    playGamePadVibrationRaw();
                }
            }
        }
    }
}

{
    // Error display handling
    window.onerror = function (msg, file, line, column, err) {
        const errorMessage = msg + "\n" + file + "[line:" + line + "]\n";

        const settingButton = document.getElementById('settings');
        settingButton.style.backgroundColor = '#88000088';

        const errorText = document.getElementById('bwoditorerror');
        errorText.textContent = errorMessage;
    };
}