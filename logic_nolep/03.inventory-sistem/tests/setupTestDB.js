import { prisma } from "../lib/prisma.js";
import { userOne, userTwo, admin , insertUsers } from "./fixtures/user.fixture.js";

const setUpTestDB = () => {
    beforeEach(async () => {
        // await prisma.orderItem.deleteMany();
        // await prisma.order.deleteMany();
        // await prisma.product.deleteMany();
        // await prisma.category.deleteMany();
        await prisma.token.deleteMany();
        await prisma.user.deleteMany();

        await insertUsers([userOne, userTwo, admin]);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
}

export default setUpTestDB;