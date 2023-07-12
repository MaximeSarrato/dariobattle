# Dario Battle

This is a Battle mode-like of Super Mario Bros game.  
We did this as part of the AWS module taught at ISTY by Luca De Feo.

All the images, sounds, videos are the property of &copy;Nintendo.  
We know that the code isn't clean at all, we should rework this project to do something better
with the help of the knowledge we have acquired now.  
Although we put this on GitHub to help some people to understand how a Web-Game is working.

### Technologies used

---

- Socket.IO
- MySQL
- Twig as template engine
- Back-end : Node.js with the Express framework
- Front-End : HTML5, Vanilla Javascript

---

### Environments variables

The environment variables are loaded through the file `config/keys.js`

Following setup is needed for production:

```
module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
};

```

Following setup is needed for development:

```
module.exports = {
  DATABASE_URL: 'myUrl',
  SESSION_SECRET: 'mySessionSecret',
};

```

---

### Start the project

In production:

```
docker-compose -f docker-compose.prod.yml up
```

In development:

```
docker-compose -f docker-compose.dev.yml up
```

### Credits

---

_Developed by Sébastien POIROT & Maxime SARRATO and tutored by Luca De Feo._

# Demo

https://dariobattleapp.herokuapp.com
