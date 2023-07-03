const FantomLordsABI =[{
    "inputs": [{
        "internalType":"address",
        "name":"_owner",
        "type":"address"
    }],
    "name":"walletOfOwner",
    "outputs":[{
        "internalType":"uint256[]",
        "name":"",
        "type":"uint256[]"
    }],
    "stateMutability":"view",
    "type":"function"
}];
const AscendedLordsABI = [{
    "inputs": [
        {
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }
    ],
    "name": "balanceOf",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
    },{
    "inputs": [
        {
            "internalType": "address",
            "name": "owner",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
        }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}];

const DelveContractABI = [
    {
        "inputs":[],
        "name":"delve",
        "outputs":[],
        "stateMutability":"payable",
        "type":"function"
    },
    {
        "inputs":[],
        "name":"gamePrice",
        "outputs":[{
            "internalType":"uint256",
            "name":"",
            "type":"uint256"
        }],
        "stateMutability":"view",
        "type":"function"
    }
];

const FantomLordsAddress    = "0xfee8077c909d956e9036c2d2999723931cefe548";
const AscendedLordsAddress  = "0x6139b9c548fbd1c50d2768f3464d89c8744ab5f2";
const DelveContractAddress  = "0xd7c721bacad18c4a847a8448e793b079e8d7eacf";

const API_ENDPOINT = "https://api.fantomlords.com/relic-survive";

const getWeb3 = () => { return new Web3(window.ethereum); };

const checkEthereum = () => { return typeof window.ethereum !== 'undefined' };

const getAccount = async () => {
    const ret = {
        action: "gotAccountData",
        status: "success",
        addresses: "",
    };
    try {
        const addresses = await ethereum.request( { method: 'eth_requestAccounts' } );
        ret.addresses = addresses.join("|")
    } catch (error) {
        ret.status = "error";
        ret.error = error;
    };
    GMS_API.send_async_event_social(ret);
    return 0;
}

const getOwnedLords = async function(address) {
    const ret = {
        action: "ownedLordsData",
        status: "success",
        lords: "",
        ascendedLords: ""  
    };
    try {
        ret.lords = await checkLords(address);
        ret.ascendedLords = await checkAscendedLords(address);
    } catch (error) {
        console.log(error);
    }
    GMS_API.send_async_event_social(ret);
}

const delveContract = function() {
    const web3 = getWeb3();
    return new web3.eth.Contract(DelveContractABI, DelveContractAddress);
}

const fantomLordsContract = function() {
    const web3 = getWeb3();
    return new web3.eth.Contract(FantomLordsABI, FantomLordsAddress);
}

const ascendedLordsContract = function() {
    const web3 = getWeb3();
    return new web3.eth.Contract(AscendedLordsABI, AscendedLordsAddress);
}

const getFantomLordsTokens = async function(contract, address) {
    let tokens = [];
    try {
		tokens = await contract.methods.walletOfOwner(address).call();
        tokens = tokens.map( token => parseInt(tokens));
    } catch (error) {
        console.log(error);
    }
    console.log("ascended lords: " + tokens);
    return tokens;
}

const getAscendedLordsTokens = async function(contract, address) {
    let tokens = [];
    try {
        console.log("before tokencount");
        const tokenCount = await contract.methods.balanceOf(address).call();
        console.log(tokenCount);
        for (let i = 0; i < tokenCount; i++) {
            console.log("before tokenOfOwnerByIndex");
            const tokenByIndex = await contract.methods.tokenOfOwnerByIndex(address, i).call();
            tokens.push(tokenByIndex);
        }
    } catch (error) {
        console.log(error);
    }
    console.log("ascended lords: " + tokens);
    return tokens;
}

const checkLords = async function(address) {
    const contract = fantomLordsContract();
    const tokens = await getFantomLordsTokens(contract, address);
    return tokens.join(",");
}

const checkAscendedLords = async function(address) {
    const contract = ascendedLordsContract();
    const tokens = await getAscendedLordsTokens(contract, address);
    return tokens.join(",");
}

const authStep1 = async function(address) {
    const rawRes = await fetch(`${API_ENDPOINT}/auth/step/1`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            address: address
        })
    });

    const response = await rawRes.json();
    return response;    
}

