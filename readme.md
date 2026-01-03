
# ChainArt API

Documentation for handles features in arbiFans


## Features

- create creator
- submit asset
- show assets
- show assets by id
- Unlock assets
- Get profile
- Login creator


## Tech Stack

**Server:** Node js, Express js


## API Reference

#### Add creator

```
  POST api/creator/register
```
Request
header: content-type:application/json
```json
{
    "name":"arr",
    "walletAddress":"ajwefiaisdjfijfadsifsd"
}
```
Response
```json
{
    "id": 1,
    "name": "arr"
}
```

#### submit asset
header: content-type:application/json
```
  POST api/creator/assets
```
Request
```json
{
        "creatorId":1,
        "url":"httpkwkwka",
        "price": 0.30,
        "description": "Inug dan andre",
}
```
Response
```json
{
    "message": "success",
    "data": {
        "id": 1,
        "creatorId": 1,
        "price": 0.3,
        "description": "Inug dan andre",
        "Url": "httpkwkwka",
        "unlockableContent": false
    }
}
```

#### show assets
header: content-type:application/json
```
  GET api/creator/assets
```

Response
```json
{
    
    {
        "id": 1,
        "creatorId": 1,
        "price": 0.3,
        "description": "Inug dan andre",
        "Url": "httpkwkwka",
        "unlockableContent": false
    },
       {
        "id": 1,
        "creatorId": 1,
        "price": 0.3,
        "description": "Inug dan andre",
        "Url": "httpkwkwka",
        "unlockableContent": false
    }
}
```

#### show assets by id
header: content-type:application/json
```
  GET api/creator/assets/{1}
```

Response
```json
       {
        "id": 1,
        "creatorId": 1,
        "price": 0.3,
        "description": "Inug dan andre",
        "Url": "httpkwkwka",
        "unlockableContent": false
    }
```

#### show assets off creator
header: content-type:application/json
```
  GET api/creator/assets-creator/{idCreator}
```

Response
```json
      {
    
    {
        "id": 1,
        "creatorId": 1,
        "price": 0.3,
        "description": "Inug dan andre",
        "Url": "httpkwkwka",
        "unlockableContent": false
    },
       {
        "id": 1,
        "creatorId": 1,
        "price": 0.3,
        "description": "Inug dan andre",
        "Url": "httpkwkwka",
        "unlockableContent": false
    }
}
```

#### get profile
header: content-type:application/json
```
  GET api/creator/assets-creator/:idCreator
```

Response
```json
   {
    "id": 1,
    "name": "arr",
    "walletAddress": "ajwefiaisdjfijfadsifsd"
}
```

#### Login creator
header: content-type:application/json
```
  POST api/creator/login
```
request:
```json
{
  "username": "dio sahabat andre",
  "walletAddress":"0xkaswjaskjas"
}
```
Response
```json
   {
    "creatorId": 1,
}
```

## Deployment
### Domain
```bash
  backend-dev-new.vercel.app
```

