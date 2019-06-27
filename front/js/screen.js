class ScreenHandler {
    constructor(videoElement) {
        this.config = {
            width: 1980,
            height: 1080,
            frameRate: 10, // 최대 프레임 
        }
        this.videoElement = videoElement;
        this.stream = null;
    }

    start() {
        return new Promise((res, rej) => {
            this.getMyStream()
            .then((stream) => {
                this.stream = stream;
                this.videoElement.srcObject = stream;
                res('ok');
            })
            .catch((err) => {
                this.stream = null;
                console.log("failed get my stream: " + err.name);
                res('error');
            })
        })
        // this.videoElement.srcObject = this.stream;
    }

    stop() {
        this.stream.getTracks().forEach(x => x.stop());
    }

    getMyStream() {
        if (navigator.mediaDevices.getDisplayMedia) {
            return navigator.mediaDevices.getDisplayMedia(this.config);
        }
    }

    getStream() {
        return this.stream;
    }

    setStream(stream) {
        console.log(this.videoElement);
        this.stream = stream;
        this.videoElement.srcObject = stream;
    }
}