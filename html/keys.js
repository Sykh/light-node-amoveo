
function keys_function1() {
	var file_selector = document.getElementById("privkey_file");	
	var bal_div = document.getElementById("balance");
	var pub_div = document.getElementById("pubkey");
	var watch_only_button = document.getElementById("watch_only");
	var new_pubkey_button = document.getElementById("new_key");
	var update_balance_button = document.getElementById("update_balance");
	
	update_balance_button.onclick = update_balance;
	file_selector.onchange = load_keys;
	watch_only_button.onclick = watch_only_func; 
	new_pubkey_button.onclick = new_keys_check;

	
    var ec = new elliptic.ec('secp256k1');
    var keys = new_keys();

    //update_pubkey();
    function input_maker(val) {
        var x = document.createElement("input");
        x.type = "text";
        x.value = val;
        return x;
    }
    function new_keys_watch(x) {
	return ec.keyFromPublic(x);
    }
    function new_keys_entropy(x) {
        return ec.genKeyPair({entropy: hash(serialize([x]))});
    }
    function new_keys() {
        return ec.genKeyPair();
    }
    function pubkey_64() {
        var pubPoint = keys.getPublic("hex");
        return btoa(fromHex(pubPoint));
    }
    function sign_tx(tx) {
	if (tx[0] == "signed") {
	    console.log(JSON.stringify(tx));
	    var sig = btoa(array_to_string(sign(tx[1], keys)));
	    var pub = pubkey_64();
	    if (pub == tx[1][1]) {
		tx[2] = sig;
	    } else if (pub == tx[1][2]) {
		tx[3] = sig;
	    } else {
		console.log(JSON.stringify(tx));
		throw("sign error");
	    }
	    return tx;
	} else {
            var sig = btoa(array_to_string(sign(tx, keys)));
            return ["signed", tx, sig, [-6]];
	}
    }
    function update_pubkey() {
        pub_div.innerHTML = pubkey_64();
    }
    function watch_only_func() {
	var v = watch_only_pubkey.value;
	keys = new_keys_watch(string_to_array(atob(v)));
	update_pubkey();
    }
    function new_keys_check() {
        //alert("this will delete your old keys. If you havemoney secured by this key, and you haven't saved your key, then this money will be destroyed.");
        var warning = document.createElement("h3");
        warning.innerHTML = "This will delete your old keys from the browser. Save your keys before doing this.";
        var button = button_maker2("cancel ", cancel);
        var button2 = button_maker2("continue", doit);
	var entropy_txt = document.createElement("h3");
	entropy_txt.innerHTML = "put random text here to make keys from";
	var entropy = document.createElement("input");
	entropy.type = "text";
        append_children(pub_div, [warning, button, br(), button2, entropy_txt, entropy]);
	// add interface for optional entropy 
        function cancel() {
            pub_div.innerHTML = "";
        }
        function doit() {
            pub_div.innerHTML = "";
	    var x = entropy.value;
	    if (x == '') {//If you don't provide entropy, then it uses a built in random number generator.
		keys = new_keys();
		set_balance(0);
	    } else {
		keys = new_keys_entropy(x);
	    }
            update_pubkey();
        }
    }
    function check_balance(Callback) {
        var trie_key = pubkey_64();
        var top_hash = hash(headers_object.serialize(headers_object.top()));
        merkle.request_proof("accounts", trie_key, function(x) {
	    Callback(x[1]);
        });
    }
    function update_balance() {
        var trie_key = pubkey_64();
        var top_hash = hash(headers_object.serialize(headers_object.top()));
        merkle.request_proof("accounts", trie_key, function(x) {
            set_balance(x[1] / token_units());
        });
    }
    function set_balance(n) {
        bal_div.innerHTML = (n.toString()+" VEO");
    }
    function save_keys() {
        download(keys.getPrivate("hex"), save_name.value, "text/plain");
	update_pubkey();
    }
    function load_keys() {
        var file = (file_selector.files)[0];
        var reader = new FileReader();
        reader.onload = function(e) {
	    set_balance(0);
            keys = ec.keyFromPrivate(reader.result, "hex");
            update_pubkey();
            update_balance();
        }
        reader.readAsText(file);
    }
    function encrypt(val, to) {
        return encryption_object.send(val, to, keys);
    }
    function decrypt(val) {
	return encryption_object.get(val, keys);
    }
    return {make: new_keys, pub: pubkey_64, sign: sign_tx, ec: (function() { return ec; }), encrypt: encrypt, decrypt: decrypt, check_balance: check_balance};
}
var keys = keys_function1();
