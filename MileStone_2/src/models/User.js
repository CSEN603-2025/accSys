// models/User.js
export class User {
    constructor(id, name, email, role, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password
        this.role = role;
    }
}
