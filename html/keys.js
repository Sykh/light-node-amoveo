var keys_object = keys_function();

function keys_function() {		
	
	var file_selector = document.getElementById("privkey_file");	
	var bal_div = document.getElementById("balance");
	var pub_div = document.getElementById("pubkey");
	var spend_div = document.getElementById("spend_div");

	var save_name = "Amoveo private key";
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
		update_balance();
    }
    function new_keys_check() {
        //alert("this will delete your old keys. If you havemoney secured by this key, and you haven't saved your key, then this money will be destroyed.");
       if (confirm("This will delete your old keys from the browser. Save your keys before doing this.")) {
		   pub_div.innerHTML = "";
	    
			keys = new_keys();			
			update_pubkey();
			update_balance(true);
			save_keys();
	   }
	   else {
	   }        
    }
    function check_balance(Callback) {
        var trie_key = pubkey_64();
		console.log("check_balance "+trie_key);
        var top_hash = hash(headers_object.serialize(headers_object.top()));
        merkle.request_proof("accounts", trie_key, function(x) {
	    Callback(x[1]);
        });
    }
    function update_balance(new_account = false) {
        var trie_key = pubkey_64();
        var top_hash = hash(headers_object.serialize(headers_object.top()));
		if (!new_account) {
				merkle.request_proof("accounts", trie_key, function(x) {				
				set_balance(x[1] / token_units());
				spend_div.style.display = "inline";
			});
		}
		else {
			bal_div.innerHTML = "New Accounts got no balance.";		
		}
	}
		
    function set_balance(n) {
        bal_div.innerHTML = (n.toString()+" VEO");
    }
    function save_keys() {
        download(keys.getPrivate("hex"), save_name, "text/plain");
    }
	
    function load_keys() {		
        var file = (file_selector.files)[0];
        var reader = new FileReader();
        reader.onload = function(e) {
	    //set_balance(0);
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
	
    return {make: new_keys, pub: pubkey_64, sign: sign_tx, ec: (function() { return ec; }), 
			encrypt: encrypt, decrypt: decrypt, check_balance: check_balance, new_keys_check: new_keys_check, 
			update_balance: update_balance, load_keys: load_keys, watch_only_func: watch_only_func};
}