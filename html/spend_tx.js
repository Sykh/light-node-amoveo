var spend_object = spend_function();

function spend_function() {	
	var error_msg = document.getElementById("spend_text");
	var raw_tx = document.getElementById("spend_text");
	var spend_address = document.getElementById("spend_address");
	var spend_amount = document.getElementById("spend_amount");
	var mode;
	
	function signedTX() {
		mode = "sign";
		spend_tokens();
    };
	
	function rawTX() {
		mode = "raw";
		spend_tokens();
    };
	
	function calculate_max_send_button() {
		keys_object.check_balance(function(Amount) {
			var to0 = spend_address.value;
			var to = parse_address(to0);
			if (to == 0) {
				error_msg.innerHTML = "please input the recipient's address";
			} 
			else {
				error_msg.innerHTML = "";
			}
			var CB2 = function(fee) {
				var A2 = Amount - fee - 1;
				spend_amount.value = (A2 / token_units()).toString();
			};
			fee_checker(to, CB2, CB2);
	})};

    var fee;
    function spend_tokens() {
        //spend_address = document.getElementById("spend_address");
        var to0 = spend_address.value.trim();
		var to = parse_address(to0);
        var amount = Math.floor(parseFloat(spend_amount.value, 10) * token_units());

		if (to == 0) {
			error_msg.innerHTML = "Badly formatted address";
		} 
		else {
			error_msg.innerHTML = "";
			//spend_amount = document.getElementById("spend_amount");
			var from = keys_object.pub();
			fee_checker(to, function (Fee) {
			fee = Fee;
			variable_public_get(["create_account_tx", amount, Fee, from, to], spend_tokens2);
			}, function (Fee) {
			fee = Fee;
			variable_public_get(["spend_tx", amount, Fee, from, to], spend_tokens2);
			});
		}
    }
    function fee_checker(address, Callback1, Callback2) {
	variable_public_get(["account", address],
			    function(result) {
			       if (result == "empty") {
				   merkle.request_proof("governance", 14, function(gov_fee) {
				       var fee = tree_number_to_value(gov_fee[2]) + 50;
				       Callback1(fee);
				   });
			       } else {
				   merkle.request_proof("governance", 15, function(gov_fee) {
				       var fee = tree_number_to_value(gov_fee[2]) + 50;
				       Callback2(fee);
				   });
			       }});
    }
    function spend_tokens2(tx) {
        var amount = Math.floor(parseFloat(spend_amount.value, 10) * token_units());
        var amount0 = tx[5];
        var to = spend_address.value.trim();
        var to0 = tx[4];
        var fee0 = tx[3];
        if (!(amount == amount0)) {
            console.log("amounts");
            console.log(amount);
            console.log(amount0);
            console.log(tx[2]);
            console.log("abort: server changed the amount.");
        } else if (!(to == to0)) {
            console.log("abort: server changed who we are sending money to.");
        } else if (!(fee == fee0)) {
	    console.log("fees");
	    console.log(fee);
	    console.log(fee0);
	    console.log(JSON.stringify(tx));
            console.log("abort: server changed the fee.");
        } else {
            console.log(JSON.stringify(tx));
	    if (mode == "sign") {
		var stx = keys_object.sign(tx);
		console.log(JSON.stringify(stx));
		console.log("pubkey is ");
		console.log(to);
		console.log(keys_object.pub());
		variable_public_get(["txs", [-6, stx]], function(x) {
		    console.log(x);
		    var msg = ((amount/token_units()).toString()).concat(" VEO successfully sent. txid =  ").concat(x);
		    error_msg.innerHTML = msg;
		});
	    } else if (mode == "raw") {
		raw_tx.innerHTML = JSON.stringify(tx);
	    }
        }
        spend_amount.value = "";
    }

	return{signedTX: signedTX, rawTX: rawTX, max_amount: calculate_max_send_button};
}
