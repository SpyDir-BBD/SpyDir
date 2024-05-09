import { setTheme } from "../classes/styleSwitcher.js";

export class AuthManager {
    constructor(authCode) {
        if (AuthManager.instance) {
            return AuthManager.instance;
        }

        AuthManager.instance = this;
        this.init(authCode);
    }

    init(authCode) {
        if (authCode) {
            // fetch access token from api
            const request = fetch('/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "authCode": `${authCode}`
                })
            })
            .then(response => response.text())
            .then(data => {
                //console.log('Data:', data);
                if (data) {
                    this.access_token = data;
                    // start hitting api endpoints using access_token
                    this.setUserInfo();
                } 
                else {
                    console.error('Access token not found in the response data');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } 
        else {
            this.loggedIn = false;
            this.username = null;
            this.imageURL = null;
            this.access_token = null;
        }
    }

    logout() {
        this.loggedIn = false;
        this.username = null;
        this.imageURL = null;
        this.access_token = null;
    }

    async setUserInfo() {
        console.log("Setting user info");
        const url = 'https://api.github.com/user';
        const headers = {
            'Authorization': `Bearer ${this.access_token}`,
            'User-Agent': 'SpyDir',
            'Accept': 'application/json',
            'Origin': 'http://localhost:5000',
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
                mode: 'cors'
            });

            if (!response.ok) {
                console.log("USER INFO RESPONSE:", await response.json());
                throw new Error(`Failed to fetch user information:`);
            }

            const userInfo = await response.json();
            this.username = userInfo.login;
            this.imageURL = userInfo.avatar_url;
            this.loggedIn = true;


            /*****************************************************************/
            
            const request = await fetch('/api/user', {
                method: 'POST', // or 'POST' depending on your server endpoint
                headers: {
                    "Authorization": `Bearer ${this.access_token}`,
                },
                body: JSON.stringify({
                    "username": `${this.username}`,
                    "theme_id": "1"
                })
            })
            .then( res => res.json())
            .then( (data) => {
                //console.log(data);
                //console.log("============================");
                this.user_id = data["user_details"]["id"];
                this.theme_id = data["user_details"]["themepreference"];
                setTheme(this.theme_id);
                document.getElementById("loginButton").classList.add("hidden");
                document.getElementById("loginDesc").classList.add("hidden");
                document.getElementById("burgerButton").classList.remove("hidden");
                document.getElementById("burgerButton").classList.add("material-symbols-outlined");
                var name = document.getElementById('userName');
                var navName = document.getElementById('navUserName');
                name.innerText = this.username;
                navName.innerText = this.username;
            })
            .catch( err => console.log(err));

            console.log("===========================");

            const info = await request.json();
            console.log("info", info);
            if (!request.ok) {
                console.log("USER INFO RESPONSE:", await request.json());
                throw new Error(`Failed to fetch user information:`);
            }

            console.log("===========================");
        } 
        catch (error) {
            console.error('Error fetching user information:', error.message);
            return null;
        }
    }
}
