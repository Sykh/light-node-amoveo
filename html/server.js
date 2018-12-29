//make ip and port as input things.
if (document.URL[0] == 'f') {
    console.log("running stand-alone light node");
} else {
    console.log("running light node served from a full node");
    server_port.value = document.URL.split(":")[2].substring(0, 4);
};

function get_port() {
    return parseInt(document.getElementsByName("node_port")[0].value, 10);
}
function get_ip() {
    //return JSON.parse(server_ip.value);
    return document.getElementsByName("node_ip")[0].value;
}
