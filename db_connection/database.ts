import { DataSource } from "typeorm"
import { User } from "./user.entity/user"
import { TypeProduct } from "./type.entity/type.entity"
import { Product } from "./product.entity/product"
import { config } from 'dotenv'
config()
export const MysqlDataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [
        User,TypeProduct,Product
    ]
})

const UserRepository = MysqlDataSource.manager.getRepository(User)
const RegisterUser =async (ctx: any) => {
    const NewUser: User = new User();
    NewUser.Userid = ctx.chat.id;
    NewUser.first_name = ctx.chat.first_name;
    NewUser.username = ctx.chat.username || "null";
    await UserRepository.save(NewUser)
}

export {UserRepository,RegisterUser}