const authStep2 = async function(address, message, signature) {
    const rawResAuth = await fetch(`${API_ENDPOINT}/auth/step/2`, {
        method: 'POST',
        body: JSON.stringify({ 
            address: address,
            message: message,
            signature: signature
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    const responseAuth = await rawResAuth.json();
    console.log("responseAuth:");
    console.log({ responseAuth });
    return responseAuth;
}

const asyncLogin = async function(address) {
    const ret = {
        "action": "asyncLogin",
        "status": "ok",
        "authToken": ""
    };
    try {
        const response = await authStep1(address);
        console.log("response: "); console.log({ response });
        const nonce = response.data.user.nonce;
        console.log({ user: response.data.user }); console.log({ user: response.data.user.nonce });
        // const message = `Sign this message to sign in. Your nonce is: ${nonce}`;
        const message = `Sign this message to log in. Your nonce is: ${nonce}`;
        const signature = await ethereum.request({ 
            method: 'personal_sign', 
            params: [ 
                message,
                address
            ]
        });
        console.log("signature"); console.log({ signature });
        const responseAuth = await authStep2(address, message, signature);
        if("error" in responseAuth) { throw new Error('error during log in'); }
        const authToken = responseAuth.token;
        ret.authToken = authToken;
        GMS_API.send_async_event_social(ret);
    } catch(error) {
        ret.action = "asyncLoginError";
        GMS_API.send_async_event_social(ret);
    }
}


const confirmTransaction = async function(txSignature, authToken) {
    const ret = {
        "action": "confirmedTx",
        "status": "ok",
    };
    try {
        const rawRes = await fetch(`${API_ENDPOINT}/checkTx/${txSignature}`, {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer: ' + authToken
            },
        });
        const json = await rawRes.json();
        console.log({ json });
        const validTx = json.valid;
        ret["validTx"] = validTx;
        GMS_API.send_async_event_social(ret);
    } catch(error) {
        console.log(error);
        GMS_API.send_async_event_social(ret);
    }
} 

const delve = async function(address) {
    const ret = {
        "action": "onPaidGame",
        "status": "ok",
        "txHash": "" 
    };
    try {
        const contract = delveContract();
        const price = await contract.methods.gamePrice().call();
        console.log(`delve price is: ${price}`);
        const receipt = await contract.methods.delve().send({
            from: address,
            value: price,
            maxPriorityFeePerGas: null, 
            maxFeePerGas: null,
            gasPrice: null,
            gas: null
        });
        console.log(receipt);
        ret.txHash = receipt.transactionHash;            
    } catch (error) {
        console.log(error);
    }
    GMS_API.send_async_event_social(ret);
}

const getLeaderboard = async function() {
    const ret = {
        "action": "leaderboardData",
        "status": "ok",
    };
    // try {
    console.log("")
    const leaderboardResponse = await fetch(`${API_ENDPOINT}/leaderboard`);
    const leaderboard = await leaderboardResponse.json();
    ret["leaderboard"] = JSON.stringify(leaderboard);
    GMS_API.send_async_event_social(ret);
    // } catch(error) {
    //     console.log(error);
    //     ret.status = "error";
    //     ret["error"] = error;
    //     GMS_API.send_async_event_social(ret);
    // }
}

const postHighscore = async function(address, highscore, authToken) {
    const setHighScoreResponse = await fetch(`${API_ENDPOINT}/highscore`, {
        method: 'POST',
        body: JSON.stringify({ 
            address,
			highscore
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer: ' + authToken
        },
    });

	const responseHighScore = await setHighScoreResponse.json();
	console.log({ responseHighScore });
    return responseHighScore;
};

const sendHighScore = async function (address, authToken, highscore) {
    const ret = {
        "action": "highscoreSent",
        "status": "ok",
    }; 
    try {
        const responseHighScore = await postHighscore(address, highscore, authToken);
        GMS_API.send_async_event_social(ret);
    } catch(error) {
        console.log(error);
        ret.status = "error";
        ret["error"] = error;
        GMS_API.send_async_event_social(ret);
    }
}


window.ethereum.on('accountsChanged', function (accounts) {
    const ret = {
        "action": "accountsChanged",
        "status": "ok",
    }; 
    GMS_API.send_async_event_social(ret);
})