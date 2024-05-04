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
        // Define the OAuth parameters
        const clientId = 'Ov23liaDwohBlKUDcyxf';
        const clientSecret = '35fc740302da539577a52b0a40b20ca7caa9d283';
        const redirectUri = 'http://localhost:5000';

        // Construct the URL for your server-side endpoint
        const proxyUrl = `http://localhost:5000/github-data?clientId=${clientId}&clientSecret=${clientSecret}&redirectUri=${encodeURIComponent(redirectUri)}&code=${authCode}`;

// Make a GET request to your server-side endpoint
fetch(proxyUrl, {
    method: 'GET',
})
        .then(response => response.text())
        .then(data => {
            const access_token = data.split('access_token=')[1].split('&scope')[0];

            console.log('Data:', data);
            // Process the response data and set access token
            if (access_token) {
                this.access_token = access_token;
                this.setUserInfo();
            } else {
                console.error('Access token not found in the response data');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

      } else {
          this.loggedIn = false;
          this.username = null;
          this.imageURL = null;
          this.access_token = null;
      }
  }

  async setUserInfo() {
      console.log("Setting user info");
      const url = 'https://api.github.com/user';
      const headers = {
          'Authorization': `Bearer ${this.access_token}`,
          'User-Agent': 'SpyDir',
          'Accept': 'application/json',
          'Origin': 'http://localhost:5000'
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
          var name = document.getElementById('userName');
          var navName = document.getElementById('navUserName');
          name.innerText = this.username;
          navName.innerText = this.username;
      } catch (error) {
          console.error('Error fetching user information:', error.message);
          return null;
      }
  }

}
