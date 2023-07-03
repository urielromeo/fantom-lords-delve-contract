// const MAINNET_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
// const API_ENDPOINT = "https://api.fantomlords.com/the-bonenosher"
// const isPhantomInstalled = window.phantom?.solana?.isPhantom;
// var provider;

// const getProvider = () => {
//     if('phantom' in window) {
//         const provider = window.phantom?.solana;
//         if(provider?.isPhantom) {
//             return provider
//         }
//     }
//     return null;
// }


// const connect = async function() {
//     const ret = {
//         "action": "connect",
//         "status": "ok",
//     };
//     provider = getProvider();
//     try {
//         const response = await provider.connect();
//         ret.public_key = response.publicKey.toString();
//         GMS_API.send_async_event_social(ret);
//     } catch(error) {
//         console.log(error);
//         ret.status = "error";
//         ret["error"] = error;
//         GMS_API.send_async_event_social(ret);
//     }
// }

// const disconnect = async function() {
//     const ret = {
//         "action": "disconnect",
//         "status": "ok",
//     };
//     provider = getProvider();
//     try {
//         const response = await provider.disconnect();
//         GMS_API.send_async_event_social(ret);
//     } catch(error) {
//         console.log(error);
//         ret.status = "error";
//         ret["error"] = error;
//         GMS_API.send_async_event_social(ret);
//     }
// }


// const authStep1 = async function(address) {
//     const rawRes = await fetch(`${API_ENDPOINT}/auth/step/1`, {
//         method: "POST",
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             address: address
//         })
//     });

//     const response = await rawRes.json();
//     return response;    
// }

// const getSignedMessage = async function(message) {
//     console.log({ message });
//     const provider = getProvider();
//     const encodedMessage = new TextEncoder().encode(message);
//     const signedMessage = await provider.signMessage(encodedMessage, "utf8");
//     return signedMessage;
// }

// const authStep2 = async function(address, message, signature) {
//     const rawResAuth = await fetch(`${API_ENDPOINT}/auth/step/2`, {
//         method: 'POST',
//         body: JSON.stringify({ 
//             address: address,
//             message: message,
//             signature: signature
//         }),
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//     });

//     const responseAuth = await rawResAuth.json();
//     console.log("responseAuth:");
//     console.log({ responseAuth });
//     return responseAuth;
// }

// const postHighscore = async function(address, highscore, authToken) {
//     const setHighScoreResponse = await fetch(`${API_ENDPOINT}/highscore`, {
//         method: 'POST',
//         body: JSON.stringify({ 
//             address,
// 			highscore
//         }),
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer: ' + authToken
//         },
//     });

// 	const responseHighScore = await setHighScoreResponse.json();
// 	console.log({ responseHighScore });
//     return responseHighScore;
// };

// const sendHighScore = async function (address, highscore) {
//     const ret = {
//         "action": "highscoreSent",
//         "status": "ok",
//     }; 
//     try {
//         const response = await authStep1(address);
//         console.log("response: "); console.log({ response });
//         const nonce = response.data.user.nonce;
//         console.log({ user: response.data.user }); console.log({ user: response.data.user.nonce });
//         const message = `Sign this message to send your score. Your nonce is: ${nonce}`;
//         const signedMessage = await getSignedMessage(message);
//         const signature = bs58.encode(signedMessage.signature);
//         console.log("signature"); console.log({ signature });
//         const responseAuth = await authStep2(signedMessage.publicKey.toBase58(), message, signature);
//         if("error" in responseAuth) {
//             ret.status = "error";
//             ret["error"] = responseAuth.error;
//             return ret;
//         }
//         const authToken = responseAuth.token;
//         const responseHighScore = await postHighscore(address, highscore, authToken);
//         GMS_API.send_async_event_social(ret);
//     } catch(error) {
//         console.log(error);
//         ret.status = "error";
//         ret["error"] = error;
//         GMS_API.send_async_event_social(ret);
//     }
// }

// const getLeaderboard = async function() {
//     const ret = {
//         "action": "leaderboardData",
//         "status": "ok",
//     };
//     // try {
//     console.log("")
//         const leaderboardResponse = await fetch(`${API_ENDPOINT}/leaderboard`);
//         const leaderboard = await leaderboardResponse.json();
//         ret["leaderboard"] = JSON.stringify(leaderboard);
//         GMS_API.send_async_event_social(ret);
//     // } catch(error) {
//     //     console.log(error);
//     //     ret.status = "error";
//     //     ret["error"] = error;
//     //     GMS_API.send_async_event_social(ret);
//     // }
// }