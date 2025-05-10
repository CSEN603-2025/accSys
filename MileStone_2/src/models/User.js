// models/User.js
export class User {
    constructor(id, username, email, role, password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password
        this.role = role;
    }
}
