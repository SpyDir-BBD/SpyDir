class AuthManager {
    constructor(authCode) {
      if (AuthManager.instance) {
        return AuthManager.instance;
      }
  
      AuthManager.instance = this;
      this.init(authCode);
    }
  
    init(authCode) {
      
      if (authCode) {
        const ClientId = 'Ov23liaDwohBlKUDcyxf';
        const ClientSecret = '35fc740302da539577a52b0a40b20ca7caa9d283';
        const RedirectUri = 'http://localhost:5000';

        fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any other headers as needed
          },
          body: JSON.stringify({
            "client_id": ClientId,
            "client_secret": ClientSecret,
            "code": authCode,
            "redirect_uri": RedirectUri,
        },)
        })
        .then(async response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return await response.text();
        })
        .then(data => {
          console.log('Data: ', data);
          this.access_token = data.split('access_token=')[1].split('&scope=')[0];
          this.setUserInfo();
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
    async setUserInfo(accessToken) {
      const url = 'https://api.github.com/user';
      const headers = {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'GitHubAPI',
      };
  
      try {
          const response = await fetch(url, {
              method: 'GET',
              headers: headers
          });
  
          if (!response.ok) {
              throw new Error(`Failed to fetch user information: ${await response.text()}`);
          }
  
          const userInfo = await response.json();
          console.log(userInfo);
          return userInfo;
      } catch (error) {
          console.error('Error fetching user information:', error.message);
          return null;
      }
    }

  }

  module.exports = {
    AuthManager,
  };