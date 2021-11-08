db.createUser({
    user: 'connect',
    pwd: 'pastime123',
    roles: [
      {
        role: 'readWrite',
        db: 'ludo'
      }
    ]
  })

  