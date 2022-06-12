// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";
let model, webcam, ctx, labelContainer, maxPredictions;

const stretchingNum = 3;
// 생성일(시작 날짜)
var startToday = new Date();
// 스트레칭 시작 시간
var stratTime = 0;
// 스트레칭 개수
var cnt = 0;
// 스트레칭 완료 시간
var endTime = 0;

function pause() {
    webcam.pause();
}

function restart() {
    webcam.play();
}

function move() {

    // 버튼 누르면 위치 이동
    setTimeout(function () {
        document.getElementById("content").style.display = "inline";
        document.getElementById("first").style.display = "flex";
        document.getElementById("first").style.justifyContent = "center";
    }, 1500);

}


async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // 버튼 누르면 버튼 보임
    setTimeout(function () {
        document.getElementById("pausebtn").style.visibility = "visible";
        document.getElementById("restartbtn").style.visibility = "visible";
    }, 1500);

    // 시작 시간
    var startHours = ('0' + startToday.getHours()).slice(-2);
    var startMinutes = ('0' + startToday.getMinutes()).slice(-2);
    var startSeconds = ('0' + startToday.getSeconds()).slice(-2);

    var startTimeString = startHours + ':' + startMinutes + ':' + startSeconds;

    // 전역 변수에 넣기
    stratTime = startTimeString;

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 600;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

var posture = "down";

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const {
        pose,
        posenetOutput
    } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    if (prediction[0].probability.toFixed(2) == 1) {

        posture = "up"

    } else if (prediction[1].probability.toFixed(2) == 1) {
        if (posture == "up") {
            cnt++;
            if (cnt <= 10) {
                var audio = new Audio('../count/' + cnt + '.mp3');
                audio.play();
            }
            if (cnt == 10) {
                var audio = new Audio('../count/end.mp3');
                audio.play();
                return;
            }
        }
        posture = "down"
    }

    labelContainer.innerHTML = cnt + "개";

    if (cnt >= 10) {
        labelContainer.innerHTML = "수고하셨습니다.";
    }

    if (cnt == 10) {

        var endToday = new Date()

        // 완료 시간
        var endHours = ('0' + endToday.getHours()).slice(-2);
        var endMinutes = ('0' + endToday.getMinutes()).slice(-2);
        var endSeconds = ('0' + endToday.getSeconds()).slice(-2);

        const endTimeString = endHours + ':' + endMinutes + ':' + endSeconds;

        // 전역 변수에 담기
        endTime = endTimeString;

        console.log(stretchingNum);
        console.log(startToday);
        console.log(stratTime);
        console.log(endTime);
        console.log(cnt);
    }

    // 무슨 동작을 하는지 적힘
    // for (let i = 0; i < maxPredictions; i++) {
    //     const classPrediction =
    //         prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    //     labelContainer.childNodes[i].innerHTML = classPrediction;
    // }

    // finally draw the poses
    drawPose(pose);

}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}
