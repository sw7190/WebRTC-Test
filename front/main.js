let rtc = null;;

const startEvent = () => {
    if (rtc) rtc.start();
}

const stopEvent = () => {
    if (rtc) rtc.stop()
}

const createConnEvent = () => {
    const key = document.getElementById('key').value;
    rtc = new Connection(key);
}

const joinConnEvent = () => {
    const key = document.getElementById('key2').value;
    rtc.join(key);
}

