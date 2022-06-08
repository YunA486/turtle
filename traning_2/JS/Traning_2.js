// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";
let model, webcam, ctx, labelContainer, maxPredictions;

// 스트레칭 번호
const stretchingNum = 2;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // 생성일(시작 날짜)
    var startToday = new Date()
    console.log(startToday)

    // 시작 시간
    var startHours = ('0' + startToday.getHours()).slice(-2);
    var startMinutes = ('0' + startToday.getMinutes()).slice(-2);
    var startSeconds = ('0' + startToday.getSeconds()).slice(-2);

    var startTimeString = startHours + ':' + startMinutes + ':' + startSeconds;

    console.log(startTimeString)

    // 이미지 삭제
    document.getElementById('temp_img').remove();

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

var posture = "side"
// 스트레칭 개수
var count = 0

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

        posture = "down"

    } else if (prediction[1].probability.toFixed(2) >= 0.9) {

        if (posture == "down") {
            count++
            var audio = new Audio('../count/' + count + '.mp3');
            audio.play();
        }

        posture = "up"

    } else if (prediction[2].probability.toFixed(2) == 1) {

        posture = "side"

    } else if (prediction[3].probability.toFixed(2) == 1) {

        if (posture == "up") {
            var audio = new Audio('../count/bent.mp3');
            audio.play();
        } else if (posture == "down") {
            var audio = new Audio('../count/bent.mp3');
            audio.play();
        }

        posture = "fault"

    }

    if (count == 3) {

        var endToday = new Date()
        console.log(endToday)
    
        // 완료 시간
        var EndHours = ('0' + endToday.getHours()).slice(-2);
        var EndMinutes = ('0' + endToday.getMinutes()).slice(-2);
        var EndSeconds = ('0' + endToday.getSeconds()).slice(-2);
    
        var EndTimeString = EndHours + ':' + EndMinutes + ':' + EndSeconds;
        console.log(EndTimeString)
    
    }

    // if (count == 3){
    //     var audio = new Audio('../count/end.mp3');
    //     audio.play();
    // }

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

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
