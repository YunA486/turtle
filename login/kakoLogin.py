import requests
import json

url = "https://kauth.kakao.com/oauth/token"

data = {
    "grant_type" : "authorization_code",
    "client_id" : "ba63bcb9d653b5a2f136e5f675fd10f8",
    "redirect_uri" : "http://localhost:5500/login/success.html",
    "code"         : "S7NSnmMcQNauLhPL2jUZiaWiDMWQpnoDkWI_lxBtQ93h7ZAOqsCSiUHF_Qvdy2Bs0rEx6wopb7kAAAGBTqbjJw"
    
}
response = requests.post(url, data=data)

tokens = response.json()

print(tokens)

with open("kakao_token.json", "w") as fp:
    json.dump(tokens, fp)