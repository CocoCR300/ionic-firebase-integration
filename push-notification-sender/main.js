import https from "https";
import fs from "fs";
import { google } from "googleapis";

const PROJECT_ID = "project/mobile-dev-test-4c648";
const HOST = "fcm.googleapis.com";
const PATH = `/v1/projects/${PROJECT_ID}/messages:send`;
const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];

function getAccessToken() {
	return new Promise(function(resolve, reject) {
		const key = JSON.parse(fs.readFileSync("secrets/service-account-key.json"));

		const jwtClient = new google.auth.JWT({
			email: key.client_email,
			keyFile: null,
			key: key.private_key,
			scopes: SCOPES,
			keyId: null
		});

		jwtClient.authorize(function(err, tokens) {
			if (err) {
				reject(err);
				return;
			}
			resolve(tokens.access_token);
		});
	});
}

async function sendFcmMessage(fcmMessage) {
	const accessToken = await getAccessToken();
	const options = {
		hostname: HOST,
		path: PATH,
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
		
	};

	return new Promise((resolve, reject) => {
		const request = https.request(options, function(resp) {
			resp.setEncoding('utf8');
			resp.on('data', function(data) {
				console.log('Message sent to Firebase for delivery, response:');
				console.log(data);
			});
		});

		request.on('response', function(response) {
			console.log("Got response from FCM");
			console.log(response);
		});

		request.on('finish', function() {
			console.log('Message sent to Firebase for delivery');
			resolve();
		});

		request.on('error', function(err) {
			console.log('Unable to send message to Firebase');
			console.log(err);

			reject();
		});

		request.write(JSON.stringify(fcmMessage));
		request.end();
	});
}

function buildCommonMessage(title, body, topic) {
	return {
		message: {
			token: "",
			//topic,
			notification: {
				title,
				body
			},
			//data: { }
		}
	};
}

const args = process.argv.slice(2);
console.log(`Received arguments: ${args}`);

const action = args[0];
const title = args[1];
const body = args[2];
const topic = args[3];

if (action == "send") {
	const message = buildCommonMessage(title, body, topic);
	await sendFcmMessage(message);
}
else {
	console.log("Invalid command. Please use one of the following:\n"
		+ "node index.js send\n"
		+ "node index.js send-topic"
	);
}

