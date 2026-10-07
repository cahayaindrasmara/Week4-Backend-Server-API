import { prisma } from "../lib/prisma.js";
import { userOne, userTwo, admin , insertUsers, userForDelete } from "./fixtures/user.fixture.js";
import { categoryForDelete, categoryOne, categoryTwo, insertCategories } from "./fixtures/category.fixture.js"
import { productOne, productTwo, insertProducts, productForDelete } from "./fixtures/product.fixture.js"
import { insertOrders, orderForDelete, orderOne, orderTwo } from "./fixtures/order.fixture.js";
import { insertOrderItems, orderItemFour, orderItemOne, orderItemThree, orderItemTwo } from "./fixtures/orderItems.fixture.js";

const setUpTestDB = () => {
    beforeEach(async () => {
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.token.deleteMany();
        await prisma.user.deleteMany();

        await insertUsers([userOne,userTwo, userForDelete, admin]);
        await insertCategories([categoryOne, categoryTwo, categoryForDelete]);
        await insertProducts([productOne, productTwo, productForDelete]);
        await insertOrders([orderOne, orderTwo, orderForDelete])
        await insertOrderItems([orderItemOne, orderItemTwo, orderItemThree, orderItemFour])
    });
}

export default setUpTestDB;