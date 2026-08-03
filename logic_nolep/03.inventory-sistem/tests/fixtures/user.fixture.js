import bcrypt from "bcryptjs"
import { faker } from '@faker-js/faker';
import { prisma } from "../../lib/prisma.js";
import { randomUUID } from 'node:crypto';

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
    id: randomUUID(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password,
    role: 'user',
    isActive: true,
};

const userTwo = {
    id: randomUUID(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password,
    role: 'user',
    isActive: true,
    isEmailVerified: false
}

const admin = {
    id: randomUUID(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password,
    role: 'admin',
    isEmailVerified: false
}

const insertUsers = async(users) => {
    users = users.map((user) => ({
        ...user,
        password: hashedPassword
    }));
    await prisma.user.createMany({
        data: users,
        skipDuplicates: true
    })
}

export {
    userOne,
    userTwo,
    admin,
    insertUsers
}